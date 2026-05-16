// 3D Voxel Mining Game with Three.js

let scene, camera, renderer;
let world = {};
let player = {
    position: new THREE.Vector3(16, 64, 16),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.3,
    jumpForce: 0.8,
    isJumping: false,
    resources: {
        stone: 0,
        gold: 0,
        diamond: 0
    },
    level: 1,
    depth: 0
};

const CHUNK_SIZE = 32;
const WORLD_HEIGHT = 128;
const BLOCK_SIZE = 1;

const BLOCK_TYPES = {
    AIR: 0,
    STONE: 1,
    GOLD: 2,
    DIAMOND: 3,
    BEDROCK: 4,
    DIRT: 5
};

const BLOCK_COLORS = {
    0: 0x87CEEB,  // Air (sky)
    1: 0x808080,  // Stone
    2: 0xFFD700,  // Gold
    3: 0x00FFFF,  // Diamond
    4: 0x2F4F4F,  // Bedrock
    5: 0x8B4513   // Dirt
};

const MINING_POWER = {
    1: { stone: 1, gold: 0, diamond: 0 },
    2: { stone: 2, gold: 1, diamond: 0 },
    3: { stone: 3, gold: 2, diamond: 1 }
};

let keys = {};
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let gravity = 0.02;
let isGrounded = false;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 200, 300);

    // Camera setup (First-person)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(player.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Generate world
    generateWorld();

    // Input handling
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    // Pointer lock
    document.addEventListener('click', () => {
        renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
        renderer.domElement.requestPointerLock();
    });

    // Add crosshair
    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    document.body.appendChild(crosshair);

    // Start game loop
    gameLoop();
}

function generateWorld() {
    // Generate terrain with Perlin-like noise (simplified)
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            let surfaceHeight = 80;
            
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                let blockType = BLOCK_TYPES.AIR;

                if (y < 20) {
                    blockType = BLOCK_TYPES.BEDROCK;
                } else if (y < surfaceHeight - 5) {
                    // Deep stone layer
                    if (Math.random() < 0.05) blockType = BLOCK_TYPES.GOLD;
                    else if (Math.random() < 0.02) blockType = BLOCK_TYPES.DIAMOND;
                    else blockType = BLOCK_TYPES.STONE;
                } else if (y < surfaceHeight) {
                    blockType = BLOCK_TYPES.DIRT;
                } else if (y === surfaceHeight) {
                    blockType = BLOCK_TYPES.DIRT;
                }

                const key = `${x},${y},${z}`;
                world[key] = blockType;
            }
        }
    }
    
    renderWorld();
}

function renderWorld() {
    // Remove old meshes
    scene.children = scene.children.filter(obj => {
        if (obj.geometry && obj.geometry.dispose) {
            obj.geometry.dispose();
            obj.material.dispose();
            return false;
        }
        return true;
    });

    // Create geometry for visible blocks
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let key in world) {
        if (world[key] === BLOCK_TYPES.AIR) continue;

        const [x, y, z] = key.split(',').map(Number);
        const blockType = world[key];
        const color = BLOCK_COLORS[blockType];

        // Only render visible faces (simple culling)
        addBlockGeometry(x, y, z, vertices, colors, color);
    }

    if (vertices.length > 0) {
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            wireframe: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    }
}

function addBlockGeometry(x, y, z, vertices, colors, color) {
    const size = BLOCK_SIZE;
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    // Check neighbors for face culling
    const hasLeft = world[`${x-1},${y},${z}`] !== BLOCK_TYPES.AIR && world[`${x-1},${y},${z}`] !== undefined;
    const hasRight = world[`${x+1},${y},${z}`] !== BLOCK_TYPES.AIR && world[`${x+1},${y},${z}`] !== undefined;
    const hasTop = world[`${x},${y+1},${z}`] !== BLOCK_TYPES.AIR && world[`${x},${y+1},${z}`] !== undefined;
    const hasBottom = world[`${x},${y-1},${z}`] !== BLOCK_TYPES.AIR && world[`${x},${y-1},${z}`] !== undefined;
    const hasFront = world[`${x},${y},${z-1}`] !== BLOCK_TYPES.AIR && world[`${x},${y},${z-1}`] !== undefined;
    const hasBack = world[`${x},${y},${z+1}`] !== BLOCK_TYPES.AIR && world[`${x},${y},${z+1}`] !== undefined;

    // Right face
    if (!hasRight) {
        addFace(x + size, y, z, vertices, colors, r, g, b, 'x');
    }
    // Left face
    if (!hasLeft) {
        addFace(x, y, z, vertices, colors, r, g, b, 'x');
    }
    // Top face
    if (!hasTop) {
        addFace(x, y + size, z, vertices, colors, r, g, b, 'y');
    }
    // Bottom face
    if (!hasBottom) {
        addFace(x, y, z, vertices, colors, r, g, b, 'y');
    }
    // Back face
    if (!hasBack) {
        addFace(x, y, z + size, vertices, colors, r, g, b, 'z');
    }
    // Front face
    if (!hasFront) {
        addFace(x, y, z, vertices, colors, r, g, b, 'z');
    }
}

