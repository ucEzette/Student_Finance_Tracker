/**
 * Validators - Form validation and regex patterns
 */

export class Validators {
    constructor() {
        // Core validation patterns
        this.patterns = {
            description: /^\S(?:.*\S)?$/,
            amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
            date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
            category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

            // Advanced patterns
            duplicateWords: /\b(\w+)\s+\1\b/gi,
            centsPresent: /\.\d{2}\b/g,
            beverageKeywords: /(coffee|tea|juice|soda|beer|wine|water)/gi,
            passwordStrength: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
            phoneNumber: /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
            creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,

            // Search patterns
            searchTag: /^@\w+:/,
            timePattern: /\b\d{1,2}:\d{2}\b/g,
            currencyAmount: /\$?\d+(?:\.\d{2})?/g,

            // Specific finance patterns
            expenseRange: /\$([5-9]\d|[1-9]\d{2,})/g,
            smallExpense: /\$([1-4]\d?)\b/g,
            roundAmount: /\$\d+\.00\b/g
        };

        // Validation rules with descriptions
        this.rules = {
            description: {
                pattern: this.patterns.description,
                message: 'Description cannot have leading/trailing spaces or be empty',
                test: (value) => this.patterns.description.test(value.trim())
            },
            amount: {
                pattern: this.patterns.amount,
                message: 'Amount must be a valid number with up to 2 decimal places',
                test: (value) => this.patterns.amount.test(value.toString())
            },
            date: {
                pattern: this.patterns.date,
                message: 'Date must be in YYYY-MM-DD format',
                test: (value) => this.patterns.date.test(value) && this.isValidDate(value)
            },
            category: {
                pattern: this.patterns.category,
                message: 'Category can only contain letters, spaces, and hyphens',
                test: (value) => this.patterns.category.test(value)
            }
        };
    }

    // Core validation methods
    validateDescription(value) {
        if (!value || typeof value !== 'string') return false;

        const trimmed = value.trim();
        if (trimmed.length === 0) return false;

        // Check for leading/trailing spaces in original value
        if (value !== trimmed) return false;

        // Check for double spaces
        if (value.includes('  ')) return false;

        return this.patterns.description.test(value);
    }

    validateAmount(value) {
        if (value === '' || value === null || value === undefined) return false;

        // Handle both string and number inputs
        const stringValue = value.toString();

        // Check basic pattern
        if (!this.patterns.amount.test(stringValue)) return false;

        // Convert to number and validate
        const numValue = parseFloat(stringValue);
        if (isNaN(numValue) || numValue < 0) return false;

        // Check for reasonable maximum (prevent overflow)
        if (numValue > 999999.99) return false;

        return true;
    }

    validateDate(value) {
        if (!value || typeof value !== 'string') return false;

        // Check pattern first
        if (!this.patterns.date.test(value)) return false;

        // Validate actual date
        return this.isValidDate(value);
    }

    validateCategory(value) {
        if (!value || typeof value !== 'string') return false;

        const trimmed = value.trim();
        if (trimmed.length === 0) return false;

        return this.patterns.category.test(trimmed);
    }

    // Advanced validation helpers
    isValidDate(dateString) {
        const date = new Date(dateString);
        const [year, month, day] = dateString.split('-').map(Number);

        return date.getFullYear() === year &&
               date.getMonth() === month - 1 &&
               date.getDate() === day;
    }

    validateEmail(email) {
        return this.patterns.email.test(email);
    }

    validatePasswordStrength(password) {
        return this.patterns.passwordStrength.test(password);
    }

    // Advanced regex pattern matching
    findDuplicateWords(text) {
        const matches = [...text.matchAll(this.patterns.duplicateWords)];
        return matches.map(match => ({
            word: match[1],
            position: match.index,
            fullMatch: match[0]
        }));
    }

    findCentsAmounts(text) {
        const matches = [...text.matchAll(this.patterns.centsPresent)];
        return matches.map(match => ({
            amount: match[0],
            position: match.index
        }));
    }

    findBeverageKeywords(text) {
        const matches = [...text.matchAll(this.patterns.beverageKeywords)];
        return matches.map(match => ({
            beverage: match[0],
            position: match.index
        }));
    }

