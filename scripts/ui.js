/**
 * UI Manager - DOM manipulation and rendering
 */

export class UIManager {
    constructor() {
        this.currentView = 'cards'; // 'cards' or 'table'
        this.isEditing = false;
        this.editingId = null;
    }

    init() {
        this.setupResponsiveHandlers();
        this.setupAccessibilityFeatures();
        this.initializeFormDefaults();
    }

    setupResponsiveHandlers() {
        // Switch between table and card views based on screen size
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        this.handleViewportChange(mediaQuery);
        mediaQuery.addListener(this.handleViewportChange.bind(this));

        // Handle window resize for charts
        window.addEventListener('resize', this.debounce(() => {
            this.refreshCharts();
        }, 250));
    }

    handleViewportChange(mediaQuery) {
        const tableView = document.querySelector('.table-view');
        const cardsView = document.querySelector('.cards-view');

        if (mediaQuery.matches) {
            // Desktop/tablet - show table
            if (tableView) tableView.style.display = 'block';
            if (cardsView) cardsView.style.display = 'none';
            this.currentView = 'table';
        } else {
            // Mobile - show cards
            if (tableView) tableView.style.display = 'none';
            if (cardsView) cardsView.style.display = 'block';
            this.currentView = 'cards';
        }
    }

    setupAccessibilityFeatures() {
        // Focus management
        this.setupFocusTraps();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // ARIA live region updates
        this.setupLiveRegions();
    }

