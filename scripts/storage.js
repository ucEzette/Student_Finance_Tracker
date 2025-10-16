/**
 * Storage Manager - Handles localStorage operations and data persistence
 */

export class StorageManager {
    constructor() {
        this.TRANSACTIONS_KEY = 'finance_tracker_transactions';
        this.SETTINGS_KEY = 'finance_tracker_settings';
        this.VERSION_KEY = 'finance_tracker_version';
        this.CURRENT_VERSION = '1.0';
        
        this.initializeStorage();
    }
    
    initializeStorage() {
        // Check if this is first run or version upgrade
        const storedVersion = localStorage.getItem(this.VERSION_KEY);
        
        if (!storedVersion || storedVersion !== this.CURRENT_VERSION) {
            this.upgradeStorage(storedVersion);
            localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
        }
    }
    
    upgradeStorage(fromVersion) {
        // Handle version upgrades and migrations
        console.log(`Upgrading storage from ${fromVersion || 'initial'} to ${this.CURRENT_VERSION}`);
        
        // For now, just ensure default settings exist
        if (!this.loadSettings()) {
            this.saveSettings(this.getDefaultSettings());
        }
    }
    
    getDefaultSettings() {
        return {
            baseCurrency: 'USD',
            exchangeRates: {
                EUR: 0.85,
                GBP: 0.75
            },
            categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
            spendingCap: null,
            theme: 'light'
        };
    }
    
    loadTransactions() {
        try {
            const data = localStorage.getItem(this.TRANSACTIONS_KEY);
            if (!data) return [];
            
            const transactions = JSON.parse(data);
            
            // Validate structure
            if (!Array.isArray(transactions)) {
                console.warn('Invalid transactions data format, returning empty array');
                return [];
            }
            
            // Validate each transaction
            return transactions.filter(transaction => this.validateTransaction(transaction));
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            return [];
        }
    }
    
