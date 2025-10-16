/**
 * State Manager - Application state management
 */

export class StateManager {
    constructor() {
        this.transactions = [];
        this.settings = {};
        this.filters = {
            search: '',
            category: '',
            dateRange: null
        };
        this.sortConfig = {
            field: 'date',
            direction: 'desc'
        };
    }

    // Transaction state management
    setTransactions(transactions) {
        this.transactions = Array.isArray(transactions) ? [...transactions] : [];
        this.notifyObservers('transactions', this.transactions);
    }

    getTransactions() {
        return [...this.transactions];
    }

    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    addTransaction(transaction) {
        if (!transaction || !transaction.id) {
            throw new Error('Invalid transaction');
        }

        this.transactions.push({ ...transaction });
        this.notifyObservers('transactions', this.transactions);
    }

    updateTransaction(id, updatedTransaction) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        this.transactions[index] = { ...updatedTransaction };
        this.notifyObservers('transactions', this.transactions);
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        this.transactions.splice(index, 1);
        this.notifyObservers('transactions', this.transactions);
    }

    clearTransactions() {
        this.transactions = [];
        this.notifyObservers('transactions', this.transactions);
    }

    // Settings state management
    setSettings(settings) {
        this.settings = { ...settings };
        this.notifyObservers('settings', this.settings);
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.notifyObservers('settings', this.settings);
    }

    setSpendingCap(amount) {
        this.settings.spendingCap = amount;
        this.notifyObservers('settings', this.settings);
    }

    getSpendingCap() {
        return this.settings.spendingCap || null;
    }

    // Filter state management
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.notifyObservers('filters', this.filters);
    }

    getFilters() {
        return { ...this.filters };
    }

    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            dateRange: null
        };
        this.notifyObservers('filters', this.filters);
    }

    // Sort configuration
    setSortConfig(field, direction) {
        this.sortConfig = { field, direction };
        this.notifyObservers('sort', this.sortConfig);
    }

    getSortConfig() {
        return { ...this.sortConfig };
    }

    // Computed state getters
    getTotalAmount() {
        return this.transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    getTransactionsByCategory() {
        const categories = {};
        this.transactions.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        return categories;
    }

    getTransactionsByMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    getRecentTransactions(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= cutoffDate;
        });
    }

    // Category management
    getCategories() {
        return this.settings.categories || [];
    }

    addCategory(category) {
        if (!this.settings.categories) {
            this.settings.categories = [];
        }

        if (!this.settings.categories.includes(category)) {
            this.settings.categories.push(category);
            this.notifyObservers('settings', this.settings);
        }
    }

    removeCategory(category) {
        if (this.settings.categories) {
            this.settings.categories = this.settings.categories.filter(c => c !== category);
            this.notifyObservers('settings', this.settings);
        }
    }

    // Observer pattern for state changes
    observers = {};

    subscribe(event, callback) {
        if (!this.observers[event]) {
            this.observers[event] = [];
        }
        this.observers[event].push(callback);
    }

    unsubscribe(event, callback) {
        if (this.observers[event]) {
            this.observers[event] = this.observers[event].filter(cb => cb !== callback);
        }
    }

    notifyObservers(event, data) {
        if (this.observers[event]) {
            this.observers[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in observer callback:', error);
                }
            });
        }
    }

    // State serialization for debugging
    serialize() {
        return {
            transactions: this.transactions,
            settings: this.settings,
            filters: this.filters,
            sortConfig: this.sortConfig,
            timestamp: new Date().toISOString()
        };
    }

    // Validation helpers
    isValidTransaction(transaction) {
        const required = ['id', 'description', 'amount', 'category', 'date'];
        return required.every(field => field in transaction && transaction[field] !== '');
    }

    // Statistics helpers
    getStatistics() {
        if (this.transactions.length === 0) {
            return {
                totalRecords: 0,
                totalAmount: 0,
                averageAmount: 0,
                topCategory: null,
                categoryCounts: {},
                monthlyTotals: {}
            };
        }

        const totalAmount = this.getTotalAmount();
        const categoryCounts = {};
        const monthlyTotals = {};

        this.transactions.forEach(t => {
            // Category counts
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;

            // Monthly totals
            const monthKey = t.date.slice(0, 7); // YYYY-MM
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
        });

        // Find top category
        const topCategory = Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b, null
        );

        return {
            totalRecords: this.transactions.length,
            totalAmount,
            averageAmount: totalAmount / this.transactions.length,
            topCategory,
            categoryCounts,
            monthlyTotals
        };
    }
}