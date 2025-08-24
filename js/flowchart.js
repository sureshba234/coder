// Advanced Flowchart Generator
class FlowchartGenerator {
    constructor() {
        this.nodeCounter = 1;
        this.mermaidCode = '';
    }

    generateFromAnalysis(analysis) {
        this.nodeCounter = 1;
        this.mermaidCode = 'flowchart TD\n';
        
        const nodes = this.createNodes(analysis.statements);
        const connections = this.createConnections(nodes, analysis.statements);
        
        // Add all nodes to mermaid code
        nodes.forEach(node => {
            this.addNode(node);
        });
        
        // Add all connections
        connections.forEach(connection => {
            this.addConnection(connection);
        });
        
        // Add styling
        this.addStyling();
        
        return this.mermaidCode;
    }

    createNodes(statements) {
        const nodes = [];
        
        // Start node
        nodes.push({
            id: `A${this.nodeCounter++}`,
            type: 'start',
            label: 'START',
            shape: 'ellipse',
            class: 'startEnd'
        });

        let previousNode = nodes[0];
        let conditionalStack = []; // Stack to handle nested conditions
        let loopStack = []; // Stack to handle nested loops

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const node = this.createNodeFromStatement(statement, i);
            
            if (node) {
                nodes.push(node);

                // Handle different types of control flow
                switch (statement.type) {
                    case 'if':
                        this.handleConditionalNode(node, statement, nodes, conditionalStack);
                        break;
                    case 'for':
                    case 'while':
                        this.handleLoopNode(node, statement, nodes, loopStack);
                        break;
                    case 'return':
                        // Return statements should connect to end
                        node.connectsToEnd = true;
                        break;
                    default:
                        node.previous = previousNode;
                }

                previousNode = node;
            }
        }

        // End node
        const endNode = {
            id: `A${this.nodeCounter++}`,
            type: 'end',
            label: 'END',
            shape: 'ellipse',
            class: 'startEnd'
        };
        nodes.push(endNode);

