// Code Analysis Engine
class CodeAnalyzer {
    constructor() {
        this.supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
        this.analysisCache = new Map();
    }

    analyzeCode(code, language = 'javascript') {
        // Check cache first
        const cacheKey = `${language}:${this.hashCode(code)}`;
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        const parser = new CodeParser(language);
        const analysis = parser.parseCode(code);
        
        // Enhance analysis with additional insights
        this.enhanceAnalysis(analysis, code, language);
        
        // Generate execution steps
        analysis.executionSteps = this.generateExecutionSteps(analysis);
        
        // Calculate metrics
        analysis.metrics = this.calculateMetrics(analysis);
        
        // Generate flowchart data
        const flowchartGenerator = new FlowchartGenerator();
        analysis.flowchartCode = flowchartGenerator.generateFromAnalysis(analysis);
        
        // Cache the result
        this.analysisCache.set(cacheKey, analysis);
        
        return analysis;
    }

    enhanceAnalysis(analysis, originalCode, language) {
        // Add code quality insights
        analysis.quality = this.assessCodeQuality(analysis);
        
        // Identify patterns and potential issues
        analysis.patterns = this.identifyPatterns(analysis);
        
        // Performance considerations
        analysis.performance = this.analyzePerformance(analysis);
        
        // Security considerations
        analysis.security = this.analyzeSecurityIssues(analysis);
        
        // Add execution flow insights
        analysis.flowInsights = this.generateFlowInsights(analysis);
        
        // Memory and variable tracking
        analysis.variableFlow = this.trackVariableFlow(analysis);
    }

    generateExecutionSteps(analysis) {
        const steps = [];
        let stepCounter = 1;
        
        for (const statement of analysis.statements) {
            const step = this.createExecutionStep(statement, stepCounter++);
            if (step) {
                steps.push(step);
            }
        }
        
        return steps;
    }

    createExecutionStep(statement, stepNumber) {
        let description = '';
        let explanation = '';
        let memoryChanges = [];
        let category = 'execution';

        switch (statement.type) {
            case 'variable':
                description = `Declare variable '${statement.name}'`;
                explanation = `Create a new variable named '${statement.name}' in memory`;
                memoryChanges.push({
                    action: 'create',
                    variable: statement.name,
                    type: 'variable'
                });
                category = 'memory';
                break;

            case 'assignment':
                description = `Assign value to '${statement.variable}'`;
                explanation = `Update the value stored in variable '${statement.variable}'`;
                memoryChanges.push({
                    action: 'update',
                    variable: statement.variable,
                    type: 'assignment'
                });
                category = 'memory';
                break;

            case 'function':
                description = `Define function '${statement.name}'`;
                explanation = `Create a new function named '${statement.name}' that can be called later`;
                memoryChanges.push({
                    action: 'create',
                    variable: statement.name,
                    type: 'function'
                });
                category = 'definition';
                break;

            case 'if':
                description = `Check condition: ${statement.condition}`;
                explanation = `Evaluate the condition '${statement.condition}' and branch accordingly`;
                category = 'control';
                break;

            case 'for':
                description = `Start for loop with '${statement.loopVar}'`;
                explanation = `Initialize loop variable '${statement.loopVar}' and begin iteration`;
                if (statement.loopVar) {
                    memoryChanges.push({
                        action: 'create',
                        variable: statement.loopVar,
                        type: 'loop_variable'
                    });
                }
                category = 'control';
                break;

            case 'while':
                description = `Start while loop: ${statement.condition}`;
                explanation = `Check condition '${statement.condition}' and repeat while true`;
                category = 'control';
                break;

            case 'call':
                description = `Call function '${statement.function}'`;
                explanation = `Execute the function '${statement.function}' with given parameters`;
                category = 'execution';
                break;

            case 'return':
                description = 'Return from function';
                explanation = 'Exit the current function and return control to caller';
                category = 'control';
                break;

            default:
                description = `Execute: ${statement.code}`;
                explanation = `Run the statement: ${statement.code}`;
                category = 'execution';
        }

        return {
            stepNumber,
            type: statement.type,
            description,
            explanation,
            code: statement.code,
            line: statement.line,
            category,
            memoryChanges,
            indent: statement.indent || 0,
            complexity: this.getStatementComplexity(statement)
        };
    }

    getStatementComplexity(statement) {
        const complexityMap = {
            'variable': 1,
            'assignment': 1,
            'if': 2,
            'for': 3,
            'while': 3,
            'function': 2,
            'call': 1,
            'return': 1
        };
        return complexityMap[statement.type] || 1;
    }

