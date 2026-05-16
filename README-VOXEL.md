# 🎮 3D Voxel Mining Game

A fully functional 3D mining game built with Three.js featuring real gameplay mechanics.

## Features

✨ **Real Gameplay:**
- First-person mining mechanics
- Progressive difficulty levels
- Resource gathering (Stone, Gold, Diamond)
- Depth-based progression system
- Mining power increases with level

🎮 **Controls:**
- **WASD** - Move forward/backward/strafe
- **SPACE** - Jump
- **Mouse** - Look around (click to lock)
- **Mouse Click** - Mine blocks

🌍 **Game World:**
- 32x128 voxel terrain
- Procedurally generated layers
- Different block types with unique properties
- Dynamic mesh generation with face culling
- Fog and shadow rendering

⛏️ **Mining System:**
- **Level 1:** Mine stone only
- **Level 2:** Mine stone + gold (at 20m depth)
- **Level 3:** Mine all resources (at 40m depth)

📊 **Progression:**
- Track resources collected
- Monitor current depth
- Level up automatically based on depth
- Real-time inventory system

## How to Play

1. Open `voxel-mining.html` in a web browser
2. Click to lock mouse pointer
3. Use WASD to move and mouse to look around
4. Click to mine blocks in front of you
5. Dig deeper to find valuable resources
6. Level up to unlock better mining capabilities

## Technical Details

- **Engine:** Three.js (WebGL)
- **Terrain:** Voxel-based world with 32x128x32 blocks
- **Rendering:** Optimized mesh generation with face culling
- **Physics:** Simple gravity and collision detection
- **Graphics:** Real-time shadows and ambient lighting

## Browser Requirements

- Modern browser with WebGL support
- Minimum: Chrome 60+, Firefox 55+, Safari 12+

Enjoy mining! ⛏️✨