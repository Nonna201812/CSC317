document.addEventListener('DOMContentLoaded', () => {
    // Calculator state
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        calculationPerformed: false
    };

    // Helper function for display formatting
    function formatDisplayValue(value) {
        // Handle large numbers
        if (value.length > 10) {
            // Try to convert to scientific notation
            const num = parseFloat(value);
            if (Math.abs(num) >= 1e9) {
                return num.toExponential(5);
            }
        }
        return value;
    }

    // Update display
    function updateDisplay() {
        const display = document.querySelector('.input-display');
        display.textContent = formatDisplayValue(calculator.displayValue);
        
        // Adjust font size based on content length
        if (calculator.displayValue.length > 9) {
            display.style.fontSize = '40px';
        } else {
            display.style.fontSize = '64px';
        }
    }

    // Clear button handler
    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        calculator.calculationPerformed = false;
        document.getElementById('clear').textContent = 'AC';
    }

    // Handle digit input
    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand, calculationPerformed } = calculator;
        
        document.getElementById('clear').textContent = 'C';
        
        // Reset display if starting new calculation after equals
        if (calculationPerformed) {
            calculator.displayValue = digit;
            calculator.calculationPerformed = false;
            return;
        }
        
        // Replace display with digit when waiting for second operand
        if (waitingForSecondOperand) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            // Append digit or replace initial '0'
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    // Handle decimal point
    function inputDecimal(dot) {
        // If already calculating second operand, reset display
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        
        // Add decimal point if it doesn't exist
        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    }

    // Handle operations
    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        // Handle multiple operations in sequence
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }

        // Set first operand if it doesn't exist
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            // Calculate result of previous operation
            const result = performCalculation();
            calculator.displayValue = String(result);
            calculator.firstOperand = result;
        }
        
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    // Handle equals button
    function handleEquals() {
        if (!calculator.operator || calculator.firstOperand === null) {
            return;
        }
        
        const inputValue = parseFloat(calculator.displayValue);
        const result = performCalculation(inputValue);
        
        calculator.displayValue = String(result);
        calculator.firstOperand = result;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        calculator.calculationPerformed = true;
    }

    // Perform calculation
    function performCalculation() {
        const { firstOperand, operator, displayValue } = calculator;
        const secondOperand = parseFloat(displayValue);
        
        if (isNaN(secondOperand)) return firstOperand;
        
        let result;
        
        switch (operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '−':
                result = firstOperand - secondOperand;
                break;
            case '×':
                result = firstOperand * secondOperand;
                break;
            case '÷':
                if (secondOperand === 0) {
                    return 'Error';
                }
                result = firstOperand / secondOperand;
                break;
            default:
                return secondOperand;
        }
        
        // Convert to string and handle floating point precision
        return parseFloat(result.toFixed(10)).toString();
    }

    // Handle plus/minus toggle
    function togglePlusMinus() {
        calculator.displayValue = String(-parseFloat(calculator.displayValue));
    }

    // Handle percentage
    function handlePercentage() {
        const currentValue = parseFloat(calculator.displayValue);
        
        if (isNaN(currentValue)) { //is not a number
            return;
        }
        
        // If in the middle of an operation, calculate percentage of first operand
        if (calculator.operator && calculator.firstOperand !== null) {
            const percentValue = currentValue / 100 * calculator.firstOperand;
            calculator.displayValue = String(percentValue);
        } else {
            // Otherwise just divide by 100
            calculator.displayValue = String(currentValue / 100);
        }
    }

    // Add event listeners to number buttons
    const numberButtons = document.querySelectorAll('.number');
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'decimal') {
                inputDecimal('.');
            } else {
                inputDigit(button.textContent);
            }
            updateDisplay();
        });
    });

    // Add event listeners to operation buttons
    const operationButtons = document.querySelectorAll('.operation');
    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'equals') {
                handleEquals();
            } else {
                handleOperator(button.textContent);
            }
            updateDisplay();
        });
    });

    // Add event listeners to utility buttons
    document.getElementById('clear').addEventListener('click', () => {
        resetCalculator();
        updateDisplay();
    });

    document.getElementById('plus-minus').addEventListener('click', () => {
        togglePlusMinus();
        updateDisplay();
    });

    document.getElementById('percent').addEventListener('click', () => {
        handlePercentage();
        updateDisplay();
    });

    // Add keyboard support
    document.addEventListener('keydown', (event) => {
        let key = event.key;
        
        // Prevent default behavior for calculator keys
        if (/[0-9\.\+\-\*\/=%]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            event.preventDefault();
        }
        
        // Handle number keys
        if (/[0-9]/.test(key)) {
            inputDigit(key);
        } else if (key === '.') {
            inputDecimal(key);
        } else if (key === '+') {
            handleOperator('+');
        } else if (key === '-') {
            handleOperator('−');
        } else if (key === '*') {
            handleOperator('×');
        } else if (key === '/') {
            handleOperator('÷');
        } else if (key === 'Enter' || key === '=') {
            handleEquals();
        } else if (key === '%') {
            handlePercentage();
        } else if (key === 'Escape') {
            resetCalculator();
        } else if (key === 'Backspace') {
            // Handle backspace to delete last digit
            if (calculator.displayValue.length > 1) {
                calculator.displayValue = calculator.displayValue.slice(0, -1);
            } else {
                calculator.displayValue = '0';
            }
        }
        
        updateDisplay();
    });

    // Initialize display
    updateDisplay();
});