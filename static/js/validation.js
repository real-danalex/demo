/* ============================================
   COUNTRYFRESH BAKERY - FORM VALIDATION
   ============================================ */

'use strict';

// ============================================
// 1. VALIDATION RULES
// ============================================

const validationRules = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        pattern: /^[0-9]{11}$/,
        message: 'Please enter a valid 11-digit phone number'
    },
    password: {
        minLength: 6,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
        message: 'Password must be at least 6 characters with letters and numbers'
    },
    name: {
        minLength: 2,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Please enter a valid name (letters only)'
    },
    required: {
        message: 'This field is required'
    }
};

// ============================================
// 2. FORM VALIDATOR CLASS
// ============================================

class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (!this.form) return;
        
        this.fields = this.form.querySelectorAll('input, textarea, select');
        this.errors = {};
        
        this.init();
    }
    
    init() {
        // Add novalidate to prevent browser validation
        this.form.setAttribute('novalidate', '');
        
        // Real-time validation on blur
        this.fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            // Clear error on input
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
        
        // Validate on submit
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.focusFirstError();
            }
        });
    }
    
    validateForm() {
        let isValid = true;
        this.errors = {};
        
        this.fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const name = field.name || field.id;
        const type = field.type;
        
        // Skip validation for hidden or disabled fields
        if (field.type === 'hidden' || field.disabled) {
            return true;
        }
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.setFieldError(field, validationRules.required.message);
            return false;
        }
        
        // Skip other validations if field is empty and not required
        if (!value && !field.hasAttribute('required')) {
            this.clearFieldError(field);
            return true;
        }
        
        // Type-specific validation
        switch (type) {
            case 'email':
                return this.validateEmail(field, value);
            case 'tel':
                return this.validatePhone(field, value);
            case 'password':
                return this.validatePassword(field, value);
            case 'number':
                return this.validateNumber(field, value);
            default:
                // Check for custom validation
                if (field.dataset.validate) {
                    return this.validateCustom(field, value);
                }
                return true;
        }
    }
    
    validateEmail(field, value) {
        if (!validationRules.email.pattern.test(value)) {
            this.setFieldError(field, validationRules.email.message);
            return false;
        }
        this.clearFieldError(field);
        return true;
    }
    
    validatePhone(field, value) {
        // Remove any non-digit characters
        const cleanPhone = value.replace(/\D/g, '');
        
        if (!validationRules.phone.pattern.test(cleanPhone)) {
            this.setFieldError(field, validationRules.phone.message);
            return false;
        }
        this.clearFieldError(field);
        return true;
    }
    
    validatePassword(field, value) {
        const minLength = field.getAttribute('minlength') || validationRules.password.minLength;
        
        if (value.length < minLength) {
            this.setFieldError(field, `Password must be at least ${minLength} characters`);
            return false;
        }
        
        // Check for password strength (optional)
        if (field.dataset.validateStrength === 'true') {
            if (!validationRules.password.pattern.test(value)) {
                this.setFieldError(field, validationRules.password.message);
                return false;
            }
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    validateNumber(field, value) {
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            this.setFieldError(field, 'Please enter a valid number');
            return false;
        }
        
        if (min !== null && num < parseFloat(min)) {
            this.setFieldError(field, `Value must be at least ${min}`);
            return false;
        }
        
        if (max !== null && num > parseFloat(max)) {
            this.setFieldError(field, `Value must be at most ${max}`);
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    validateCustom(field, value) {
        const validationType = field.dataset.validate;
        
        switch (validationType) {
            case 'name':
                if (!validationRules.name.pattern.test(value) || value.length < validationRules.name.minLength) {
                    this.setFieldError(field, validationRules.name.message);
                    return false;
                }
                break;
            case 'match':
                const matchField = document.getElementById(field.dataset.match);
                if (matchField && value !== matchField.value) {
                    this.setFieldError(field, field.dataset.matchMessage || 'Fields do not match');
                    return false;
                }
                break;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    setFieldError(field, message) {
        const name = field.name || field.id;
        this.errors[name] = message;
        
        // Add error class to field
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        // Create or update error message
        let errorElement = field.parentElement.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentElement.appendChild(errorElement);
        }
        
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorElement.setAttribute('role', 'alert');
    }
    
    clearFieldError(field) {
        const name = field.name || field.id;
        delete this.errors[name];
        
        // Remove error class
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        // Remove error message
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    focusFirstError() {
        const firstErrorField = this.form.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    reset() {
        this.errors = {};
        this.fields.forEach(field => {
            this.clearFieldError(field);
        });
        this.form.reset();
    }
}

// ============================================
// 3. PASSWORD STRENGTH CHECKER
// ============================================

class PasswordStrength {
    constructor(passwordFieldSelector) {
        this.passwordField = document.querySelector(passwordFieldSelector);
        if (!this.passwordField) return;
        
        this.init();
    }
    
    init() {
        // Create strength indicator
        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <span class="strength-text"></span>
        `;
        
        this.passwordField.parentElement.appendChild(indicator);
        
        this.strengthBar = indicator.querySelector('.strength-fill');
        this.strengthText = indicator.querySelector('.strength-text');
        
        // Listen for password input
        this.passwordField.addEventListener('input', () => {
            this.checkStrength(this.passwordField.value);
        });
    }
    
    checkStrength(password) {
        if (!password) {
            this.updateIndicator(0, '');
            return;
        }
        
        let strength = 0;
        
        // Length check
        if (password.length >= 6) strength += 20;
        if (password.length >= 10) strength += 20;
        
        // Lowercase letters
        if (/[a-z]/.test(password)) strength += 20;
        
        // Uppercase letters
        if (/[A-Z]/.test(password)) strength += 20;
        
        // Numbers
        if (/[0-9]/.test(password)) strength += 10;
        
        // Special characters
        if (/[^A-Za-z0-9]/.test(password)) strength += 10;
        
        let label = '';
        if (strength <= 30) label = 'Weak';
        else if (strength <= 60) label = 'Fair';
        else if (strength <= 80) label = 'Good';
        else label = 'Strong';
        
        this.updateIndicator(strength, label);
    }
    
    updateIndicator(strength, label) {
        this.strengthBar.style.width = `${strength}%`;
        this.strengthText.textContent = label;
        
        // Update color
        this.strengthBar.classList.remove('weak', 'fair', 'good', 'strong');
        
        if (strength <= 30) this.strengthBar.classList.add('weak');
        else if (strength <= 60) this.strengthBar.classList.add('fair');
        else if (strength <= 80) this.strengthBar.classList.add('good');
        else this.strengthBar.classList.add('strong');
    }
}

// ============================================
// 4. PASSWORD MATCH VALIDATOR
// ============================================

function validatePasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    
    if (!password || !confirmPassword) return;
    
    confirmPassword.addEventListener('input', function() {
        if (this.value && this.value !== password.value) {
            this.setCustomValidity('Passwords do not match');
            this.classList.add('error');
        } else {
            this.setCustomValidity('');
            this.classList.remove('error');
        }
    });
    
    password.addEventListener('input', function() {
        if (confirmPassword.value) {
            confirmPassword.dispatchEvent(new Event('input'));
        }
    });
}

// ============================================
// 5. PHONE NUMBER FORMATTER
// ============================================

function initPhoneFormatter() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Limit to 11 digits
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            this.value = value;
        });
        
        // Add placeholder
        if (!input.placeholder) {
            input.placeholder = '08012345678';
        }
    });
}

// ============================================
// 6. CREDIT CARD VALIDATOR (Optional)
// ============================================

class CreditCardValidator {
    static validateCardNumber(number) {
        // Remove spaces and dashes
        number = number.replace(/[\s-]/g, '');
        
        // Check if it's all digits
        if (!/^\d+$/.test(number)) return false;
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    static getCardType(number) {
        number = number.replace(/[\s-]/g, '');
        
        if (/^4/.test(number)) return 'Visa';
        if (/^5[1-5]/.test(number)) return 'Mastercard';
        if (/^3[47]/.test(number)) return 'American Express';
        if (/^6(?:011|5)/.test(number)) return 'Discover';
        
        return 'Unknown';
    }
    
    static formatCardNumber(number) {
        number = number.replace(/\D/g, '');
        return number.match(/.{1,4}/g)?.join(' ') || number;
    }
}

// ============================================
// 7. INITIALIZE ALL VALIDATORS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validators
    const forms = document.querySelectorAll('form:not([data-no-validate])');
    forms.forEach(form => {
        new FormValidator(`#${form.id}` || 'form');
    });
    
    // Initialize password strength checker
    const passwordField = document.getElementById('password');
    if (passwordField && passwordField.type === 'password') {
        new PasswordStrength('#password');
    }
    
    // Initialize password match validation
    validatePasswordMatch();
    
    // Initialize phone formatter
    initPhoneFormatter();
    
    console.log('Form validation initialized');
});

// ============================================
// 8. EXPORT
// ============================================

// Make classes globally accessible
window.FormValidator = FormValidator;
window.PasswordStrength = PasswordStrength;
window.CreditCardValidator = CreditCardValidator;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FormValidator,
        PasswordStrength,
        CreditCardValidator,
        validationRules
    };
}