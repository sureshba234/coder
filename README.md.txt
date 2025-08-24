# 🔍 Code Visualizer

A powerful, interactive web application that transforms your code into beautiful flowcharts and provides detailed step-by-step execution analysis. Perfect for learning, teaching, debugging, and code documentation.

![Code Visualizer Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Code+Visualizer+Preview)

## ✨ Features

### 🎯 Core Functionality
- **Multi-language Support**: JavaScript, Python, Java, C++
- **Interactive Flowcharts**: Generated using Mermaid.js with custom styling
- **Step-by-step Analysis**: Detailed breakdown of code execution
- **Real-time Processing**: Analyze code as you type
- **Export Capabilities**: Save flowcharts as SVG files

### 📊 Advanced Analysis
- **Code Metrics**: Cyclomatic complexity, nesting depth, quality scores
- **Performance Analysis**: Time/space complexity estimation
- **Quality Assessment**: Code smells, optimization suggestions
- **Security Analysis**: Potential vulnerability detection
- **Variable Tracking**: Memory changes and data flow

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Dark Theme Support**: Automatic theme detection
- **Mobile Friendly**: Works perfectly on all devices
- **Keyboard Shortcuts**: Power user features
- **Example Gallery**: Pre-loaded code samples

## 🚀 Quick Start

### Option 1: Direct Usage (Recommended)
1. Download all project files
2. Open `index.html` in a modern web browser
3. Start analyzing code immediately!

### Option 2: Local Development
```bash
# Clone or download the project
git clone [repository-url] code-visualizer
cd code-visualizer

# Serve with any local server (optional)
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000
```

### Option 3: Online Deployment
Deploy to any static hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Enable Pages in repository settings

## 📁 Project Structure

```
code-visualizer/
├── index.html              # Main application page
├── js/
│   ├── main.js             # Application controller
│   ├── parser.js           # Code parsing engine
│   ├── flowchart.js        # Flowchart generation
│   └── analyzer.js         # Advanced code analysis
├── css/
│   └── styles.css          # Complete styling
├── assets/                 # Additional resources
└── README.md              # This file
```

## 🛠️ Technology Stack

### Frontend Technologies
- **HTML5**: Semantic markup with modern features
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and animations
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **Mermaid.js**: Flowchart rendering and visualization
- **Prism.js**: Syntax highlighting for code display

### Key Libraries
- **Mermaid.js v10.6.1**: Flowchart generation
- **Prism.js v1.29.0**: Code syntax highlighting
- No heavy frameworks - Pure vanilla JavaScript for performance

## 📖 Usage Guide

### Basic Usage
1. **Select Language**: Choose from JavaScript, Python, Java, or C++
2. **Enter Code**: Paste or type your code in the editor
3. **Analyze**: Click "Analyze Code" or use Ctrl/Cmd + Enter
4. **Explore**: View the flowchart and step-by-step analysis

### Advanced Features

#### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Analyze code
- `Ctrl/Cmd + S`: Export flowchart
- `Ctrl/Cmd + K`: Focus code editor
- `Escape`: Close modal dialogs

#### Code Examples
Use the built-in examples to explore different algorithms:
- **Fibonacci**: Classic recursive and iterative approaches
- **Bubble Sort**: Sorting algorithm with nested loops
- **Factorial**: Mathematical computation example
- **Binary Search**: Efficient search algorithm

#### Export Options
- **SVG Format**: Vector graphics for high-quality prints
- **High Resolution**: Suitable for presentations and documentation
- **White Background**: Clean appearance for professional use

## 🔧 Supported Code Constructs

### All Languages
- Variable declarations and assignments
- Function definitions and calls
- Conditional statements (if/else)
- Loops (for, while)
- Return statements
- Basic arithmetic operations

### Language-Specific Features

#### JavaScript
```javascript
// Variables
let variable = value;
const constant = value;
var legacyVar = value;

// Functions
function myFunction(param) {
    return result;
}

// Arrow functions (basic support)
const arrow = (param) => result;
```

#### Python
```python
# Variables
variable = value

# Functions
def my_function(param):
    return result

# List comprehensions (basic parsing)
result = [x for x in range(10)]
```

