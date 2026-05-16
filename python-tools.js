// Python Code Tools Suite - JavaScript Engine

// Tool Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tool = this.getAttribute('data-tool');
        switchTool(tool);
    });
});

function switchTool(toolName) {
    // Hide all sections
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(toolName).classList.add('active');
    document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
}

// ===== CODE FORMATTER =====
function formatCode() {
    const input = document.getElementById('formatter-input').value;
    const output = document.getElementById('formatter-output');

    if (!input.trim()) {
        output.value = 'Please enter Python code to format.';
        return;
    }

    let formatted = input;

    // Option 1: Normalize indentation
    if (document.getElementById('indent-size').checked) {
        formatted = normalizeIndentation(formatted);
    }

    // Option 2: Remove trailing whitespace
    if (document.getElementById('remove-trailing').checked) {
        formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n');
    }

    // Option 3: Add spacing around operators
    if (document.getElementById('add-spacing').checked) {
        formatted = addOperatorSpacing(formatted);
    }

    output.value = formatted;
}

function normalizeIndentation(code) {
    const lines = code.split('\n');
    return lines.map(line => {
        const match = line.match(/^(\t+|\s+)?(.*)$/);
        if (match) {
            const indent = match[1] || '';
            const content = match[2];
            const indentLevel = indent.replace(/\t/g, '    ').length / 4;
            return '    '.repeat(indentLevel) + content;
        }
        return line;
    }).join('\n');
}

function addOperatorSpacing(code) {
    // Add spaces around operators (simple implementation)
    return code
        .replace(/([^\s])([+\-*/%=])([^\s=])/g, '$1 $2 $3')
        .replace(/([^\s])([+\-*/%=])([\s])/g, '$1 $2$3')
        .replace(/([\s])([+\-*/%=])([^\s=])/g, '$1$2 $3');
}

// ===== CODE VALIDATOR =====
function validateCode() {
    const input = document.getElementById('validator-input').value;
    const output = document.getElementById('validator-output');

    if (!input.trim()) {
        output.innerHTML = 'Please enter Python code to validate.';
        return;
    }

    const errors = [];
    const warnings = [];
    const lines = input.split('\n');

    // Check for syntax issues
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Check for unclosed parentheses/brackets
        const openParen = (line.match(/\(/g) || []).length;
        const closeParen = (line.match(/\)/g) || []).length;
        const openBracket = (line.match(/\[/g) || []).length;
        const closeBracket = (line.match(/\]/g) || []).length;

        if (openParen !== closeParen) {
            errors.push(`Line ${lineNum}: Mismatched parentheses`);
        }
        if (openBracket !== closeBracket) {
            errors.push(`Line ${lineNum}: Mismatched brackets`);
        }

        // Check for common issues
        if (line.trim().endsWith(':') && !lines[i + 1]?.match(/^\s{4,}/)) {
            warnings.push(`Line ${lineNum}: Expected indented block after colon`);
        }

        // Check for missing imports
        if (line.includes('requests') && !input.includes('import requests')) {
            warnings.push(`Line ${lineNum}: 'requests' module not imported`);
        }
    }

    // Build output
    let html = '';
    if (errors.length === 0 && warnings.length === 0) {
        html = '<div class="status-message success">✓ No syntax errors found!</div>';
        output.className = 'output-box success';
    } else {
        output.className = 'output-box';
    }

    if (errors.length > 0) {
        html += '<strong style="color: #f44336;">❌ Errors (' + errors.length + '):</strong>\n';
        errors.forEach(err => html += '  • ' + err + '\n');
    }

    if (warnings.length > 0) {
        html += '<strong style="color: #ff9800;">⚠ Warnings (' + warnings.length + '):</strong>\n';
        warnings.forEach(warn => html += '  • ' + warn + '\n');
    }

    output.innerHTML = html;
}

