// Main Application Controller
class CodeVisualizerApp {
    constructor() {
        this.analyzer = new CodeAnalyzer();
        this.currentAnalysis = null;
        this.isDemoMode = false;
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadInitialExample();
    }

    initializeApp() {
        // Initialize Mermaid with custom configuration
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            themeVariables: {
                primaryColor: '#667eea',
                primaryTextColor: '#333',
                primaryBorderColor: '#667eea',
                lineColor: '#667eea',
                secondaryColor: '#f8f9ff',
                tertiaryColor: '#ffffff'
            },
            flowchart: {
                htmlLabels: true,
                curve: 'basis',
                padding: 20,
                nodeSpacing: 50,
                rankSpacing: 80
            },
            securityLevel: 'loose'
        });

        // Setup syntax highlighting
        this.setupSyntaxHighlighting();
        
        // Initialize tooltips and help system
        this.initializeTooltips();
        
        console.log('Code Visualizer App initialized successfully!');
    }

    setupSyntaxHighlighting() {
        // Configure Prism for better syntax highlighting
        if (window.Prism) {
            Prism.manual = true;
            Prism.hooks.add('before-highlight', function(env) {
                env.element.innerHTML = env.code;
            });
        }
    }

    initializeTooltips() {
        // Add helpful tooltips to various elements
        const tooltips = {
            'languageSelect': 'Choose the programming language of your code',
            'codeEditor': 'Paste or type your code here. The analyzer supports functions, loops, conditionals, and more!',
            'analyzeBtn': 'Click to analyze your code and generate flowchart',
            'exportBtn': 'Export the generated flowchart as SVG image'
        };

        Object.keys(tooltips).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.title = tooltips[id];
            }
        });
    }

    setupEventListeners() {
        // Code editor events
        const codeEditor = document.getElementById('codeEditor');
        if (codeEditor) {
            codeEditor.addEventListener('input', this.debounce(() => {
                if (this.isDemoMode) {
                    this.analyzeCurrentCode();
                }
            }, 1000));

            codeEditor.addEventListener('paste', () => {
                setTimeout(() => this.analyzeCurrentCode(), 100);
            });
        }

        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                this.updateEditorForLanguage();
                if (codeEditor.value.trim()) {
                    this.analyzeCurrentCode();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'Enter':
                        event.preventDefault();
                        this.analyzeCurrentCode();
                        break;
                    case 's':
                        event.preventDefault();
                        this.exportFlowchart();
                        break;
                    case 'k':
                        event.preventDefault();
                        codeEditor.focus();
                        break;
                }
            }
        });

        // Window resize handler for responsive flowcharts
        window.addEventListener('resize', this.debounce(() => {
            this.redrawFlowchart();
        }, 250));
    }

    loadInitialExample() {
        // Load a default example to showcase the tool
        this.loadExample('fibonacci');
    }

    updateEditorForLanguage() {
        const language = document.getElementById('languageSelect').value;
        const codeEditor = document.getElementById('codeEditor');
        
        // Update placeholder text based on language
        const placeholders = {
            javascript: '// Paste your JavaScript code here\nfunction example() {\n    return "Hello World";\n}',
            python: '# Paste your Python code here\ndef example():\n    return "Hello World"',
            java: '// Paste your Java code here\npublic class Example {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
            cpp: '// Paste your C++ code here\n#include <iostream>\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}'
        };

        if (codeEditor && !codeEditor.value.trim()) {
            codeEditor.placeholder = placeholders[language] || placeholders.javascript;
        }
    }

    analyzeCurrentCode() {
        const code = document.getElementById('codeEditor')?.value?.trim();
        const language = document.getElementById('languageSelect')?.value || 'javascript';

        if (!code) {
            this.showMessage('Please enter some code to analyze!', 'warning');
            return;
        }

        this.showLoadingState();

        // Use setTimeout to make the UI feel responsive
        setTimeout(() => {
            try {
                this.currentAnalysis = this.analyzer.analyzeCode(code, language);
                this.displayAnalysisResults();
                this.showMessage('Code analyzed successfully!', 'success');
            } catch (error) {
                console.error('Analysis error:', error);
                this.showMessage('Error analyzing code: ' + error.message, 'error');
                this.hideLoadingState();
            }
        }, 500);
    }

    displayAnalysisResults() {
        if (!this.currentAnalysis) return;

        // Display flowchart
        this.displayFlowchart();
        
        // Display execution steps
        this.displayExecutionSteps();
        
        // Display metrics and insights
        this.displayMetrics();
        
        // Display quality assessment
        this.displayQualityAssessment();

        this.hideLoadingState();
    }

    displayFlowchart() {
        const container = document.getElementById('flowchartContainer');
        if (!container || !this.currentAnalysis.flowchartCode) return;

        container.innerHTML = `<div class="mermaid">${this.currentAnalysis.flowchartCode}</div>`;
        container.classList.add('has-content');

        // Re-initialize Mermaid for the new content
        try {
            mermaid.init(undefined, container.querySelector('.mermaid'));
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            this.showMessage('Error rendering flowchart. Please try again.', 'error');
        }
    }

    displayExecutionSteps() {
        const container = document.getElementById('stepsContainer');
        const section = document.getElementById('analysisSection');
        const stats = document.getElementById('analysisStats');

        if (!container || !this.currentAnalysis.executionSteps) return;

        // Update statistics
        if (stats) {
            const metrics = this.currentAnalysis.metrics;
            stats.innerHTML = `
                <span class="stat-item">📊 ${metrics.totalStatements} steps</span>
                <span class="stat-item">📝 ${metrics.variableCount} variables</span>
                <span class="stat-item">⚡ ${metrics.cyclomaticComplexity} complexity</span>
                <span class="stat-item">📈 ${this.currentAnalysis.performance.timeComplexity}</span>
            `;
        }

        container.innerHTML = '';

        this.currentAnalysis.executionSteps.forEach((step, index) => {
            const stepElement = this.createStepElement(step, index);
            container.appendChild(stepElement);
        });

        // Show the analysis section
        if (section) {
            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    createStepElement(step, index) {
        const stepDiv = document.createElement('div');
        stepDiv.className = `step step-${step.category}`;
        
        const categoryIcons = {
            'memory': '🧠',
            'control': '🔄',
            'execution': '⚙️',
            'definition': '📋'
        };

        const categoryColors = {
            'memory': '#4caf50',
            'control': '#ff9800',
            'execution': '#2196f3',
            'definition': '#9c27b0'
        };

        stepDiv.style.borderLeftColor = categoryColors[step.category] || '#667eea';

        stepDiv.innerHTML = `
            <span class="step-number">${index + 1}</span>
            <div class="step-content">
                <div class="step-header">
                    <span class="step-icon">${categoryIcons[step.category] || '📋'}</span>
                    <span class="step-title">${step.description}</span>
                    <span class="step-complexity">C: ${step.complexity}</span>
                </div>
                <div class="step-explanation">${step.explanation}</div>
                <div class="step-code">
                    <code>${this.escapeHtml(step.code)}</code>
                    ${step.line ? `<span class="line-number">Line ${step.line}</span>` : ''}
                </div>
                ${step.memoryChanges && step.memoryChanges.length > 0 ? this.createMemoryChangesHTML(step.memoryChanges) : ''}
            </div>
        `;

        // Add click handler for step details
        stepDiv.addEventListener('click', () => {
            this.showStepDetails(step);
        });

        return stepDiv;
    }

    createMemoryChangesHTML(memoryChanges) {
        if (!memoryChanges.length) return '';

        const changesHTML = memoryChanges.map(change => {
            const actionIcons = {
                'create': '➕',
                'update': '✏️',
                'delete': '🗑️'
            };
            
            return `
                <span class="memory-change memory-${change.action}">
                    ${actionIcons[change.action] || '📝'} ${change.variable}
                </span>
            `;
        }).join('');

        return `<div class="memory-changes">Memory: ${changesHTML}</div>`;
    }

    displayMetrics() {
        // Create or update metrics panel
        let metricsPanel = document.getElementById('metricsPanel');
        
        if (!metricsPanel) {
            metricsPanel = document.createElement('div');
            metricsPanel.id = 'metricsPanel';
            metricsPanel.className = 'metrics-panel';
            
            const analysisSection = document.getElementById('analysisSection');
            if (analysisSection) {
                analysisSection.appendChild(metricsPanel);
            }
        }

        const metrics = this.currentAnalysis.metrics;
        const performance = this.currentAnalysis.performance;

        metricsPanel.innerHTML = `
            <h3>📊 Code Metrics</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${metrics.totalStatements}</div>
                    <div class="metric-label">Statements</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.cyclomaticComplexity}</div>
                    <div class="metric-label">Complexity</div>
                    <div class="metric-indicator ${this.getComplexityClass(metrics.cyclomaticComplexity)}"></div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.maxNestingDepth}</div>
                    <div class="metric-label">Max Nesting</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${performance.timeComplexity}</div>
                    <div class="metric-label">Time Complexity</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${performance.spaceComplexity}</div>
                    <div class="metric-label">Space Complexity</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.qualityScore}/100</div>
                    <div class="metric-label">Quality Score</div>
                    <div class="metric-indicator ${this.getQualityClass(metrics.qualityScore)}"></div>
                </div>
            </div>
        `;
    }

    displayQualityAssessment() {
        const quality = this.currentAnalysis.quality;
        const performance = this.currentAnalysis.performance;
        const security = this.currentAnalysis.security;

        // Create quality assessment panel
        let qualityPanel = document.getElementById('qualityPanel');
        
        if (!qualityPanel) {
            qualityPanel = document.createElement('div');
            qualityPanel.id = 'qualityPanel';
            qualityPanel.className = 'quality-panel';
            
            const analysisSection = document.getElementById('analysisSection');
            if (analysisSection) {
                analysisSection.appendChild(qualityPanel);
            }
        }

        let issuesHTML = '';
        let suggestionsHTML = '';

        // Quality issues
        if (quality.issues && quality.issues.length > 0) {
            issuesHTML = `
                <div class="issues-section">
                    <h4>⚠️ Issues Found</h4>
                    ${quality.issues.map(issue => `
                        <div class="issue-item issue-${issue.severity}">
                            <div class="issue-type">${issue.type.replace('_', ' ').toUpperCase()}</div>
                            <div class="issue-message">${issue.message}</div>
                            ${issue.line ? `<div class="issue-line">Line ${issue.line}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Performance suggestions
        if (performance.optimizationSuggestions && performance.optimizationSuggestions.length > 0) {
            suggestionsHTML = `
                <div class="suggestions-section">
                    <h4>💡 Optimization Suggestions</h4>
                    ${performance.optimizationSuggestions.map(suggestion => `
                        <div class="suggestion-item suggestion-${suggestion.priority}">
                            <div class="suggestion-type">${suggestion.type.replace('_', ' ').toUpperCase()}</div>
                            <div class="suggestion-message">${suggestion.message}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Security assessment
        let securityHTML = '';
        if (security.issues && security.issues.length > 0) {
            securityHTML = `
                <div class="security-section">
                    <h4>🔒 Security Assessment</h4>
                    <div class="risk-level risk-${security.riskLevel}">Risk Level: ${security.riskLevel.toUpperCase()}</div>
                    ${security.issues.map(issue => `
                        <div class="security-issue security-${issue.severity}">
                            <div class="security-type">${issue.type.replace('_', ' ').toUpperCase()}</div>
                            <div class="security-message">${issue.message}</div>
                            <div class="security-line">Line ${issue.line}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        qualityPanel.innerHTML = `
            <h3>🎯 Code Quality Assessment</h3>
            <div class="overall-rating">
                <span class="rating-label">Overall Rating:</span>
                <span class="rating-value rating-${quality.overallRating}">${quality.overallRating.replace('_', ' ').toUpperCase()}</span>
            </div>
            ${issuesHTML}
            ${suggestionsHTML}
            ${securityHTML}
        `;
    }

    showStepDetails(step) {
        // Create modal or popup with detailed step information
        const modal = document.createElement('div');
        modal.className = 'step-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Step ${step.stepNumber} Details</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>${step.description}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Explanation</h4>
                        <p>${step.explanation}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Code</h4>
                        <pre><code>${this.escapeHtml(step.code)}</code></pre>
                    </div>
                    <div class="detail-section">
                        <h4>Technical Details</h4>
                        <ul>
                            <li>Type: ${step.type}</li>
                            <li>Category: ${step.category}</li>
                            <li>Complexity: ${step.complexity}</li>
                            <li>Line: ${step.line || 'N/A'}</li>
                            <li>Indentation Level: ${step.indent}</li>
                        </ul>
                    </div>
                    ${step.memoryChanges && step.memoryChanges.length > 0 ? `
                        <div class="detail-section">
                            <h4>Memory Changes</h4>
                            <ul>
                                ${step.memoryChanges.map(change => `
                                    <li>${change.action.toUpperCase()}: ${change.variable} (${change.type})</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        // Keyboard handler
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    getComplexityClass(complexity) {
        if (complexity <= 5) return 'complexity-low';
        if (complexity <= 10) return 'complexity-medium';
        return 'complexity-high';
    }

    getQualityClass(score) {
        if (score >= 80) return 'quality-excellent';
        if (score >= 60) return 'quality-good';
        if (score >= 40) return 'quality-fair';
        return 'quality-poor';
    }

    showLoadingState() {
        const container = document.getElementById('flowchartContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>🔍 Analyzing Your Code...</h3>
                    <p>Parsing structure, generating flowchart, and analyzing complexity</p>
                    <div class="loading-steps">
                        <div class="loading-step active">Parsing code structure</div>
                        <div class="loading-step">Generating execution flow</div>
                        <div class="loading-step">Creating visual flowchart</div>
                        <div class="loading-step">Calculating metrics</div>
                    </div>
                </div>
            `;
            container.classList.remove('has-content');
        }

        // Animate loading steps
        setTimeout(() => this.animateLoadingSteps(), 200);
    }

    animateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-step');
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 300);
    }

    hideLoadingState() {
        // Loading state will be replaced by actual content
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // Style the message
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        messageDiv.style.background = colors[type] || colors.info;

        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    loadExample(exampleType) {
        const examples = {
            fibonacci: {
                javascript: `function fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    
    let a = 0, b = 1, temp;
    
    for (let i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}

// Calculate 10th fibonacci number
console.log("Fibonacci(10):", fibonacci(10));`,

                python: `def fibonacci(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    
    for i in range(2, n + 1):
        temp = a + b
        a = b
        b = temp
    
    return b

# Calculate 10th fibonacci number
print("Fibonacci(10):", fibonacci(10))`,

                java: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        
        int a = 0, b = 1, temp;
        
        for (int i = 2; i <= n; i++) {
            temp = a + b;
            a = b;
            b = temp;
        }
        
        return b;
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
}`,

                cpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    
    int a = 0, b = 1, temp;
    
    for (int i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}

int main() {
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    return 0;
}`
            },

            sorting: {
                javascript: `function bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                // Swap elements
                let temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                swapped = true;
            }
        }
        n--;
    } while (swapped);
    
    return arr;
}

let numbers = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted array:", bubbleSort(numbers));`
            },

            factorial: {
                javascript: `function factorial(n) {
    // Base case
    if (n === 0 || n === 1) {
        return 1;
    }
    
    let result = 1;
    
    // Calculate factorial iteratively
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    
    return result;
}

// Test the function
console.log("Factorial of 5:", factorial(5));
console.log("Factorial of 0:", factorial(0));`
            },

            search: {
                javascript: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Found the target
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    
    return -1; // Target not found
}

let sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
let target = 7;
console.log("Index of", target + ":", binarySearch(sortedArray, target));`
            }
        };

        const language = document.getElementById('languageSelect')?.value || 'javascript';
        const example = examples[exampleType] && examples[exampleType][language] 
            ? examples[exampleType][language] 
            : examples[exampleType].javascript;

        const codeEditor = document.getElementById('codeEditor');
        if (codeEditor && example) {
            codeEditor.value = example;
            this.analyzeCurrentCode();
        }
    }

    exportFlowchart() {
        const svg = document.querySelector('#flowchartContainer svg');
        if (!svg) {
            this.showMessage('No flowchart to export. Please analyze some code first!', 'warning');
            return;
        }

        try {
            // Clone the SVG to avoid modifying the original
            const svgClone = svg.cloneNode(true);
            
            // Add white background
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'white');
            svgClone.insertBefore(rect, svgClone.firstChild);

            const serializer = new XMLSerializer();
            const svgData = serializer.serializeToString(svgClone);
            
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `flowchart-${Date.now()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            this.showMessage('Flowchart exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting flowchart: ' + error.message, 'error');
        }
    }

    redrawFlowchart() {
        if (this.currentAnalysis) {
            this.displayFlowchart();
        }
    }

    enableDemoMode() {
        this.isDemoMode = true;
        this.showMessage('Demo mode enabled - code will be analyzed as you type!', 'info');
    }

    disableDemoMode() {
        this.isDemoMode = false;
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method to get app statistics
    getAppStats() {
        return {
            currentAnalysis: !!this.currentAnalysis,
            cacheStats: this.analyzer.getCacheStats(),
            isDemoMode: this.isDemoMode,
            supportedLanguages: this.analyzer.supportedLanguages
        };
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make sure all required classes are loaded
    if (typeof CodeParser !== 'undefined' && 
        typeof FlowchartGenerator !== 'undefined' && 
        typeof CodeAnalyzer !== 'undefined') {
        
        window.codeVisualizerApp = new CodeVisualizerApp();
        console.log('Code Visualizer App started successfully!');
    } else {
        console.error('Required classes not loaded. Please check script loading order.');
    }
});

// Global functions for HTML onclick handlers
window.analyzeCode = () => window.codeVisualizerApp?.analyzeCurrentCode();
window.loadExample = (type) => window.codeVisualizerApp?.loadExample(type);
window.exportFlowchart = () => window.codeVisualizerApp?.exportFlowchart();