function addFace(x, y, z, vertices, colors, r, g, b, axis) {
    const size = BLOCK_SIZE;
    const startIdx = vertices.length / 3;

    if (axis === 'x') {
        vertices.push(x, y, z, x, y + size, z, x, y + size, z + size, x, y, z + size);
    } else if (axis === 'y') {
        vertices.push(x, y, z, x + size, y, z, x + size, y, z + size, x, y, z + size);
    } else if (axis === 'z') {
        vertices.push(x, y, z, x + size, y, z, x + size, y + size, z, x, y + size, z);
    }

    // Add colors
    for (let i = 0; i < 4; i++) {
        colors.push(r, g, b);
    }
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // Player movement
    const moveVector = new THREE.Vector3();
    if (keys['w']) moveVector.z -= 1;
    if (keys['s']) moveVector.z += 1;
    if (keys['a']) moveVector.x -= 1;
    if (keys['d']) moveVector.x += 1;

    if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(player.speed);
        player.position.x += moveVector.x;
        player.position.z += moveVector.z;
    }

    // Gravity
    if (!isGrounded) {
        player.velocity.y -= gravity;
    } else {
        player.velocity.y = 0;
        // Jump
        if (keys[' ']) {
            player.velocity.y = player.jumpForce;
            isGrounded = false;
        }
    }

    player.position.y += player.velocity.y;

    // Ground collision
    const key = `${Math.floor(player.position.x)},${Math.floor(player.position.y - 2)},${Math.floor(player.position.z)}`;
    if (world[key] && world[key] !== BLOCK_TYPES.AIR) {
        isGrounded = true;
        player.position.y = Math.floor(player.position.y) + 2.5;
    } else {
        isGrounded = false;
    }

    // Boundary checking
    player.position.x = Math.max(1, Math.min(CHUNK_SIZE - 1, player.position.x));
    player.position.z = Math.max(1, Math.min(CHUNK_SIZE - 1, player.position.z));
    player.position.y = Math.max(10, Math.min(WORLD_HEIGHT - 5, player.position.y));

    // Update depth
    player.depth = Math.floor(80 - player.position.y);

    // Update camera
    camera.position.copy(player.position);
    camera.position.y += 1.6; // Eye height

    // Update level based on depth
    player.level = Math.max(1, Math.floor(player.depth / 20) + 1);

    // Update UI
    updateUI();

    renderer.render(scene, camera);
}

function onMouseMove(event) {
    if (document.pointerLockElement === renderer.domElement) {
        camera.rotation.order = 'YXZ';
        camera.rotation.y -= event.movementX * 0.001;
        camera.rotation.x -= event.movementY * 0.001;

        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }
}

function onMouseClick(event) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const direction = raycaster.ray.direction;
    const distance = 5; // Mining range

    const targetPos = new THREE.Vector3(
        camera.position.x + direction.x * distance,
        camera.position.y + direction.y * distance,
        camera.position.z + direction.z * distance
    );

    const blockX = Math.floor(targetPos.x);
    const blockY = Math.floor(targetPos.y);
    const blockZ = Math.floor(targetPos.z);

    const key = `${blockX},${blockY},${blockZ}`;
    const blockType = world[key];

    if (blockType && blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.BEDROCK) {
        // Mine block
        const power = MINING_POWER[Math.min(player.level, 3)];
        
        if (blockType === BLOCK_TYPES.STONE && power.stone > 0) {
            player.resources.stone += power.stone;
            world[key] = BLOCK_TYPES.AIR;
        } else if (blockType === BLOCK_TYPES.GOLD && power.gold > 0) {
            player.resources.gold += power.gold;
            world[key] = BLOCK_TYPES.AIR;
        } else if (blockType === BLOCK_TYPES.DIAMOND && power.diamond > 0) {
            player.resources.diamond += power.diamond;
            world[key] = BLOCK_TYPES.AIR;
        } else if (blockType === BLOCK_TYPES.DIRT) {
            world[key] = BLOCK_TYPES.AIR;
        }

        renderWorld();
    }
}

function updateUI() {
    document.getElementById('stone').textContent = player.resources.stone;
    document.getElementById('gold').textContent = player.resources.gold;
    document.getElementById('diamond').textContent = player.resources.diamond;
    document.getElementById('level').textContent = player.level;
    document.getElementById('depth').textContent = Math.max(0, player.depth);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start game
init();