    saveTransactions(transactions) {
        try {
            if (!Array.isArray(transactions)) {
                throw new Error('Transactions must be an array');
            }
            
            // Validate all transactions before saving
            const validTransactions = transactions.filter(transaction => {
                if (!this.validateTransaction(transaction)) {
                    console.warn('Invalid transaction filtered out:', transaction);
                    return false;
                }
                return true;
            });
            
            const dataString = JSON.stringify(validTransactions, null, 2);
            
            // Check localStorage space
            this.checkStorageSpace(dataString);
            
            localStorage.setItem(this.TRANSACTIONS_KEY, dataString);
            
            console.log(`Saved ${validTransactions.length} transactions to localStorage`);
            return true;
            
        } catch (error) {
            console.error('Error saving transactions:', error);
            
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please export and clear old data.');
            }
            
            throw error;
        }
    }
    
    validateTransaction(transaction) {
        const requiredFields = ['id', 'description', 'amount', 'category', 'date', 'createdAt', 'updatedAt'];
        
        // Check required fields
        for (const field of requiredFields) {
            if (!(field in transaction)) {
                console.warn(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate data types
        if (typeof transaction.id !== 'string' || transaction.id.trim() === '') {
            return false;
        }
        
        if (typeof transaction.description !== 'string' || transaction.description.trim() === '') {
            return false;
        }
        
        if (typeof transaction.amount !== 'number' || isNaN(transaction.amount) || transaction.amount < 0) {
            return false;
        }
        
        if (typeof transaction.category !== 'string' || transaction.category.trim() === '') {
            return false;
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!dateRegex.test(transaction.date)) {
            return false;
        }
        
        // Validate timestamps
        try {
            new Date(transaction.createdAt);
            new Date(transaction.updatedAt);
        } catch {
            return false;
        }
        
        return true;
    }
    
    loadSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            if (!data) return this.getDefaultSettings();
            
            const settings = JSON.parse(data);
            
            // Merge with defaults to ensure all required settings exist
            return { ...this.getDefaultSettings(), ...settings };
            
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    saveSettings(settings) {
        try {
            if (typeof settings !== 'object' || settings === null) {
                throw new Error('Settings must be an object');
            }
            
            // Validate critical settings
            const validatedSettings = this.validateSettings(settings);
            
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(validatedSettings, null, 2));
            
            console.log('Settings saved successfully');
            return true;
            
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
    
    validateSettings(settings) {
        const defaults = this.getDefaultSettings();
        const validated = { ...defaults };
        
        // Validate base currency
        if (settings.baseCurrency && typeof settings.baseCurrency === 'string') {
            validated.baseCurrency = settings.baseCurrency;
        }
        
        // Validate exchange rates
        if (settings.exchangeRates && typeof settings.exchangeRates === 'object') {
            validated.exchangeRates = {};
            for (const [currency, rate] of Object.entries(settings.exchangeRates)) {
                if (typeof rate === 'number' && rate > 0 && isFinite(rate)) {
                    validated.exchangeRates[currency] = rate;
                }
            }
        }
        
        // Validate categories
        if (Array.isArray(settings.categories)) {
            validated.categories = settings.categories.filter(cat => 
                typeof cat === 'string' && cat.trim() !== ''
            );
        }
        
        // Validate spending cap
        if (settings.spendingCap !== null && typeof settings.spendingCap === 'number' && settings.spendingCap > 0) {
            validated.spendingCap = settings.spendingCap;
        }
        
        // Validate theme
        if (settings.theme && ['light', 'dark'].includes(settings.theme)) {
            validated.theme = settings.theme;
        }
        
        return validated;
    }
    
    // CSV Export functionality with proper escaping
    exportToCSV(transactions) {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            throw new Error('No transactions to export');
        }
        
        // CSV headers
        const headers = ['ID', 'Date', 'Description', 'Amount', 'Category', 'Created At', 'Updated At'];
        
        // Convert transactions to CSV rows
        const rows = transactions.map(transaction => [
            this.escapeCSVField(transaction.id),
            this.escapeCSVField(transaction.date),
            this.escapeCSVField(transaction.description),
            this.escapeCSVField(transaction.amount.toString()),
            this.escapeCSVField(transaction.category),
            this.escapeCSVField(transaction.createdAt),
            this.escapeCSVField(transaction.updatedAt)
        ]);
        
        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\r\n');
        
        // Add BOM for UTF-8 compatibility with Excel
        return '\uFEFF' + csvContent;
    }
    
    // Properly escape CSV fields according to RFC 4180
    escapeCSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        
        const stringField = String(field);
        
        // Check if field contains comma, quote, or newline
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
            // Escape quotes by doubling them and wrap in quotes
            return '"' + stringField.replace(/"/g, '""') + '"';
        }
        
        return stringField;
    }
    
    // Import CSV functionality
    importFromCSV(csvText) {
        try {
            const lines = this.parseCSV(csvText);
            
            if (lines.length < 2) {
                throw new Error('CSV file must contain headers and at least one data row');
            }
            
            const headers = lines[0];
            const expectedHeaders = ['ID', 'Date', 'Description', 'Amount', 'Category', 'Created At', 'Updated At'];
            
            // Validate headers (case insensitive)
            const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
            const expectedNormalized = expectedHeaders.map(h => h.toLowerCase());
            
            if (!this.arraysEqual(normalizedHeaders, expectedNormalized)) {
                console.warn('Header mismatch, attempting flexible import');
            }
            
            // Convert rows to transactions
            const transactions = [];
            
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i];
                
                if (row.length < 5) {
                    console.warn(`Row ${i + 1} has insufficient columns, skipping`);
                    continue;
                }
                
                try {
                    const transaction = {
                        id: row[0] || this.generateId(),
                        date: row[1],
                        description: row[2],
                        amount: parseFloat(row[3]) || 0,
                        category: row[4],
                        createdAt: row[5] || new Date().toISOString(),
                        updatedAt: row[6] || new Date().toISOString()
                    };
                    
                    // Validate transaction
                    if (this.validateTransaction(transaction)) {
                        transactions.push(transaction);
                    } else {
                        console.warn(`Row ${i + 1} failed validation, skipping`);
                    }
                    
                } catch (error) {
                    console.warn(`Error processing row ${i + 1}:`, error.message);
                }
            }
            
            return transactions;
            
        } catch (error) {
            console.error('CSV import error:', error);
            throw new Error('Failed to parse CSV file: ' + error.message);
        }
    }
    
    // Parse CSV with proper handling of quoted fields
    parseCSV(csvText) {
        const lines = [];
        const rows = csvText.split(/\r?\n/);
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row === '') continue;
            
            const fields = [];
            let currentField = '';
            let inQuotes = false;
            let j = 0;
            
            while (j < row.length) {
                const char = row[j];
                
                if (char === '"' && !inQuotes) {
                    inQuotes = true;
                } else if (char === '"' && inQuotes) {
                    if (j + 1 < row.length && row[j + 1] === '"') {
                        // Escaped quote
                        currentField += '"';
                        j++; // Skip next quote
                    } else {
                        inQuotes = false;
                    }
                } else if (char === ',' && !inQuotes) {
                    fields.push(currentField);
                    currentField = '';
                } else {
                    currentField += char;
                }
                
                j++;
            }
            
            // Add last field
            fields.push(currentField);
            lines.push(fields);
        }
        
        return lines;
    }
    
    generateId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    
    clearTransactions() {
        try {
            localStorage.removeItem(this.TRANSACTIONS_KEY);
            console.log('Transactions cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing transactions:', error);
            throw error;
        }
    }
    
    clearSettings() {
        try {
            localStorage.removeItem(this.SETTINGS_KEY);
            console.log('Settings cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing settings:', error);
            throw error;
        }
    }
    
    clearAllData() {
        try {
            this.clearTransactions();
            this.clearSettings();
            localStorage.removeItem(this.VERSION_KEY);
            console.log('All data cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            throw error;
        }
    }
    
    exportData() {
        try {
            const transactions = this.loadTransactions();
            const settings = this.loadSettings();
            
            return {
                transactions,
                settings,
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: this.CURRENT_VERSION,
                    transactionCount: transactions.length
                }
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }
    
    importData(data) {
        try {
            // Validate import data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            let importedCount = 0;
            
            // Import transactions
            if (Array.isArray(data.transactions)) {
                const validTransactions = data.transactions.filter(t => this.validateTransaction(t));
                if (validTransactions.length > 0) {
                    this.saveTransactions(validTransactions);
                    importedCount = validTransactions.length;
                }
            }
            
            // Import settings
            if (data.settings && typeof data.settings === 'object') {
                this.saveSettings(data.settings);
            }
            
            console.log(`Import completed: ${importedCount} transactions imported`);
            
            return {
                success: true,
                transactionsImported: importedCount,
                settingsImported: !!data.settings
            };
            
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
    
    checkStorageSpace(dataString) {
        try {
            // Test if we can store the data
            const testKey = 'storage_test_' + Date.now();
            localStorage.setItem(testKey, dataString);
            localStorage.removeItem(testKey);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw error;
            }
            throw new Error('Storage test failed: ' + error.message);
        }
    }
    
    getStorageInfo() {
        try {
            const transactions = localStorage.getItem(this.TRANSACTIONS_KEY) || '[]';
            const settings = localStorage.getItem(this.SETTINGS_KEY) || '{}';
            
            const transactionsSize = new Blob([transactions]).size;
            const settingsSize = new Blob([settings]).size;
            const totalSize = transactionsSize + settingsSize;
            
            return {
                transactionsSize,
                settingsSize,
                totalSize,
                transactionCount: JSON.parse(transactions).length
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                transactionsSize: 0,
                settingsSize: 0,
                totalSize: 0,
                transactionCount: 0
            };
        }
    }
    
    // Backup functionality
    createBackup() {
        try {
            const backup = {
                ...this.exportData(),
                backupDate: new Date().toISOString()
            };
            
            const backupKey = `${this.TRANSACTIONS_KEY}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // Keep only last 3 backups
            this.cleanupOldBackups();
            
            return backupKey;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }
    
    cleanupOldBackups() {
        try {
            const backupKeys = [];
            const prefix = `${this.TRANSACTIONS_KEY}_backup_`;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    backupKeys.push(key);
                }
            }
            
            // Sort by timestamp (newest first)
            backupKeys.sort((a, b) => {
                const timestampA = parseInt(a.split('_').pop());
                const timestampB = parseInt(b.split('_').pop());
                return timestampB - timestampA;
            });
            
            // Remove backups beyond the first 3
            for (let i = 3; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        } catch (error) {
            console.error('Error cleaning up backups:', error);
        }
    }
}