    // Form validation with detailed feedback
    validateForm(formData) {
        const errors = {};
        const warnings = [];

        // Required field validation
        if (!this.validateDescription(formData.description)) {
            errors.description = this.rules.description.message;
        }

        if (!this.validateAmount(formData.amount)) {
            errors.amount = this.rules.amount.message;
        }

        if (!this.validateCategory(formData.category)) {
            errors.category = this.rules.category.message;
        }

        if (!this.validateDate(formData.date)) {
            errors.date = this.rules.date.message;
        }

        // Advanced validation warnings
        if (formData.description) {
            const duplicates = this.findDuplicateWords(formData.description);
            if (duplicates.length > 0) {
                warnings.push(`Duplicate words found: ${duplicates.map(d => d.word).join(', ')}`);
            }
        }

        // Amount warnings
        if (formData.amount) {
            const amount = parseFloat(formData.amount);
            if (amount > 100) {
                warnings.push('Large amount detected - please verify');
            }
            if (amount < 1) {
                warnings.push('Small amount detected - are you sure?');
            }
        }

        // Date warnings
        if (formData.date) {
            const transactionDate = new Date(formData.date);
            const today = new Date();
            const daysDiff = (today - transactionDate) / (1000 * 60 * 60 * 24);

            if (daysDiff > 30) {
                warnings.push('Transaction is more than 30 days old');
            }
            if (daysDiff < -1) {
                warnings.push('Future date detected');
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings
        };
    }

    // Import data validation
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Invalid data format' };
        }

        const errors = [];

        // Check transactions array
        if (data.transactions) {
            if (!Array.isArray(data.transactions)) {
                errors.push('Transactions must be an array');
            } else {
                data.transactions.forEach((transaction, index) => {
                    const validation = this.validateTransaction(transaction);
                    if (!validation.valid) {
                        errors.push(`Transaction ${index + 1}: ${validation.error}`);
                    }
                });
            }
        }

        // Check settings object
        if (data.settings && typeof data.settings !== 'object') {
            errors.push('Settings must be an object');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateTransaction(transaction) {
        if (!transaction || typeof transaction !== 'object') {
            return { valid: false, error: 'Transaction must be an object' };
        }

        const required = ['id', 'description', 'amount', 'category', 'date', 'createdAt', 'updatedAt'];

        for (const field of required) {
            if (!(field in transaction)) {
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }

        // Validate individual fields
        if (!this.validateDescription(transaction.description)) {
            return { valid: false, error: 'Invalid description' };
        }

        if (!this.validateAmount(transaction.amount)) {
            return { valid: false, error: 'Invalid amount' };
        }

        if (!this.validateCategory(transaction.category)) {
            return { valid: false, error: 'Invalid category' };
        }

        if (!this.validateDate(transaction.date)) {
            return { valid: false, error: 'Invalid date' };
        }

        // Validate timestamps
        try {
            new Date(transaction.createdAt);
            new Date(transaction.updatedAt);
        } catch {
            return { valid: false, error: 'Invalid timestamps' };
        }

        return { valid: true };
    }

    // Pattern testing utility
    testPattern(pattern, text, flags = 'gi') {
        try {
            const regex = new RegExp(pattern, flags);
            const matches = [...text.matchAll(regex)];

            return {
                success: true,
                matches: matches.map(match => ({
                    match: match[0],
                    position: match.index,
                    groups: match.slice(1)
                })),
                count: matches.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get all available patterns for documentation
    getPatternCatalog() {
        return Object.keys(this.patterns).map(name => ({
            name,
            pattern: this.patterns[name].source,
            flags: this.patterns[name].flags,
            description: this.getPatternDescription(name)
        }));
    }

    getPatternDescription(name) {
        const descriptions = {
            description: 'No leading/trailing spaces, no empty strings',
            amount: 'Valid currency amount with optional cents (up to 2 decimal places)',
            date: 'ISO date format YYYY-MM-DD with valid month/day ranges',
            category: 'Letters, spaces, and hyphens only',
            duplicateWords: 'Finds consecutive duplicate words (case insensitive)',
            centsPresent: 'Finds amounts with exactly 2 decimal places',
            beverageKeywords: 'Matches common beverage terms',
            passwordStrength: 'Strong password with uppercase, lowercase, digit, and special char',
            expenseRange: 'Finds expenses $50 and above',
            smallExpense: 'Finds expenses under $50',
            roundAmount: 'Finds round dollar amounts (ending in .00)'
        };

        return descriptions[name] || 'No description available';
    }
}