        return nodes;
    }

    createNodeFromStatement(statement, index) {
        const nodeId = `A${this.nodeCounter++}`;
        let nodeClass = 'process';
        let shape = 'rect';
        let label = this.generateNodeLabel(statement);

        // Determine node type and styling
        switch (statement.type) {
            case 'if':
                shape = 'diamond';
                nodeClass = 'condition';
                break;
            case 'for':
            case 'while':
                shape = 'diamond';
                nodeClass = 'condition';
                label = `Loop: ${label}`;
                break;
            case 'function':
                nodeClass = 'function';
                label = `📋 ${label}`;
                break;
            case 'variable':
            case 'assignment':
                nodeClass = 'assignment';
                label = `📝 ${label}`;
                break;
            case 'call':
                nodeClass = 'process';
                label = `⚙️ ${label}`;
                break;
            case 'return':
                nodeClass = 'return';
                label = `↩️ ${label}`;
                break;
        }

        return {
            id: nodeId,
            type: statement.type,
            label: label,
            shape: shape,
            class: nodeClass,
            statement: statement,
            index: index
        };
    }

    generateNodeLabel(statement) {
        const maxLength = 25;
        let label = '';

        switch (statement.type) {
            case 'variable':
                label = `${statement.name} = value`;
                break;
            case 'assignment':
                label = `${statement.variable} = value`;
                break;
            case 'function':
                label = `function ${statement.name}()`;
                break;
            case 'if':
                label = statement.condition || 'condition';
                break;
            case 'for':
                label = statement.loopVar ? `for ${statement.loopVar}` : 'for loop';
                break;
            case 'while':
                label = statement.condition || 'while condition';
                break;
            case 'call':
                label = `${statement.function}()`;
                break;
            case 'return':
                label = 'return';
                break;
            default:
                label = statement.code;
        }

        // Truncate long labels
        if (label.length > maxLength) {
            label = label.substring(0, maxLength - 3) + '...';
        }

        // Escape special characters for Mermaid
        label = label.replace(/"/g, '\\"').replace(/\n/g, ' ');

        return label;
    }

    handleConditionalNode(node, statement, nodes, conditionalStack) {
        // Create YES/NO branches for conditional
        node.hasConditionalBranches = true;
        node.yesBranch = null;
        node.noBranch = null;
        
        conditionalStack.push({
            node: node,
            statement: statement,
            hasElse: this.checkForElse(statement, nodes)
        });
    }

    handleLoopNode(node, statement, nodes, loopStack) {
        // Loop node should connect back to itself for iteration
        node.hasLoopBack = true;
        node.loopExit = null;
        
        loopStack.push({
            node: node,
            statement: statement
        });
    }

    checkForElse(statement, nodes) {
        // Simple check - in a real implementation, you'd parse the AST
        return statement.code.toLowerCase().includes('else') || 
               nodes.some(n => n.statement && n.statement.code.toLowerCase().includes('else'));
    }

    createConnections(nodes, statements) {
        const connections = [];
        
        for (let i = 0; i < nodes.length - 1; i++) {
            const currentNode = nodes[i];
            const nextNode = nodes[i + 1];

            if (currentNode.type === 'start') {
                connections.push({
                    from: currentNode.id,
                    to: nextNode.id,
                    label: ''
                });
            } else if (currentNode.type === 'if') {
                // Conditional branches
                connections.push({
                    from: currentNode.id,
                    to: nextNode.id,
                    label: 'Yes',
                    style: 'stroke:#27ae60,stroke-width:2px'
                });
                
                // Find the corresponding else or end
                const elseTarget = this.findElseTarget(currentNode, nodes, i);
                connections.push({
                    from: currentNode.id,
                    to: elseTarget,
                    label: 'No',
                    style: 'stroke:#e74c3c,stroke-width:2px'
                });
            } else if (currentNode.type === 'for' || currentNode.type === 'while') {
                // Loop connections
                connections.push({
                    from: currentNode.id,
                    to: nextNode.id,
                    label: 'Continue',
                    style: 'stroke:#3498db,stroke-width:2px'
                });
                
                // Exit condition
                const exitTarget = this.findLoopExit(currentNode, nodes, i);
                connections.push({
                    from: currentNode.id,
                    to: exitTarget,
                    label: 'Exit',
                    style: 'stroke:#e74c3c,stroke-width:2px'
                });
                
                // Loop back connection
                const loopBack = this.findLoopBack(currentNode, nodes, i);
                if (loopBack) {
                    connections.push({
                        from: loopBack,
                        to: currentNode.id,
                        label: 'Loop',
                        style: 'stroke:#f39c12,stroke-width:2px,stroke-dasharray: 5 5'
                    });
                }
            } else if (currentNode.connectsToEnd) {
                // Return statements connect to end
                const endNode = nodes[nodes.length - 1];
                connections.push({
                    from: currentNode.id,
                    to: endNode.id,
                    label: ''
                });
            } else if (currentNode.type !== 'end') {
                // Regular sequential connection
                connections.push({
                    from: currentNode.id,
                    to: nextNode.id,
                    label: ''
                });
            }
        }

        return connections;
    }

    findElseTarget(conditionNode, nodes, currentIndex) {
        // Simple heuristic: find next node at same or lower indentation level
        const currentIndent = conditionNode.statement.indent;
        
        for (let i = currentIndex + 2; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.statement && node.statement.indent <= currentIndent) {
                return node.id;
            }
        }
        
        return nodes[nodes.length - 1].id; // End node as fallback
    }

    findLoopExit(loopNode, nodes, currentIndex) {
        // Find the end of the loop block
        const currentIndent = loopNode.statement.indent;
        
        for (let i = currentIndex + 2; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.statement && node.statement.indent <= currentIndent) {
                return node.id;
            }
        }
        
        return nodes[nodes.length - 1].id; // End node as fallback
    }

    findLoopBack(loopNode, nodes, currentIndex) {
        // Find the last node in the loop body
        const currentIndent = loopNode.statement.indent;
        let lastInLoop = null;
        
        for (let i = currentIndex + 1; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.statement && node.statement.indent > currentIndent) {
                lastInLoop = node.id;
            } else {
                break;
            }
        }
        
        return lastInLoop;
    }

    addNode(node) {
        const shapeChars = this.getShapeCharacters(node.shape);
        this.mermaidCode += `    ${node.id}${shapeChars.start}"${node.label}"${shapeChars.end}\n`;
    }

    addConnection(connection) {
        let arrow = '-->';
        let label = '';
        
        if (connection.label) {
            label = `|"${connection.label}"|`;
        }
        
        this.mermaidCode += `    ${connection.from} ${arrow}${label} ${connection.to}\n`;
        
        if (connection.style) {
            this.mermaidCode += `    linkStyle ${this.getLinkIndex()} ${connection.style}\n`;
        }
    }

    getShapeCharacters(shape) {
        const shapes = {
            'rect': { start: '[', end: ']' },
            'ellipse': { start: '(', end: ')' },
            'diamond': { start: '{', end: '}' },
            'circle': { start: '((', end: '))' },
            'hexagon': { start: '{{', end: '}}' }
        };
        return shapes[shape] || shapes.rect;
    }

    getLinkIndex() {
        // This is a simplified approach - in reality, you'd track link indices
        return Math.floor(Math.random() * 100);
    }

    addStyling() {
        this.mermaidCode += `
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#27ae60,stroke-width:3px,color:#000
    classDef condition fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
    classDef process fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef function fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000
    classDef assignment fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000
    classDef return fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#000
    
    %% Apply classes
    class ${this.getNodesByClass('startEnd')} startEnd
    class ${this.getNodesByClass('condition')} condition
    class ${this.getNodesByClass('process')} process
    class ${this.getNodesByClass('function')} function
    class ${this.getNodesByClass('assignment')} assignment
    class ${this.getNodesByClass('return')} return
`;
    }

    getNodesByClass(className) {
        // This would need to be tracked during node creation
        // For simplicity, we'll use placeholder logic
        switch (className) {
            case 'startEnd':
                return 'A1,A' + (this.nodeCounter - 1);
            default:
                return 'A2,A3,A4'; // Placeholder
        }
    }

    // Utility method to clean up mermaid code
    cleanMermaidCode() {
        return this.mermaidCode
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/\s+$/gm, ''); // Remove trailing whitespace
    }

    // Method to generate different flowchart styles
    generateAlternativeStyle(analysis, style = 'default') {
        this.nodeCounter = 1;
        
        switch (style) {
            case 'minimal':
                return this.generateMinimalFlowchart(analysis);
            case 'detailed':
                return this.generateDetailedFlowchart(analysis);
            case 'compact':
                return this.generateCompactFlowchart(analysis);
            default:
                return this.generateFromAnalysis(analysis);
        }
    }

    generateMinimalFlowchart(analysis) {
        this.mermaidCode = 'flowchart LR\n';
        // Implementation for minimal style
        const mainSteps = analysis.statements.filter(s => 
            ['function', 'if', 'for', 'while', 'return'].includes(s.type)
        );
        
        return this.generateFromFilteredStatements(mainSteps);
    }

    generateDetailedFlowchart(analysis) {
        // Include all statements with more detailed labels
        return this.generateFromAnalysis(analysis);
    }

    generateCompactFlowchart(analysis) {
        this.mermaidCode = 'flowchart TB\n';
        // Group related statements
        return this.generateFromAnalysis(analysis);
    }

    generateFromFilteredStatements(statements) {
        // Helper method for filtered statement processing
        return this.generateFromAnalysis({ statements });
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlowchartGenerator;
} else {
    window.FlowchartGenerator = FlowchartGenerator;
}