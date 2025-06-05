class AdvancedCalculator {
    constructor() {
        this.display = document.getElementById('result');
        this.expression = document.getElementById('expression');
        this.historyPanel = document.getElementById('history-panel');
        this.historyList = document.getElementById('history-list');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = false;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateDisplay();
        this.renderHistory();
        this.setupKeyboardSupport();
    }

    setupEventListeners() {
        // Button clicks
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        // Theme switcher
        document.getElementById('theme-switcher').addEventListener('click', () => {
            this.toggleTheme();
        });

        // History toggle
        document.getElementById('history-toggle').addEventListener('click', () => {
            this.toggleHistory();
        });

        // Clear history
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        // History item clicks
        this.historyList.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const result = historyItem.querySelector('.history-result').textContent;
                this.currentInput = result;
                this.updateDisplay();
                this.waitingForNewInput = true;
            }
        });
    }

    setupKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            
            const key = e.key;
            const keyMap = {
                '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
                '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                '+': '+', '-': '-', '*': '*', '/': '/',
                '=': 'calculate', 'Enter': 'calculate',
                '.': '.', ',': '.',
                'Backspace': 'backspace',
                'Delete': 'clear',
                'Escape': 'clear-all',
                '%': 'percent'
            };

            if (keyMap[key]) {
                this.animateKeyPress(key);
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].includes(key)) {
                    this.inputNumber(keyMap[key]);
                } else if (['+', '-', '*', '/'].includes(key)) {
                    this.inputOperator(key);
                } else if (key === '=' || key === 'Enter') {
                    this.calculate();
                } else if (key === 'Backspace') {
                    this.backspace();
                } else if (key === 'Delete') {
                    this.clear();
                } else if (key === 'Escape') {
                    this.clearAll();
                } else if (key === '%') {
                    this.percent();
                }
            }
        });
    }

    animateKeyPress(key) {
        const keyToSelector = {
            '0': '[data-value="0"]',
            '1': '[data-value="1"]',
            '2': '[data-value="2"]',
            '3': '[data-value="3"]',
            '4': '[data-value="4"]',
            '5': '[data-value="5"]',
            '6': '[data-value="6"]',
            '7': '[data-value="7"]',
            '8': '[data-value="8"]',
            '9': '[data-value="9"]',
            '+': '[data-value="+"]',
            '-': '[data-value="-"]',
            '*': '[data-value="*"]',
            '/': '[data-value="/"]',
            '.': '[data-value="."]',
            'Enter': '[data-action="calculate"]',
            '=': '[data-action="calculate"]',
            'Backspace': '[data-action="backspace"]',
            'Delete': '[data-action="clear"]',
            'Escape': '[data-action="clear-all"]',
            '%': '[data-action="percent"]'
        };

        const button = document.querySelector(keyToSelector[key]);
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
        }
    }

    handleButtonClick(e) {
        const btn = e.currentTarget;
        const value = btn.dataset.value;
        const action = btn.dataset.action;

        // Add visual feedback
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 150);

        if (value !== undefined) {
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].includes(value)) {
                this.inputNumber(value);
            } else {
                this.inputOperator(value);
            }
        } else if (action) {
            switch (action) {
                case 'clear-all':
                    this.clearAll();
                    break;
                case 'clear':
                    this.clear();
                    break;
                case 'backspace':
                    this.backspace();
                    break;
                case 'calculate':
                    this.calculate();
                    break;
                case 'percent':
                    this.percent();
                    break;
            }
        }
    }

    inputNumber(num) {
        if (num === '.' && this.currentInput.includes('.')) return;
        
        if (this.waitingForNewInput) {
            this.currentInput = num === '.' ? '0.' : num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' && num !== '.' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }

    inputOperator(op) {
        if (this.previousInput && this.operator && !this.waitingForNewInput) {
            this.calculate(false);
        }

        this.previousInput = this.currentInput;
        this.operator = op;
        this.waitingForNewInput = true;
        this.updateExpression(`${this.previousInput} ${this.getOperatorSymbol(op)}`);
    }

    calculate(addToHistory = true) {
        if (!this.previousInput || !this.operator) return;

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${this.currentInput}`;
        
        // Format result
        result = this.formatResult(result);
        
        if (addToHistory) {
            this.addToHistory(expression, result);
        }

        this.currentInput = result.toString();
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = true;
        this.updateDisplay();
        this.updateExpression('');
    }

    percent() {
        const current = parseFloat(this.currentInput);
        const result = current / 100;
        this.currentInput = this.formatResult(result).toString();
        this.updateDisplay();
        this.waitingForNewInput = true;
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    clear() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = false;
        this.updateDisplay();
        this.updateExpression('');
    }

    formatResult(result) {
        // Handle very large or very small numbers
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return parseFloat(result.toExponential(10));
        }
        
        // Format to remove unnecessary decimals
        const formatted = parseFloat(result.toPrecision(12));
        return formatted;
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[op] || op;
    }

    updateDisplay() {
        this.display.value = this.formatDisplayNumber(this.currentInput);
    }

    updateExpression(expr) {
        this.expression.textContent = expr;
    }

    formatDisplayNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return num;
        
        // Add thousands separators for large numbers
        if (Math.abs(number) >= 1000) {
            return number.toLocaleString('en-US', {
                maximumFractionDigits: 10
            });
        }
        
        return num;
    }

    showError(message) {
        this.display.classList.add('error');
        this.currentInput = 'Error';
        this.updateDisplay();
        
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clearAll();
        }, 2000);
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: result.toString(),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${this.formatDisplayNumber(item.result)}</div>
            </div>
        `).join('');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('active');
        
        // Update icon
        const icon = document.querySelector('#history-toggle i');
        if (this.historyPanel.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-history';
        }
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('calculatorTheme', newTheme);
        
        // Update icon
        const icon = document.querySelector('#theme-switcher i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Update icon
        const icon = document.querySelector('#theme-switcher i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCalculator();
});

// Add some helpful utilities
window.calculatorUtils = {
    // Scientific notation converter
    toScientific: (num) => {
        return parseFloat(num).toExponential();
    },
    
    // Fraction converter (basic)
    toFraction: (decimal) => {
        const tolerance = 1.0E-6;
        let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
        let b = decimal;
        
        do {
            const a = Math.floor(b);
            let aux = h1;
            h1 = a * h1 + h2;
            h2 = aux;
            aux = k1;
            k1 = a * k1 + k2;
            k2 = aux;
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
        
        return `${h1}/${k1}`;
    }
};