// ===== TYPE CONVERTER =====
function convertType() {
    const input = document.getElementById('converter-input').value;
    const inputType = document.getElementById('input-type').value;
    const outputType = document.getElementById('output-type').value;
    const output = document.getElementById('converter-output');

    if (!input.trim()) {
        output.value = 'Please enter data to convert.';
        return;
    }

    try {
        let data;

        // Parse input
        if (inputType === 'json') {
            data = JSON.parse(input);
        } else if (inputType === 'dict') {
            data = parsePythonDict(input);
        } else if (inputType === 'list') {
            data = JSON.parse('[' + input + ']');
        } else if (inputType === 'csv') {
            data = parseCSV(input);
        }

        // Convert to output format
        let result;
        if (outputType === 'json') {
            result = JSON.stringify(data, null, 2);
        } else if (outputType === 'dict') {
            result = convertToDict(data);
        } else if (outputType === 'list') {
            result = convertToList(data);
        } else if (outputType === 'csv') {
            result = convertToCSV(data);
        }

        output.value = result;
    } catch (e) {
        output.value = 'Error: ' + e.message;
    }
}

function parsePythonDict(str) {
    // Simple Python dict to JSON conversion
    let json = str.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
    return JSON.parse(json);
}

function parseCSV(str) {
    const lines = str.trim().split('\n');
    const data = [];
    lines.forEach(line => {
        data.push(line.split(',').map(item => item.trim()));
    });
    return data;
}

function convertToDict(data) {
    return JSON.stringify(data).replace(/"/g, "'");
}

function convertToList(data) {
    if (Array.isArray(data)) {
        return JSON.stringify(data);
    }
    return JSON.stringify([data]);
}

function convertToCSV(data) {
    if (Array.isArray(data)) {
        return data.map(row => {
            if (Array.isArray(row)) {
                return row.join(',');
            }
            return row;
        }).join('\n');
    }
    return '';
}

// ===== CODE PARSER =====
function parseCode() {
    const input = document.getElementById('parser-input').value;
    const output = document.getElementById('parser-output');

    if (!input.trim()) {
        output.innerHTML = 'Please enter Python code to parse.';
        return;
    }

    const lines = input.split('\n');
    let html = '';
    html += '<strong>Classes:</strong>\n';
    let classCount = 0;
    lines.forEach((line, i) => {
        if (line.trim().startsWith('class ')) {
            const match = line.match(/class\s+(\w+)/);
            if (match) {
                html += `  • ${match[1]} (line ${i + 1})\n`;
                classCount++;
            }
        }
    });
    if (classCount === 0) html += '  (None found)\n';

    html += '\n<strong>Functions:</strong>\n';
    let funcCount = 0;
    lines.forEach((line, i) => {
        if (line.trim().startsWith('def ')) {
            const match = line.match(/def\s+(\w+)/);
            if (match) {
                html += `  • ${match[1]}() (line ${i + 1})\n`;
                funcCount++;
            }
        }
    });
    if (funcCount === 0) html += '  (None found)\n';

    html += '\n<strong>Imports:</strong>\n';
    let importCount = 0;
    lines.forEach((line, i) => {
        if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
            html += `  • ${line.trim()} (line ${i + 1})\n`;
            importCount++;
        }
    });
    if (importCount === 0) html += '  (None found)\n';

    output.className = 'output-box success';
    output.innerHTML = html;
}

// ===== BOILERPLATE GENERATOR =====
function generateTemplate() {
    const templateType = document.getElementById('template-type').value;
    const name = document.getElementById('template-name').value || 'MyClass';
    const output = document.getElementById('generator-output');

    let template = '';

    switch (templateType) {
        case 'class':
            template = generateClass(name);
            break;
        case 'function':
            template = generateFunction(name);
            break;
        case 'decorator':
            template = generateDecorator(name);
            break;
        case 'exception':
            template = generateException(name);
            break;
        case 'context':
            template = generateContextManager(name);
            break;
        case 'main':
            template = generateMainScript(name);
            break;
    }

    output.value = template;
}

function generateClass(name) {
    return `class ${name}:
    """${name} class description."""

    def __init__(self, *args, **kwargs):
        """Initialize ${name}."""
        self.args = args
        self.kwargs = kwargs

    def __str__(self):
        """String representation."""
        return f"${name}(...)"

    def __repr__(self):
        """Developer representation."""
        return self.__str__()

    def method(self, param):
        """Method description.
        
        Args:
            param: Parameter description.
        
        Returns:
            Return value description.
        """
        pass


if __name__ == "__main__":
    obj = ${name}()
    print(obj)`;
}