    calculateMetrics(analysis) {
        const metrics = {
            totalStatements: analysis.statements.length,
            totalLines: analysis.totalLines,
            cyclomaticComplexity: this.calculateCyclomaticComplexity(analysis),
            variableCount: analysis.variables.size,
            functionCount: analysis.functions.size,
            maxNestingDepth: this.calculateMaxNesting(analysis),
            linesOfCode: this.countLinesOfCode(analysis),
            codeToCommentRatio: this.calculateCodeCommentRatio(analysis)
        };

        // Add quality rating
        metrics.qualityScore = this.calculateQualityScore(metrics);
        
        return metrics;
    }

    calculateCyclomaticComplexity(analysis) {
        let complexity = 1; // Base complexity
        
        for (const statement of analysis.statements) {
            if (['if', 'for', 'while', 'switch', 'case'].includes(statement.type)) {
                complexity++;
            }
            // Additional complexity for compound conditions
            if (statement.condition && (statement.condition.includes('&&') || statement.condition.includes('||'))) {
                complexity += (statement.condition.match(/&&|\|\|/g) || []).length;
            }
        }
        
        return complexity;
    }

    calculateMaxNesting(analysis) {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (const statement of analysis.statements) {
            if (['if', 'for', 'while', 'function'].includes(statement.type)) {
                currentDepth = statement.indent || 0;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
        }
        
        return Math.floor(maxDepth / 2); // Assuming 2-space indentation
    }

    countLinesOfCode(analysis) {
        return analysis.statements.filter(s => s.type !== 'comment').length;
    }

    calculateCodeCommentRatio(analysis) {
        const codeLines = this.countLinesOfCode(analysis);
        const commentLines = analysis.statements.filter(s => s.type === 'comment').length;
        return commentLines > 0 ? codeLines / commentLines : codeLines;
    }

    calculateQualityScore(metrics) {
        let score = 100;
        
        // Penalize high complexity
        if (metrics.cyclomaticComplexity > 10) {
            score -= (metrics.cyclomaticComplexity - 10) * 5;
        }
        
        // Penalize deep nesting
        if (metrics.maxNestingDepth > 4) {
            score -= (metrics.maxNestingDepth - 4) * 10;
        }
        
        // Reward good comment ratio
        if (metrics.codeToCommentRatio > 3 && metrics.codeToCommentRatio < 10) {
            score += 10;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    assessCodeQuality(analysis) {
        const issues = [];
        const suggestions = [];
        
        // Check for long functions
        const functionLengths = this.analyzeFunctionLengths(analysis);
        functionLengths.forEach(func => {
            if (func.length > 50) {
                issues.push({
                    type: 'long_function',
                    severity: 'warning',
                    message: `Function '${func.name}' is ${func.length} lines long. Consider breaking it down.`,
                    line: func.startLine
                });
            }
        });

        // Check for deeply nested code
        const deepNesting = analysis.statements.filter(s => (s.indent || 0) > 8);
        if (deepNesting.length > 0) {
            issues.push({
                type: 'deep_nesting',
                severity: 'warning',
                message: 'Deep nesting detected. Consider refactoring for better readability.',
                count: deepNesting.length
            });
        }

        // Check for magic numbers
        const magicNumbers = this.findMagicNumbers(analysis);
        magicNumbers.forEach(number => {
            suggestions.push({
                type: 'magic_number',
                message: `Consider replacing magic number '${number.value}' with a named constant`,
                line: number.line
            });
        });

        return {
            issues,
            suggestions,
            overallRating: this.getOverallRating(issues.length)
        };
    }

    analyzeFunctionLengths(analysis) {
        const functions = [];
        let currentFunction = null;
        
        for (const statement of analysis.statements) {
            if (statement.type === 'function') {
                if (currentFunction) {
                    currentFunction.length = statement.line - currentFunction.startLine;
                    functions.push(currentFunction);
                }
                currentFunction = {
                    name: statement.name,
                    startLine: statement.line,
                    length: 0
                };
            }
        }
        
        if (currentFunction) {
            currentFunction.length = analysis.totalLines - currentFunction.startLine;
            functions.push(currentFunction);
        }
        
        return functions;
    }

    findMagicNumbers(analysis) {
        const magicNumbers = [];
        const numberPattern = /\b(\d+)\b/g;
        
        for (const statement of analysis.statements) {
            const matches = statement.code.match(numberPattern);
            if (matches) {
                matches.forEach(match => {
                    const num = parseInt(match);
                    // Skip common non-magic numbers
                    if (num > 1 && num !== 100 && num !== 1000) {
                        magicNumbers.push({
                            value: num,
                            line: statement.line
                        });
                    }
                });
            }
        }
        
        return magicNumbers;
    }

    getOverallRating(issueCount) {
        if (issueCount === 0) return 'excellent';
        if (issueCount <= 2) return 'good';
        if (issueCount <= 5) return 'fair';
        return 'needs_improvement';
    }

    identifyPatterns(analysis) {
        const patterns = [];
        
        // Identify common patterns
        patterns.push(...this.identifyDesignPatterns(analysis));
        patterns.push(...this.identifyCodeSmells(analysis));
        patterns.push(...this.identifyAlgorithmPatterns(analysis));
        
        return patterns;
    }

    identifyDesignPatterns(analysis) {
        const patterns = [];
        
        // Simple pattern detection based on function and variable names
        const functionNames = Array.from(analysis.functions);
        
        // Factory pattern
        if (functionNames.some(name => name.toLowerCase().includes('create') || name.toLowerCase().includes('factory'))) {
            patterns.push({
                type: 'factory_pattern',
                description: 'Factory pattern detected - functions that create objects',
                confidence: 0.6
            });
        }
        
        // Observer pattern
        if (functionNames.some(name => name.toLowerCase().includes('notify') || name.toLowerCase().includes('observer'))) {
            patterns.push({
                type: 'observer_pattern',
                description: 'Observer pattern detected - notification mechanism found',
                confidence: 0.7
            });
        }
        
        return patterns;
    }

    identifyCodeSmells(analysis) {
        const smells = [];
        
        // Long parameter lists (simplified check)
        for (const statement of analysis.statements) {
            if (statement.type === 'function' && statement.code.includes(',')) {
                const paramCount = (statement.code.match(/,/g) || []).length + 1;
                if (paramCount > 5) {
                    smells.push({
                        type: 'long_parameter_list',
                        description: `Function has ${paramCount} parameters - consider using objects`,
                        line: statement.line,
                        severity: 'warning'
                    });
                }
            }
        }
        
        return smells;
    }

    identifyAlgorithmPatterns(analysis) {
        const patterns = [];
        
        // Look for sorting patterns
        const hasNestedLoops = analysis.statements.some((stmt, i) => 
            stmt.type === 'for' && 
            analysis.statements.slice(i + 1).some(s => s.type === 'for' && s.indent > stmt.indent)
        );
        
        if (hasNestedLoops) {
            patterns.push({
                type: 'nested_loops',
                description: 'Nested loops detected - possible O(n²) complexity',
                complexity: 'quadratic'
            });
        }
        
        // Look for recursive patterns
        const recursiveFunctions = this.findRecursiveFunctions(analysis);
        if (recursiveFunctions.length > 0) {
            patterns.push({
                type: 'recursion',
                description: 'Recursive functions detected',
                functions: recursiveFunctions
            });
        }
        
        return patterns;
    }

    findRecursiveFunctions(analysis) {
        const recursive = [];
        const functionNames = Array.from(analysis.functions);
        
        for (const funcName of functionNames) {
            const calls = analysis.statements.filter(s => 
                s.type === 'call' && s.function === funcName
            );
            
            if (calls.length > 0) {
                recursive.push(funcName);
            }
        }
        
        return recursive;
    }

    analyzePerformance(analysis) {
        const performance = {
            timeComplexity: this.estimateTimeComplexity(analysis),
            spaceComplexity: this.estimateSpaceComplexity(analysis),
            bottlenecks: this.identifyBottlenecks(analysis),
            optimizationSuggestions: []
        };
        
        // Generate optimization suggestions
        performance.optimizationSuggestions = this.generateOptimizationSuggestions(analysis, performance);
        
        return performance;
    }

    estimateTimeComplexity(analysis) {
        let maxComplexity = 'O(1)';
        let nestedLoopDepth = 0;
        let currentDepth = 0;
        
        for (const statement of analysis.statements) {
            if (['for', 'while'].includes(statement.type)) {
                currentDepth++;
                nestedLoopDepth = Math.max(nestedLoopDepth, currentDepth);
            } else if (statement.indent < (statement.previousIndent || 0)) {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        
        switch (nestedLoopDepth) {
            case 0: maxComplexity = 'O(1)'; break;
            case 1: maxComplexity = 'O(n)'; break;
            case 2: maxComplexity = 'O(n²)'; break;
            case 3: maxComplexity = 'O(n³)'; break;
            default: maxComplexity = `O(n^${nestedLoopDepth})`;
        }
        
        return maxComplexity;
    }

    estimateSpaceComplexity(analysis) {
        const variableCount = analysis.variables.size;
        const hasRecursion = analysis.patterns.some(p => p.type === 'recursion');
        
        if (hasRecursion) {
            return 'O(n)'; // Recursion typically uses call stack
        } else if (variableCount < 10) {
            return 'O(1)';
        } else {
            return 'O(n)';
        }
    }

    identifyBottlenecks(analysis) {
        const bottlenecks = [];
        
        // Nested loops are performance bottlenecks
        const nestedLoops = analysis.patterns.filter(p => p.type === 'nested_loops');
        if (nestedLoops.length > 0) {
            bottlenecks.push({
                type: 'nested_loops',
                description: 'Nested loops may cause performance issues with large datasets',
                impact: 'high'
            });
        }
        
        // Recursive functions without memoization
        const recursion = analysis.patterns.filter(p => p.type === 'recursion');
        if (recursion.length > 0) {
            bottlenecks.push({
                type: 'recursion',
                description: 'Recursive functions may cause stack overflow with large inputs',
                impact: 'medium'
            });
        }
        
        return bottlenecks;
    }

    generateOptimizationSuggestions(analysis, performance) {
        const suggestions = [];
        
        if (performance.timeComplexity.includes('n²') || performance.timeComplexity.includes('n³')) {
            suggestions.push({
                type: 'algorithm_optimization',
                message: 'Consider using more efficient algorithms to reduce time complexity',
                priority: 'high'
            });
        }
        
        if (performance.bottlenecks.some(b => b.type === 'recursion')) {
            suggestions.push({
                type: 'memoization',
                message: 'Consider adding memoization to recursive functions',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }

    analyzeSecurityIssues(analysis) {
        const issues = [];
        
        // Look for potential security issues (simplified)
        for (const statement of analysis.statements) {
            // Check for eval usage
            if (statement.code.toLowerCase().includes('eval(')) {
                issues.push({
                    type: 'eval_usage',
                    severity: 'high',
                    message: 'Use of eval() detected - potential security risk',
                    line: statement.line
                });
            }
            
            // Check for innerHTML usage
            if (statement.code.toLowerCase().includes('innerhtml')) {
                issues.push({
                    type: 'innerHTML_usage',
                    severity: 'medium',
                    message: 'Use of innerHTML - potential XSS vulnerability',
                    line: statement.line
                });
            }
        }
        
        return {
            issues,
            riskLevel: issues.length === 0 ? 'low' : issues.length <= 2 ? 'medium' : 'high'
        };
    }

    generateFlowInsights(analysis) {
        return {
            entryPoints: this.findEntryPoints(analysis),
            exitPoints: this.findExitPoints(analysis),
            branchingFactor: this.calculateBranchingFactor(analysis),
            pathComplexity: this.calculatePathComplexity(analysis)
        };
    }

    findEntryPoints(analysis) {
        return analysis.statements
            .filter(s => s.type === 'function')
            .map(s => ({ name: s.name, line: s.line }));
    }

    findExitPoints(analysis) {
        return analysis.statements
            .filter(s => s.type === 'return')
            .map(s => ({ line: s.line, code: s.code }));
    }

    calculateBranchingFactor(analysis) {
        const branches = analysis.statements.filter(s => ['if', 'for', 'while'].includes(s.type));
        return branches.length;
    }

    calculatePathComplexity(analysis) {
        // Simplified path complexity calculation
        const branches = this.calculateBranchingFactor(analysis);
        return Math.pow(2, Math.min(branches, 10)); // Cap at reasonable number
    }

    trackVariableFlow(analysis) {
        const flow = new Map();
        
        for (const statement of analysis.statements) {
            if (statement.variables) {
                statement.variables.forEach(variable => {
                    if (!flow.has(variable)) {
                        flow.set(variable, []);
                    }
                    flow.get(variable).push({
                        line: statement.line,
                        type: statement.type,
                        action: statement.type === 'variable' ? 'declare' : 'modify'
                    });
                });
            }
        }
        
        return flow;
    }

    // Utility method to hash code for caching
    hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash;
    }

    // Method to clear cache
    clearCache() {
        this.analysisCache.clear();
    }

    // Method to get cache statistics
    getCacheStats() {
        return {
            size: this.analysisCache.size,
            keys: Array.from(this.analysisCache.keys())
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeAnalyzer;
} else {
    window.CodeAnalyzer = CodeAnalyzer;
}