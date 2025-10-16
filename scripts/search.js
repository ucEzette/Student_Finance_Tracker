/**
 * Search Manager - Handle search functionality and regex compilation
 */

export class SearchManager {
    constructor() {
        this.lastCompiledPattern = null;
        this.lastFlags = '';
        this.searchHistory = [];
        this.maxHistoryItems = 10;
    }

    searchTransactions(transactions, pattern, caseInsensitive = true) {
        if (!pattern || pattern.trim() === '') {
            return transactions;
        }

        const regex = this.compileRegex(pattern, caseInsensitive);
        if (!regex) {
            return transactions;
        }

        // Add to search history
        this.addToHistory(pattern, caseInsensitive);

        return transactions.filter(transaction => {
            return this.matchesTransaction(transaction, regex);
        });
    }

    compileRegex(pattern, caseInsensitive = true) {
        try {
            const flags = caseInsensitive ? 'gi' : 'g';

            // Cache compiled regex if same pattern and flags
            if (this.lastCompiledPattern === pattern && this.lastFlags === flags) {
                return this.lastCompiledRegex;
            }

            const regex = new RegExp(pattern, flags);

            // Cache the compiled regex
            this.lastCompiledPattern = pattern;
            this.lastFlags = flags;
            this.lastCompiledRegex = regex;

            return regex;

        } catch (error) {
            console.warn('Invalid regex pattern:', pattern, error.message);
            this.showRegexError(error.message);
            return null;
        }
    }

    matchesTransaction(transaction, regex) {
        // Search in multiple fields
        const searchFields = [
            transaction.description,
            transaction.category,
            transaction.amount.toString(),
            transaction.date,
            this.formatCurrency(transaction.amount)
        ];

        return searchFields.some(field => {
            if (typeof field === 'string') {
                return regex.test(field);
            }
            return false;
        });
    }

    highlightMatches(text, regex) {
        if (!regex || typeof text !== 'string') {
            return text;
        }

        try {
            // Reset regex lastIndex to ensure consistent matching
            regex.lastIndex = 0;

            return text.replace(regex, (match) => {
                return `<mark>${this.escapeHtml(match)}</mark>`;
            });
        } catch (error) {
            console.error('Error highlighting matches:', error);
            return text;
        }
    }

    addToHistory(pattern, caseInsensitive) {
        const historyItem = {
            pattern,
            caseInsensitive,
            timestamp: new Date().toISOString(),
            useCount: 1
        };

        // Check if pattern already exists
        const existingIndex = this.searchHistory.findIndex(item => 
            item.pattern === pattern && item.caseInsensitive === caseInsensitive
        );

        if (existingIndex >= 0) {
            // Update existing item
            this.searchHistory[existingIndex].useCount++;
            this.searchHistory[existingIndex].timestamp = historyItem.timestamp;
        } else {
            // Add new item
            this.searchHistory.unshift(historyItem);

            // Limit history size
            if (this.searchHistory.length > this.maxHistoryItems) {
                this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
            }
        }
    }

    getSearchHistory() {
        return [...this.searchHistory];
    }

    clearSearchHistory() {
        this.searchHistory = [];
    }

    // Predefined search patterns for quick access
    getPredefinedPatterns() {
        return [
            {
                name: 'Amounts with cents',
                pattern: '\\.\\d{2}\\b',
                description: 'Find amounts with exactly 2 decimal places',
                example: '$12.50, $99.99'
            },
            {
                name: 'Beverage purchases',
                pattern: '(coffee|tea|juice|soda|water)',
                description: 'Find beverage-related transactions',
                example: 'coffee, tea, juice'
            },
            {
                name: 'Duplicate words',
                pattern: '\\b(\\w+)\\s+\\1\\b',
                description: 'Find descriptions with repeated words',
                example: 'the the, coffee coffee'
            },
            {
                name: 'Large expenses',
                pattern: '\\$([5-9]\\d|[1-9]\\d{2,})',
                description: 'Find expenses of $50 or more',
                example: '$50, $100, $500'
            },
            {
                name: 'Food categories',
                pattern: '^(Food|Restaurant|Dining|Lunch|Dinner|Breakfast)$',
                description: 'Find food-related categories',
                example: 'Food, Restaurant, Lunch'
            },
            {
                name: 'Weekend dates',
                pattern: '\\d{4}-(\\d{2})-(0[16]|[12][369]|[23][06])',
                description: 'Find transactions on weekends (approximate)',
                example: 'Saturdays and Sundays'
            },
            {
                name: 'Round amounts',
                pattern: '\\$\\d+\\.00\\b',
                description: 'Find round dollar amounts',
                example: '$10.00, $25.00, $100.00'
            },
            {
                name: 'Recent dates',
                pattern: '2025-(1[0-2])-\\d{2}',
                description: 'Find transactions from recent months',
                example: '2025-10-15, 2025-11-20'
            }
        ];
    }