function generateFunction(name) {
    return `def ${name}(*args, **kwargs):
    """Function description.
    
    Args:
        *args: Variable length argument list.
        **kwargs: Arbitrary keyword arguments.
    
    Returns:
        Return value description.
    
    Raises:
        ValueError: When invalid input is provided.
    """
    try:
        # Implementation here
        pass
    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    result = ${name}()
    print(result)`;
}

function generateDecorator(name) {
    return `def ${name}(func):
    """Decorator description."""
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper


@${name}
def example_function(x):
    return x * 2


if __name__ == "__main__":
    print(example_function(5))`;
}

function generateException(name) {
    return `class ${name}(Exception):
    """Custom exception class."""
    
    def __init__(self, message: str = None, code: int = None):
        """Initialize custom exception.
        
        Args:
            message: Exception message.
            code: Error code.
        """
        self.message = message or "An error occurred"
        self.code = code or 1
        super().__init__(self.message)
    
    def __str__(self):
        return f"[{self.code}] {self.message}"


# Usage example
try:
    raise ${name}("Something went wrong", 500)
except ${name} as e:
    print(f"Caught: {e}")`;
}

function generateContextManager(name) {
    return `class ${name}:
    """Context manager description."""
    
    def __init__(self, *args, **kwargs):
        """Initialize context manager."""
        self.args = args
        self.kwargs = kwargs
    
    def __enter__(self):
        """Enter context."""
        print(f"Entering {self.__class__.__name__}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context."""
        print(f"Exiting {self.__class__.__name__}")
        return False


# Usage example
with ${name}() as context:
    print("Inside context")`;
}

function generateMainScript(name) {
    return `#!/usr/bin/env python3
"""${name} - Script description."""

import sys
import logging
from pathlib import Path


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main(args=None):
    """Main entry point."""
    logger.info("Starting ${name}")
    
    try:
        # Main logic here
        pass
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return 1
    
    logger.info("${name} completed successfully")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))`;
}

function updateTemplate() {
    const templateType = document.getElementById('template-type').value;
    const nameInput = document.getElementById('template-name');
    
    const defaults = {
        'class': 'MyClass',
        'function': 'my_function',
        'decorator': 'my_decorator',
        'exception': 'CustomException',
        'context': 'MyContext',
        'main': 'my_script'
    };
    
    nameInput.placeholder = `e.g., ${defaults[templateType]}`;
}

// ===== DEBUG HELPER =====
function generateDebug() {
    const debugType = document.getElementById('debug-type').value;
    const varName = document.getElementById('debug-var').value || 'variable';
    const output = document.getElementById('debugger-output');

    let debug = '';

    switch (debugType) {
        case 'print':
            debug = `print(f"DEBUG: ${varName} = {${varName}}")
print(f"DEBUG: type(${varName}) = {type(${varName})}")\nprint(f"DEBUG: ${varName}.__dict__ = {${varName}.__dict__}")`;
            break;
        case 'logging':
            debug = `import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Usage
logger.debug(f"${varName} = {${varName}}")`;
            break;
        case 'try-except':
            debug = `try:
    # Your code here
    pass
except TypeError as e:
    print(f"TypeError: {e}")
    import traceback
    traceback.print_exc()
except ValueError as e:
    print(f"ValueError: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
    raise`;
            break;
        case 'traceback':
            debug = `import traceback
import sys

try:
    # Your code here
    pass
except Exception as e:
    print(f"Exception: {e}")
    print("\nFull traceback:")
    traceback.print_exc()
    print(f"\nException info: {sys.exc_info()}")`;
            break;
    }

    output.value = debug;
}

// ===== UTILITY FUNCTIONS =====
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).value;
    navigator.clipboard.writeText(text).then(() => {
        alert('✓ Copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}

// Initialize
window.addEventListener('load', () => {
    console.log('Python Code Tools Suite loaded!');
});