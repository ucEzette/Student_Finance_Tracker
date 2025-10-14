/**
 * Student Finance Tracker - Main Application
 * Entry point and app coordination
 */

import { StorageManager } from './storage.js';
import { StateManager } from './state.js';
import { UIManager } from './ui.js';
import { Validators } from './validators.js';
import { SearchManager } from './search.js';
import { StatsManager } from './stats.js';

class FinanceTrackerApp {
    constructor() {
        this.storage = new StorageManager();
        this.state = new StateManager();
        this.ui = new UIManager();
        this.validators = new Validators();
        this.search = new SearchManager();
        this.stats = new StatsManager();

        this.currentSection = 'dashboard';
        this.editingId = null;

        this.init();
    }

    async init() {
        try {
            // Load data from localStorage
            await this.loadData();

            // Initialize UI
            this.ui.init();

            // Set up event listeners
            this.setupEventListeners();

            // Update dashboard
            this.updateDashboard();

            // Show initial section
            this.showSection('dashboard');

            console.log('Finance Tracker App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            const data = this.storage.loadTransactions();
            const settings = this.storage.loadSettings();

            this.state.setTransactions(data);
            this.state.setSettings(settings);

            // Update UI with loaded data
            this.ui.renderRecords(data);
            this.ui.updateSettingsUI(settings);

        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        menuToggle?.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            nav.style.display = isExpanded ? 'none' : 'block';
        });

        // Form submission
        const form = document.getElementById('transaction-form');
        form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const caseInsensitive = document.getElementById('case-insensitive');
        const clearSearch = document.getElementById('clear-search');

        searchInput?.addEventListener('input', () => this.handleSearch());
        caseInsensitive?.addEventListener('change', () => this.handleSearch());
        clearSearch?.addEventListener('click', () => this.clearSearch());

        // Sorting
        const sortField = document.getElementById('sort-field');
        const sortDirection = document.getElementById('sort-direction');

        sortField?.addEventListener('change', () => this.handleSort());
        sortDirection?.addEventListener('click', () => this.toggleSortDirection());

        // Spending cap
        const setCapBtn = document.getElementById('set-cap-btn');
        setCapBtn?.addEventListener('click', () => this.setSpendingCap());

        // Settings
        const saveCurrencyBtn = document.getElementById('save-currency');
        saveCurrencyBtn?.addEventListener('click', () => this.saveCurrencySettings());

        // Data management
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const clearBtn = document.getElementById('clear-data');

        exportBtn?.addEventListener('click', () => this.exportData());
        importBtn?.addEventListener('click', () => this.importData());
        clearBtn?.addEventListener('click', () => this.clearAllData());

        // Regex tester
        const testRegexBtn = document.getElementById('test-regex');
        testRegexBtn?.addEventListener('click', () => this.testRegexPattern());

        // Real-time form validation
        this.setupFormValidation();

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupFormValidation() {
        const fields = ['description', 'amount', 'category', 'date'];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
    }

    setupKeyboardNavigation() {
        // ESC key to cancel editing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.editingId) {
                    this.cancelEdit();
                }
            }
        });

        // Enter key shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const activeSection = document.querySelector('.section.active');
                if (activeSection?.id === 'add-edit') {
                    const form = document.getElementById('transaction-form');
                    form?.requestSubmit();
                }
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;

            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
            activeLink?.classList.add('active');

            // Section-specific initialization
            if (sectionName === 'dashboard') {
                this.updateDashboard();
            } else if (sectionName === 'records') {
                this.refreshRecords();
            }

            // Announce section change for screen readers
            this.announceStatus(`Switched to ${sectionName} section`);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = this.getFormData();
        const isValid = this.validateForm(formData);

        if (!isValid) {
            this.announceError('Please fix the form errors before submitting');
            return;
        }

        try {
            if (this.editingId) {
                await this.updateTransaction(this.editingId, formData);
                this.announceStatus('Transaction updated successfully');
            } else {
                await this.addTransaction(formData);
                this.announceStatus('Transaction added successfully');
            }

            this.resetForm();
            this.showSection('records');

        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showError('Failed to save transaction. Please try again.');
        }
    }

    getFormData() {
        return {
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };
    }

    validateForm(data) {
        let isValid = true;

        // Validate each field
        ['description', 'amount', 'category', 'date'].forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const value = field.value.trim();

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'description':
                if (!this.validators.validateDescription(value)) {
                    isValid = false;
                    errorMessage = 'Description cannot have leading/trailing spaces or be empty';
                }
                break;

            case 'amount':
                if (!this.validators.validateAmount(value)) {
                    isValid = false;
                    errorMessage = 'Amount must be a valid number with up to 2 decimal places';
                }
                break;

            case 'category':
                if (!this.validators.validateCategory(value)) {
                    isValid = false;
                    errorMessage = 'Please select a valid category';
                }
                break;

            case 'date':
                if (!this.validators.validateDate(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid date (YYYY-MM-DD)';
                }
                break;
        }

        // Update UI
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }

        field.classList.toggle('error', !isValid);

        return isValid;
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);

        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    async addTransaction(data) {
        const transaction = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.state.addTransaction(transaction);
        this.storage.saveTransactions(this.state.getTransactions());
        this.updateDashboard();
        this.refreshRecords();
    }

    async updateTransaction(id, data) {
        const updatedTransaction = {
            ...this.state.getTransaction(id),
            ...data,
            updatedAt: new Date().toISOString()
        };

        this.state.updateTransaction(id, updatedTransaction);
        this.storage.saveTransactions(this.state.getTransactions());
        this.updateDashboard();
        this.refreshRecords();
    }

    generateId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    handleSearch() {
        const query = document.getElementById('search-input').value;
        const caseInsensitive = document.getElementById('case-insensitive').checked;

        const results = this.search.searchTransactions(
            this.state.getTransactions(),
            query,
            caseInsensitive
        );

        this.ui.renderRecords(results);
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        document.getElementById('case-insensitive').checked = false;
        this.refreshRecords();
    }

    handleSort() {
        const field = document.getElementById('sort-field').value;
        const direction = document.getElementById('sort-direction').textContent === '⬇️' ? 'desc' : 'asc';

        const transactions = this.state.getTransactions();
        const sorted = this.sortTransactions(transactions, field, direction);
        this.ui.renderRecords(sorted);
    }

    toggleSortDirection() {
        const btn = document.getElementById('sort-direction');
        const isDesc = btn.textContent === '⬇️';
        btn.textContent = isDesc ? '⬆️' : '⬇️';
        btn.setAttribute('aria-label', isDesc ? 'Sort ascending' : 'Sort descending');
        this.handleSort();
    }

    sortTransactions(transactions, field, direction) {
        return [...transactions].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (field === 'amount') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else if (field === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }

            if (direction === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
    }

    updateDashboard() {
        const transactions = this.state.getTransactions();
        const stats = this.stats.calculateStats(transactions);

        // Update stat cards
        document.getElementById('total-records').textContent = stats.totalRecords;
        document.getElementById('total-amount').textContent = this.formatCurrency(stats.totalAmount);
        document.getElementById('top-category').textContent = stats.topCategory || 'None';
        document.getElementById('week-trend').textContent = this.formatCurrency(stats.weekTrend);

        // Update trend chart
        this.updateTrendChart(stats.dailyTrends);

        // Update spending cap
        this.updateSpendingCapDisplay();
    }

    updateTrendChart(dailyTrends) {
        const chartContainer = document.getElementById('trend-chart');
        if (!chartContainer || !dailyTrends.length) return;

        const maxAmount = Math.max(...dailyTrends.map(d => d.amount));

        chartContainer.innerHTML = dailyTrends.map(day => {
            const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
            return `<div class="chart-bar" style="height: ${height}%" data-value="$${day.amount.toFixed(2)}" title="${day.date}: $${day.amount.toFixed(2)}"></div>`;
        }).join('');
    }

    setSpendingCap() {
        const capInput = document.getElementById('spending-cap');
        const cap = parseFloat(capInput.value);

        if (isNaN(cap) || cap <= 0) {
            this.showError('Please enter a valid spending cap amount');
            return;
        }

        this.state.setSpendingCap(cap);
        this.storage.saveSettings(this.state.getSettings());
        this.updateSpendingCapDisplay();
        this.announceStatus(`Spending cap set to ${this.formatCurrency(cap)}`);
    }

    updateSpendingCapDisplay() {
        const settings = this.state.getSettings();
        const cap = settings.spendingCap;

        if (!cap) {
            document.getElementById('cap-message').textContent = 'No spending cap set';
            document.getElementById('cap-bar').style.width = '0%';
            return;
        }

        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthlySpending = this.stats.getMonthlySpending(
            this.state.getTransactions(),
            currentMonth
        );

        const percentage = Math.min((monthlySpending / cap) * 100, 100);
        const remaining = Math.max(cap - monthlySpending, 0);

        const capBar = document.getElementById('cap-bar');
        const capMessage = document.getElementById('cap-message');

        capBar.style.width = `${percentage}%`;

        if (percentage >= 100) {
            capBar.className = 'cap-bar danger';
            capMessage.textContent = `Over budget by ${this.formatCurrency(monthlySpending - cap)}`;
            capMessage.setAttribute('aria-live', 'assertive');
        } else if (percentage >= 80) {
            capBar.className = 'cap-bar warning';
            capMessage.textContent = `${this.formatCurrency(remaining)} remaining`;
            capMessage.setAttribute('aria-live', 'polite');
        } else {
            capBar.className = 'cap-bar';
            capMessage.textContent = `${this.formatCurrency(remaining)} remaining`;
            capMessage.setAttribute('aria-live', 'polite');
        }
    }

    refreshRecords() {
        const transactions = this.state.getTransactions();
        this.ui.renderRecords(transactions);
    }

    resetForm() {
        const form = document.getElementById('transaction-form');
        form.reset();

        // Clear errors
        ['description', 'amount', 'category', 'date'].forEach(field => {
            this.clearFieldError(field);
        });

        // Reset form state
        this.editingId = null;
        document.getElementById('edit-id').value = '';
        document.getElementById('submit-btn').textContent = 'Add Transaction';
        document.getElementById('cancel-btn').style.display = 'none';
        document.getElementById('form-heading').textContent = 'Add Transaction';
    }

    editTransaction(id) {
        const transaction = this.state.getTransaction(id);
        if (!transaction) return;

        // Populate form
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('date').value = transaction.date;

        // Update form state
        this.editingId = id;
        document.getElementById('edit-id').value = id;
        document.getElementById('submit-btn').textContent = 'Update Transaction';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        document.getElementById('form-heading').textContent = 'Edit Transaction';

        // Show form section
        this.showSection('add-edit');

        // Focus first field
        document.getElementById('description').focus();
    }

    cancelEdit() {
        this.resetForm();
        this.showSection('records');
    }

    async deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            this.state.deleteTransaction(id);
            this.storage.saveTransactions(this.state.getTransactions());
            this.updateDashboard();
            this.refreshRecords();
            this.announceStatus('Transaction deleted successfully');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showError('Failed to delete transaction. Please try again.');
        }
    }

    exportData() {
        try {
            const data = {
                transactions: this.state.getTransactions(),
                settings: this.state.getSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.announceStatus('Data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data. Please try again.');
        }
    }

    async importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) {
            this.showError('Please select a file to import');
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!this.validators.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            // Import data
            if (data.transactions) {
                this.state.setTransactions(data.transactions);
                this.storage.saveTransactions(data.transactions);
            }

            if (data.settings) {
                this.state.setSettings({ ...this.state.getSettings(), ...data.settings });
                this.storage.saveSettings(this.state.getSettings());
            }

            // Refresh UI
            this.updateDashboard();
            this.refreshRecords();
            this.ui.updateSettingsUI(this.state.getSettings());

            // Clear file input
            fileInput.value = '';

            this.announceStatus('Data imported successfully');

        } catch (error) {
            console.error('Import error:', error);
            this.showError('Failed to import data. Please check the file format.');
        }
    }

    clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }

        try {
            this.state.clearTransactions();
            this.storage.clearTransactions();
            this.updateDashboard();
            this.refreshRecords();
            this.announceStatus('All data cleared successfully');
        } catch (error) {
            console.error('Clear data error:', error);
            this.showError('Failed to clear data. Please try again.');
        }
    }

    saveCurrencySettings() {
        const settings = {
            ...this.state.getSettings(),
            baseCurrency: document.getElementById('base-currency').value,
            exchangeRates: {
                EUR: parseFloat(document.getElementById('eur-rate').value),
                GBP: parseFloat(document.getElementById('gbp-rate').value)
            }
        };

        this.state.setSettings(settings);
        this.storage.saveSettings(settings);
        this.announceStatus('Currency settings saved successfully');
    }

    testRegexPattern() {
        const pattern = document.getElementById('test-pattern').value;
        const text = document.getElementById('test-text').value;
        const resultArea = document.getElementById('regex-result');

        try {
            const regex = new RegExp(pattern, 'gi');
            const matches = [...text.matchAll(regex)];

            let result = `Pattern: ${pattern}\n`;
            result += `Text: ${text}\n\n`;

            if (matches.length > 0) {
                result += `Found ${matches.length} match(es):\n`;
                matches.forEach((match, index) => {
                    result += `${index + 1}. "${match[0]}" at position ${match.index}\n`;
                });
            } else {
                result += 'No matches found.';
            }

            resultArea.textContent = result;
            resultArea.style.color = 'var(--success-color)';

        } catch (error) {
            resultArea.textContent = `Error: ${error.message}`;
            resultArea.style.color = 'var(--danger-color)';
        }
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    announceStatus(message) {
        const announcer = document.getElementById('status-announcer');
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }

    announceError(message) {
        const announcer = document.getElementById('alert-announcer');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 3000);
        }
    }

    showError(message) {
        this.announceError(message);
        console.error(message);
        // Could also show visual error notification here
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinanceTrackerApp();
});

// Export for potential use in other modules
export { FinanceTrackerApp };