// Advanced Code Parser for Multiple Languages
class CodeParser {
    constructor(language) {
        this.language = language;
        this.patterns = this.getLanguagePatterns(language);
    }

    getLanguagePatterns(language) {
        const patterns = {
            javascript: {
                variable: /^\s*(let|const|var)\s+(\w+)/,
                function: /^\s*function\s+(\w+)\s*\(/,
                if: /^\s*if\s*\(/,
                for: /^\s*for\s*\(/,
                while: /^\s*while\s*\(/,
                return: /^\s*return\b/,
                assignment: /^\s*(\w+)\s*=/,
                comment: /^\s*(\/\/|\/\*)/,
                import: /^\s*import\b/,
                export: /^\s*export\b/
            },
            python: {
                variable: /^\s*(\w+)\s*=/,
                function: /^\s*def\s+(\w+)\s*\(/,
                if: /^\s*if\s+/,
                for: /^\s*for\s+/,
                while: /^\s*while\s+/,
                return: /^\s*return\b/,
                comment: /^\s*#/,
                import: /^\s*(import|from)\s+/,
                class: /^\s*class\s+(\w+)/
            },
            java: {
                variable: /^\s*(int|float|double|String|boolean|char)\s+(\w+)/,
                function: /^\s*(public|private|protected)?\s*(static)?\s*\w+\s+(\w+)\s*\(/,
                if: /^\s*if\s*\(/,
                for: /^\s*for\s*\(/,
                while: /^\s*while\s*\(/,
                return: /^\s*return\b/,
                comment: /^\s*(\/\/|\/\*)/,
                import: /^\s*import\s+/,
                class: /^\s*(public|private)?\s*class\s+(\w+)/
            },
            cpp: {
                variable: /^\s*(int|float|double|string|char|bool)\s+(\w+)/,
                function: /^\s*\w+\s+(\w+)\s*\(/,
                if: /^\s*if\s*\(/,
                for: /^\s*for\s*\(/,
                while: /^\s*while\s*\(/,
                return: /^\s*return\b/,
                comment: /^\s*(\/\/|\/\*)/,
                include: /^\s*#include/
            }
        };
        return patterns[language] || patterns.javascript;
    }

    parseCode(code) {
        const lines = code.split('\n');
        const analysis = {
            language: this.language,
            totalLines: lines.length,
            statements: [],
            variables: new Set(),
            functions: new Set(),
            controlStructures: [],
            complexity: 0
        };

        let lineNumber = 0;
        let indentLevel = 0;
        let inFunction = false;
        let currentFunction = null;

        for (const line of lines) {
            lineNumber++;
            const trimmedLine = line.trim();
            
            if (!trimmedLine || this.isComment(trimmedLine)) {
                continue;
            }

            const indent = this.getIndentation(line);
            indentLevel = Math.floor(indent / 2); // Assuming 2-space indentation

            const statement = this.analyzeLine(trimmedLine, lineNumber, indentLevel);
            
            if (statement) {
                analysis.statements.push(statement);
                
                // Track variables
                if (statement.variables) {
                    statement.variables.forEach(v => analysis.variables.add(v));
                }

                // Track functions
                if (statement.type === 'function') {
                    analysis.functions.add(statement.name);
                    inFunction = true;
                    currentFunction = statement.name;
                }

                // Track control structures for complexity
                if (['if', 'for', 'while', 'switch'].includes(statement.type)) {
                    analysis.controlStructures.push(statement);
                    analysis.complexity++;
                }
            }
        }

        return analysis;
    }

    analyzeLine(line, lineNumber, indentLevel) {
        // Variable declaration or assignment
        if (this.patterns.variable && this.patterns.variable.test(line)) {
            const match = line.match(this.patterns.variable);
            const variableName = match[2] || match[1];
            
            return {
                type: 'variable',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                name: variableName,
                variables: [variableName],
                description: `Declare/assign variable: ${variableName}`
            };
        }

        // Function definition
        if (this.patterns.function && this.patterns.function.test(line)) {
            const match = line.match(this.patterns.function);
            const functionName = match[1] || match[3]; // Different capturing groups for different languages
            
            return {
                type: 'function',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                name: functionName,
                description: `Define function: ${functionName}`
            };
        }

        // Conditional statements
        if (this.patterns.if && this.patterns.if.test(line)) {
            const condition = this.extractCondition(line);
            
            return {
                type: 'if',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                condition: condition,
                description: `Conditional: ${condition}`
            };
        }

        // For loops
        if (this.patterns.for && this.patterns.for.test(line)) {
            const loopInfo = this.extractLoopInfo(line, 'for');
            
            return {
                type: 'for',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                loopVar: loopInfo.variable,
                variables: loopInfo.variables,
                description: `For loop: ${loopInfo.description}`
            };
        }

        // While loops
        if (this.patterns.while && this.patterns.while.test(line)) {
            const condition = this.extractCondition(line);
            
            return {
                type: 'while',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                condition: condition,
                description: `While loop: ${condition}`
            };
        }

        // Return statements
        if (this.patterns.return && this.patterns.return.test(line)) {
            return {
                type: 'return',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                description: 'Return from function'
            };
        }

        // Function calls or general statements
        const functionCall = this.extractFunctionCall(line);
        if (functionCall) {
            return {
                type: 'call',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                function: functionCall.name,
                arguments: functionCall.args,
                description: `Call function: ${functionCall.name}`
            };
        }

        // Assignment (for languages without explicit variable declaration)
        if (this.patterns.assignment && this.patterns.assignment.test(line) && !this.patterns.variable.test(line)) {
            const match = line.match(this.patterns.assignment);
            const variableName = match[1];
            
            return {
                type: 'assignment',
                line: lineNumber,
                indent: indentLevel,
                code: line,
                variable: variableName,
                variables: [variableName],
                description: `Assign to: ${variableName}`
            };
        }

        // Generic statement
        return {
            type: 'statement',
            line: lineNumber,
            indent: indentLevel,
            code: line,
            description: `Execute: ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`
        };
    }

    isComment(line) {
        if (this.patterns.comment) {
            return this.patterns.comment.test(line);
        }
        return false;
    }

    getIndentation(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    extractCondition(line) {
        const patterns = {
            parentheses: /\((.*?)\)/,
            python_style: /^\s*(if|while|elif)\s+(.*?):/
        };

        if (this.language === 'python') {
            const match = line.match(patterns.python_style);
            return match ? match[2] : 'condition';
        } else {
            const match = line.match(patterns.parentheses);
            return match ? match[1] : 'condition';
        }
    }

    extractLoopInfo(line, loopType) {
        if (this.language === 'python') {
            // Python for loop: for var in iterable:
            const match = line.match(/for\s+(\w+)\s+in\s+(.*?):/);
            if (match) {
                return {
                    variable: match[1],
                    variables: [match[1]],
                    description: `${match[1]} in ${match[2]}`
                };
            }
        } else {
            // C-style for loop: for (init; condition; update)
            const match = line.match(/for\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)/);
            if (match) {
                const initVar = match[1].match(/(\w+)/);
                return {
                    variable: initVar ? initVar[1] : 'i',
                    variables: initVar ? [initVar[1]] : ['i'],
                    description: `${match[1]}; ${match[2]}; ${match[3]}`
                };
            }
        }

        return {
            variable: 'i',
            variables: ['i'],
            description: 'loop iteration'
        };
    }

    extractFunctionCall(line) {
        const match = line.match(/(\w+)\s*\((.*?)\)/);
        if (match && !this.patterns.function.test(line) && !this.patterns.if.test(line)) {
            return {
                name: match[1],
                args: match[2] ? match[2].split(',').map(arg => arg.trim()) : []
            };
        }
        return null;
    }

    calculateComplexity(statements) {
        let complexity = 1; // Base complexity
        
        for (const statement of statements) {
            if (['if', 'for', 'while', 'switch', 'case'].includes(statement.type)) {
                complexity++;
            }
            if (statement.type === 'if' && statement.code.includes('&&' || '||')) {
                complexity++; // Additional complexity for compound conditions
            }
        }
        
        return complexity;
    }

    generateFlowchartData(statements) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start node
        nodes.push({
            id: `node${nodeId++}`,
            type: 'start',
            label: 'START',
            shape: 'ellipse'
        });

        let currentNode = nodes[0].id;

        for (const statement of statements) {
            const node = {
                id: `node${nodeId++}`,
                type: statement.type,
                label: this.getNodeLabel(statement),
                shape: this.getNodeShape(statement.type),
                statement: statement
            };

            nodes.push(node);
            edges.push({
                from: currentNode,
                to: node.id,
                label: ''
            });

            currentNode = node.id;

            // Handle conditional branches
            if (statement.type === 'if') {
                // Create true/false branches
                const trueNode = {
                    id: `node${nodeId++}`,
                    type: 'process',
                    label: 'True Branch',
                    shape: 'rect'
                };
                
                const falseNode = {
                    id: `node${nodeId++}`,
                    type: 'process',
                    label: 'False Branch',
                    shape: 'rect'
                };

                nodes.push(trueNode, falseNode);
                
                edges.push(
                    { from: node.id, to: trueNode.id, label: 'Yes' },
                    { from: node.id, to: falseNode.id, label: 'No' }
                );
            }
        }

        // End node
        nodes.push({
            id: `node${nodeId}`,
            type: 'end',
            label: 'END',
            shape: 'ellipse'
        });

        edges.push({
            from: currentNode,
            to: nodes[nodes.length - 1].id,
            label: ''
        });

        return { nodes, edges };
    }

    getNodeLabel(statement) {
        const maxLength = 30;
        let label = '';

        switch (statement.type) {
            case 'variable':
            case 'assignment':
                label = `${statement.name || statement.variable} = ?`;
                break;
            case 'function':
                label = `${statement.name}()`;
                break;
            case 'if':
                label = statement.condition;
                break;
            case 'for':
            case 'while':
                label = statement.description;
                break;
            case 'call':
                label = `${statement.function}()`;
                break;
            case 'return':
                label = 'Return';
                break;
            default:
                label = statement.code;
        }

        return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
    }

    getNodeShape(type) {
        const shapes = {
            'start': 'ellipse',
            'end': 'ellipse',
            'if': 'diamond',
            'for': 'diamond',
            'while': 'diamond',
            'function': 'rect',
            'variable': 'rect',
            'assignment': 'rect',
            'call': 'rect',
            'return': 'rect',
            'statement': 'rect'
        };
        return shapes[type] || 'rect';
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeParser;
} else {
    window.CodeParser = CodeParser;
}