#### Java
```java
// Variables with types
int number = 42;
String text = "hello";

// Methods
public int myMethod(int param) {
    return result;
}
```

#### C++
```cpp
// Variables with types
int number = 42;
string text = "hello";

// Functions
int myFunction(int param) {
    return result;
}
```

## 📊 Analysis Features

### Code Metrics
- **Cyclomatic Complexity**: Measures code complexity (1-10+ scale)
- **Nesting Depth**: Maximum indentation levels
- **Lines of Code**: Effective code lines (excluding comments)
- **Variable Count**: Number of unique variables
- **Function Count**: Number of defined functions

### Quality Assessment
- **Overall Rating**: Excellent, Good, Fair, Needs Improvement
- **Code Smells**: Long functions, deep nesting, magic numbers
- **Best Practices**: Following language conventions
- **Maintainability**: Code readability and structure

### Performance Analysis
- **Time Complexity**: Big O notation estimation
- **Space Complexity**: Memory usage patterns
- **Bottleneck Detection**: Performance hotspots
- **Optimization Suggestions**: Actionable improvements

### Security Analysis
- **Vulnerability Detection**: Common security issues
- **Risk Assessment**: Low, Medium, High risk levels
- **Safe Coding**: Best security practices

## 🎨 Customization

### Themes
The application supports light and dark themes with automatic detection:
```css
/* Custom theme variables in styles.css */
:root {
    --primary-color: #667eea;
    --secondary-color: #f8f9ff;
    /* ... more variables */
}
```

### Extending Language Support
To add a new language:

1. **Update parser.js**:
```javascript
getLanguagePatterns(language) {
    const patterns = {
        // ... existing languages
        newlang: {
            variable: /pattern/,
            function: /pattern/,
            // ... more patterns
        }
    };
}
```

2. **Add examples**:
```javascript
// In main.js examples object
newlang: {
    javascript: `// New language example
function example() {
    return "Hello World";
}`
}
```

## 🐛 Troubleshooting

### Common Issues

#### Flowchart Not Rendering
- **Check browser compatibility**: Modern browsers required
- **Verify Mermaid loading**: Look for console errors
- **Code complexity**: Very large code may timeout

#### Analysis Errors
- **Syntax errors**: Ensure code is syntactically correct
- **Unsupported constructs**: Check supported features list
- **Complex expressions**: Simplify complex statements

#### Performance Issues
- **Large code files**: Break into smaller functions
- **Complex nesting**: Reduce indentation depth
- **Browser memory**: Refresh page for large analyses

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ❌ Internet Explorer (not supported)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Areas
- **Language Support**: Add new programming languages
- **Analysis Features**: Enhance code analysis capabilities
- **UI/UX Improvements**: Better user experience
- **Performance**: Optimization and speed improvements
- **Documentation**: Improve guides and examples

### Code Style
- Use ES6+ JavaScript features
- Follow existing naming conventions
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mermaid.js**: Fantastic flowchart generation library
- **Prism.js**: Excellent syntax highlighting
- **Contributors**: Everyone who helps improve this project
- **Community**: Users who provide feedback and suggestions

## 📞 Support

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community support and ideas
- **Documentation**: Check this README and code comments

### Feature Requests
Have an idea for improvement? We'd love to hear it!
1. Check existing issues first
2. Create a detailed feature request
3. Explain the use case and benefits
4. Consider contributing the implementation

## 🔮 Roadmap

### Version 2.0 (Planned)
- [ ] Multi-file project analysis
- [ ] Interactive flowchart editing
- [ ] Code generation from flowcharts
- [ ] Team collaboration features
- [ ] Advanced optimization suggestions
- [ ] Integration with popular IDEs

### Future Enhancements
- [ ] More programming languages (Go, Rust, Swift)
- [ ] Database schema visualization
- [ ] API documentation generation
- [ ] Real-time collaborative editing
- [ ] Advanced security scanning
- [ ] Performance profiling integration

---

**Made with ❤️ for developers, by developers**

*Transform your code into visual stories and understand execution like never before.*