    // Advanced search with multiple criteria
    advancedSearch(transactions, criteria) {
        let results = transactions;

        // Apply text search
        if (criteria.text) {
            const regex = this.compileRegex(criteria.text, criteria.caseInsensitive);
            if (regex) {
                results = results.filter(t => this.matchesTransaction(t, regex));
            }
        }

        // Apply amount range
        if (criteria.minAmount !== undefined || criteria.maxAmount !== undefined) {
            results = results.filter(t => {
                const amount = parseFloat(t.amount);
                if (criteria.minAmount !== undefined && amount < criteria.minAmount) {
                    return false;
                }
                if (criteria.maxAmount !== undefined && amount > criteria.maxAmount) {
                    return false;
                }
                return true;
            });
        }

        // Apply date range
        if (criteria.startDate || criteria.endDate) {
            results = results.filter(t => {
                const date = new Date(t.date);
                if (criteria.startDate && date < new Date(criteria.startDate)) {
                    return false;
                }
                if (criteria.endDate && date > new Date(criteria.endDate)) {
                    return false;
                }
                return true;
            });
        }

        // Apply category filter
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(t => criteria.categories.includes(t.category));
        }

        return results;
    }

    // Search suggestions based on transaction data
    generateSearchSuggestions(transactions) {
        const suggestions = new Set();

        // Add common patterns
        suggestions.add('coffee|tea');
        suggestions.add('\\.\\d{2}\\b');
        suggestions.add('\\b(\\w+)\\s+\\1\\b');

        // Add categories as exact match patterns
        const categories = [...new Set(transactions.map(t => t.category))];
        categories.forEach(category => {
            suggestions.add(`^${this.escapeRegex(category)}$`);
        });

        // Add common words from descriptions
        const words = new Set();
        transactions.forEach(t => {
            const descWords = t.description.toLowerCase().split(/\s+/);
            descWords.forEach(word => {
                if (word.length > 3) {
                    words.add(word);
                }
            });
        });

        // Add most common words as search patterns
        const sortedWords = [...words].sort();
        sortedWords.slice(0, 10).forEach(word => {
            suggestions.add(this.escapeRegex(word));
        });

        return [...suggestions];
    }

    // Validate search pattern
    validatePattern(pattern) {
        try {
            new RegExp(pattern);
            return { valid: true };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message,
                suggestion: this.suggestPatternFix(pattern, error)
            };
        }
    }

    suggestPatternFix(pattern, error) {
        const suggestions = [];

        if (error.message.includes('Unterminated character class')) {
            suggestions.push('Check for unmatched [ or ] brackets');
        }

        if (error.message.includes('Unterminated group')) {
            suggestions.push('Check for unmatched ( or ) parentheses');
        }

        if (error.message.includes('Nothing to repeat')) {
            suggestions.push('Check for quantifiers (+, *, ?) without preceding character');
        }

        if (error.message.includes('Invalid escape')) {
            suggestions.push('Use double backslashes for literal backslashes: \\\\');
        }

        return suggestions.length > 0 ? suggestions[0] : 'Check regex syntax';
    }

    // Utility methods
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    showRegexError(message) {
        const errorElement = document.getElementById('search-error');
        if (errorElement) {
            errorElement.textContent = `Invalid pattern: ${message}`;
            errorElement.style.display = 'block';

            // Hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
}