    setupFocusTraps() {
        // Add focus trapping for modal-like interfaces
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('records');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('add-edit');
                        break;
                }
            }
        });
    }

    setupLiveRegions() {
        // Ensure live regions exist
        if (!document.getElementById('status-announcer')) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'status-announcer';
            statusDiv.className = 'sr-only';
            statusDiv.setAttribute('role', 'status');
            statusDiv.setAttribute('aria-live', 'polite');
            document.body.appendChild(statusDiv);
        }

        if (!document.getElementById('alert-announcer')) {
            const alertDiv = document.createElement('div');
            alertDiv.id = 'alert-announcer';
            alertDiv.className = 'sr-only';
            alertDiv.setAttribute('role', 'alert');
            alertDiv.setAttribute('aria-live', 'assertive');
            document.body.appendChild(alertDiv);
        }
    }

    initializeFormDefaults() {
        // Set default date to today
        const dateInput = document.getElementById('date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    renderRecords(transactions, highlightMatches = null) {
        if (this.currentView === 'table') {
            this.renderTableView(transactions, highlightMatches);
        } else {
            this.renderCardsView(transactions, highlightMatches);
        }

        // Show/hide empty state
        const noRecords = document.getElementById('no-records');
        if (noRecords) {
            noRecords.style.display = transactions.length === 0 ? 'block' : 'none';
        }
    }

    renderTableView(transactions, highlightMatches) {
        const tbody = document.getElementById('records-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = this.createTableRow(transaction, highlightMatches);
            tbody.appendChild(row);
        });
    }

    createTableRow(transaction, highlightMatches) {
        const row = document.createElement('tr');
        row.setAttribute('data-transaction-id', transaction.id);

        // Apply highlighting if search matches exist
        const description = highlightMatches ? 
            this.highlightText(transaction.description, highlightMatches) : 
            this.escapeHtml(transaction.description);

        row.innerHTML = `
            <td>${this.formatDate(transaction.date)}</td>
            <td>${description}</td>
            <td>${this.formatCurrency(transaction.amount)}</td>
            <td>
                <span class="category-badge">${this.escapeHtml(transaction.category)}</span>
            </td>
            <td>
                <div class="record-actions">
                    <button class="edit-btn" onclick="app.editTransaction('${transaction.id}')" 
                            aria-label="Edit transaction: ${this.escapeHtml(transaction.description)}">
                        ✏️ Edit
                    </button>
                    <button class="delete-btn" onclick="app.deleteTransaction('${transaction.id}')"
                            aria-label="Delete transaction: ${this.escapeHtml(transaction.description)}">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    renderCardsView(transactions, highlightMatches) {
        const container = document.getElementById('records-cards');
        if (!container) return;

        container.innerHTML = '';

        transactions.forEach(transaction => {
            const card = this.createTransactionCard(transaction, highlightMatches);
            container.appendChild(card);
        });
    }

    createTransactionCard(transaction, highlightMatches) {
        const card = document.createElement('div');
        card.className = 'record-card';
        card.setAttribute('data-transaction-id', transaction.id);

        const description = highlightMatches ? 
            this.highlightText(transaction.description, highlightMatches) : 
            this.escapeHtml(transaction.description);

        card.innerHTML = `
            <div class="record-header">
                <span class="record-amount">${this.formatCurrency(transaction.amount)}</span>
                <span class="record-category">${this.escapeHtml(transaction.category)}</span>
            </div>
            <div class="record-description">${description}</div>
            <div class="record-date">${this.formatDate(transaction.date)}</div>
            <div class="record-actions">
                <button class="edit-btn" onclick="app.editTransaction('${transaction.id}')"
                        aria-label="Edit transaction: ${this.escapeHtml(transaction.description)}">
                    ✏️ Edit
                </button>
                <button class="delete-btn" onclick="app.deleteTransaction('${transaction.id}')"
                        aria-label="Delete transaction: ${this.escapeHtml(transaction.description)}">
                    🗑️ Delete
                </button>
            </div>
        `;

        return card;
    }

    highlightText(text, regex) {
        if (!regex) return this.escapeHtml(text);

        try {
            return this.escapeHtml(text).replace(regex, (match) => {
                return `<mark>${match}</mark>`;
            });
        } catch (error) {
            console.error('Error highlighting text:', error);
            return this.escapeHtml(text);
        }
    }

    updateStatCards(stats) {
        const elements = {
            'total-records': stats.totalRecords || 0,
            'total-amount': this.formatCurrency(stats.totalAmount || 0),
            'top-category': stats.topCategory || 'None',
            'week-trend': this.formatCurrency(stats.weekTrend || 0)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateTrendChart(dailyTrends) {
        const container = document.getElementById('trend-chart');
        if (!container || !Array.isArray(dailyTrends)) return;

        const maxAmount = Math.max(...dailyTrends.map(d => d.amount), 1);

        container.innerHTML = dailyTrends.map((day, index) => {
            const height = (day.amount / maxAmount) * 100;
            const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });

            return `
                <div class="chart-bar" 
                     style="height: ${height}%" 
                     data-value="$${day.amount.toFixed(2)}"
                     title="${dayName}: $${day.amount.toFixed(2)}"
                     tabindex="0"
                     role="img"
                     aria-label="$${day.amount.toFixed(2)} spent on ${dayName}">
                </div>
            `;
        }).join('');
    }

    updateSpendingCapDisplay(currentSpending, cap) {
        const capBar = document.getElementById('cap-bar');
        const capMessage = document.getElementById('cap-message');
        const capStatus = document.getElementById('cap-status');

        if (!cap || cap <= 0) {
            if (capMessage) capMessage.textContent = 'No spending cap set';
            if (capBar) capBar.style.width = '0%';
            if (capStatus) capStatus.setAttribute('aria-live', 'off');
            return;
        }

        const percentage = Math.min((currentSpending / cap) * 100, 100);
        const remaining = Math.max(cap - currentSpending, 0);
        const overage = Math.max(currentSpending - cap, 0);

        if (capBar) {
            capBar.style.width = `${percentage}%`;
            capBar.className = 'cap-bar';

            if (percentage >= 100) {
                capBar.classList.add('danger');
            } else if (percentage >= 80) {
                capBar.classList.add('warning');
            }
        }

        if (capMessage && capStatus) {
            if (overage > 0) {
                capMessage.textContent = `Over budget by ${this.formatCurrency(overage)}`;
                capStatus.setAttribute('aria-live', 'assertive');
            } else {
                capMessage.textContent = `${this.formatCurrency(remaining)} remaining`;
                capStatus.setAttribute('aria-live', 'polite');
            }
        }
    }

    updateSettingsUI(settings) {
        // Update currency settings
        const baseCurrency = document.getElementById('base-currency');
        if (baseCurrency) baseCurrency.value = settings.baseCurrency || 'USD';

        const eurRate = document.getElementById('eur-rate');
        if (eurRate) eurRate.value = settings.exchangeRates?.EUR || 0.85;

        const gbpRate = document.getElementById('gbp-rate');
        if (gbpRate) gbpRate.value = settings.exchangeRates?.GBP || 0.75;

        // Update spending cap
        const spendingCap = document.getElementById('spending-cap');
        if (spendingCap && settings.spendingCap) {
            spendingCap.value = settings.spendingCap;
        }

        // Update categories
        this.updateCategoriesList(settings.categories || []);
    }

    updateCategoriesList(categories) {
        const container = document.getElementById('categories-list');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="category-item">
                <span>${this.escapeHtml(category)}</span>
                <button class="remove-category-btn" 
                        onclick="app.removeCategory('${category}')"
                        aria-label="Remove category: ${category}">
                    ❌
                </button>
            </div>
        `).join('');

        // Update category select options
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            const currentValue = categorySelect.value;
            categorySelect.innerHTML = '<option value="">Select category...</option>' +
                categories.map(cat => 
                    `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`
                ).join('');

            // Restore selection if still valid
            if (categories.includes(currentValue)) {
                categorySelect.value = currentValue;
            }
        }
    }

    showFormValidationErrors(errors) {
        // Clear all previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
            el.classList.remove('error');
        });

        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}-error`);

            if (input) input.classList.add('error');
            if (errorElement) errorElement.textContent = message;
        });

        // Focus first error field
        const firstErrorField = Object.keys(errors)[0];
        const firstErrorInput = document.getElementById(firstErrorField);
        if (firstErrorInput) {
            firstErrorInput.focus();
        }
    }

    clearFormValidationErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
            el.classList.remove('error');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Allow manual dismissal
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    navigateToSection(sectionName) {
        const link = document.querySelector(`[data-section="${sectionName}"]`);
        if (link) {
            link.click();
        }
    }

    refreshCharts() {
        // Trigger chart re-rendering on resize
        const event = new CustomEvent('chartsRefresh');
        document.dispatchEvent(event);
    }

    // Utility methods
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    handleTabNavigation(e) {
        // Basic tab navigation handling
        const focusableElements = document.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);

        if (e.shiftKey) {
            // Shift+Tab - go backward
            if (currentIndex <= 0) {
                e.preventDefault();
                focusableArray[focusableArray.length - 1].focus();
            }
        } else {
            // Tab - go forward
            if (currentIndex >= focusableArray.length - 1) {
                e.preventDefault();
                focusableArray[0].focus();
            }
        }
    }
}