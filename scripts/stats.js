/**
 * Stats Manager - Calculate statistics and analytics
 */

export class StatsManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    calculateStats(transactions) {
        const cacheKey = this.generateCacheKey(transactions);
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        const stats = this.computeStats(transactions);

        // Cache results
        this.cache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });

        // Clean old cache entries
        this.cleanCache();

        return stats;
    }

    computeStats(transactions) {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return this.getEmptyStats();
        }

        const totalRecords = transactions.length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const averageAmount = totalAmount / totalRecords;

        // Category analysis
        const categoryTotals = this.getCategoryTotals(transactions);
        const topCategory = this.getTopCategory(categoryTotals);

        // Time-based analysis
        const dailyTrends = this.getDailyTrends(transactions, 7);
        const weekTrend = dailyTrends.reduce((sum, day) => sum + day.amount, 0);
        const monthlyTotals = this.getMonthlyTotals(transactions);

        // Amount analysis
        const amountStats = this.getAmountStatistics(transactions);

        return {
            totalRecords,
            totalAmount,
            averageAmount,
            topCategory,
            categoryTotals,
            dailyTrends,
            weekTrend,
            monthlyTotals,
            ...amountStats
        };
    }

    getEmptyStats() {
        return {
            totalRecords: 0,
            totalAmount: 0,
            averageAmount: 0,
            topCategory: null,
            categoryTotals: {},
            dailyTrends: this.getEmptyDailyTrends(7),
            weekTrend: 0,
            monthlyTotals: {},
            minAmount: 0,
            maxAmount: 0,
            medianAmount: 0
        };
    }

    getCategoryTotals(transactions) {
        const totals = {};
        const counts = {};

        transactions.forEach(transaction => {
            const category = transaction.category || 'Uncategorized';
            totals[category] = (totals[category] || 0) + transaction.amount;
            counts[category] = (counts[category] || 0) + 1;
        });

        // Return object with totals and counts
        return Object.keys(totals).map(category => ({
            category,
            total: totals[category],
            count: counts[category],
            average: totals[category] / counts[category]
        })).sort((a, b) => b.total - a.total);
    }

    getTopCategory(categoryTotals) {
        if (!categoryTotals || categoryTotals.length === 0) {
            return null;
        }
        return categoryTotals[0].category;
    }

    getDailyTrends(transactions, days = 7) {
        const trends = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            const dayTotal = transactions
                .filter(t => t.date === dateString)
                .reduce((sum, t) => sum + t.amount, 0);

            trends.push({
                date: dateString,
                amount: dayTotal,
                count: transactions.filter(t => t.date === dateString).length
            });
        }

        return trends;
    }

    getEmptyDailyTrends(days) {
        const trends = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            trends.push({
                date: date.toISOString().split('T')[0],
                amount: 0,
                count: 0
            });
        }

        return trends;
    }

    getMonthlyTotals(transactions) {
        const totals = {};

        transactions.forEach(transaction => {
            const monthKey = transaction.date.slice(0, 7); // YYYY-MM
            totals[monthKey] = (totals[monthKey] || 0) + transaction.amount;
        });

        return totals;
    }

    getMonthlySpending(transactions, monthKey) {
        return transactions
            .filter(t => t.date.startsWith(monthKey))
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getAmountStatistics(transactions) {
        if (transactions.length === 0) {
            return { minAmount: 0, maxAmount: 0, medianAmount: 0 };
        }

        const amounts = transactions.map(t => t.amount).sort((a, b) => a - b);
        const minAmount = amounts[0];
        const maxAmount = amounts[amounts.length - 1];

        // Calculate median
        const middleIndex = Math.floor(amounts.length / 2);
        const medianAmount = amounts.length % 2 === 0
            ? (amounts[middleIndex - 1] + amounts[middleIndex]) / 2
            : amounts[middleIndex];

        return { minAmount, maxAmount, medianAmount };
    }

    // Advanced analytics
    getSpendingPatterns(transactions) {
        const patterns = {
            byDayOfWeek: this.getSpendingByDayOfWeek(transactions),
            byTimeOfMonth: this.getSpendingByTimeOfMonth(transactions),
            categoryTrends: this.getCategoryTrends(transactions),
            averageTransactionSize: this.getAverageTransactionSize(transactions)
        };

        return patterns;
    }

    getSpendingByDayOfWeek(transactions) {
        const dayTotals = Array(7).fill(0);
        const dayCounts = Array(7).fill(0);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const dayOfWeek = date.getDay();
            dayTotals[dayOfWeek] += transaction.amount;
            dayCounts[dayOfWeek]++;
        });

        return dayNames.map((name, index) => ({
            day: name,
            total: dayTotals[index],
            count: dayCounts[index],
            average: dayCounts[index] > 0 ? dayTotals[index] / dayCounts[index] : 0
        }));
    }

    getSpendingByTimeOfMonth(transactions) {
        const periods = {
            'Early Month (1-10)': { total: 0, count: 0 },
            'Mid Month (11-20)': { total: 0, count: 0 },
            'Late Month (21-31)': { total: 0, count: 0 }
        };

        transactions.forEach(transaction => {
            const day = parseInt(transaction.date.split('-')[2]);
            let period;

            if (day <= 10) period = 'Early Month (1-10)';
            else if (day <= 20) period = 'Mid Month (11-20)';
            else period = 'Late Month (21-31)';

            periods[period].total += transaction.amount;
            periods[period].count++;
        });

        return Object.entries(periods).map(([period, data]) => ({
            period,
            total: data.total,
            count: data.count,
            average: data.count > 0 ? data.total / data.count : 0
        }));
    }

    getCategoryTrends(transactions, months = 6) {
        const trends = {};
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        transactions
            .filter(t => new Date(t.date) >= cutoffDate)
            .forEach(transaction => {
                const monthKey = transaction.date.slice(0, 7);
                const category = transaction.category;

                if (!trends[category]) {
                    trends[category] = {};
                }

                trends[category][monthKey] = (trends[category][monthKey] || 0) + transaction.amount;
            });

        return trends;
    }

    getAverageTransactionSize(transactions) {
        if (transactions.length === 0) return 0;

        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        return totalAmount / transactions.length;
    }

    // Budget analysis
    analyzeBudgetPerformance(transactions, budgets) {
        const analysis = {};
        const currentMonth = new Date().toISOString().slice(0, 7);

        Object.entries(budgets).forEach(([category, budgetAmount]) => {
            const monthlySpending = transactions
                .filter(t => t.date.startsWith(currentMonth) && t.category === category)
                .reduce((sum, t) => sum + t.amount, 0);

            const remaining = budgetAmount - monthlySpending;
            const percentageUsed = (monthlySpending / budgetAmount) * 100;

            analysis[category] = {
                budget: budgetAmount,
                spent: monthlySpending,
                remaining: remaining,
                percentageUsed: Math.min(percentageUsed, 100),
                status: this.getBudgetStatus(percentageUsed)
            };
        });

        return analysis;
    }

    getBudgetStatus(percentageUsed) {
        if (percentageUsed >= 100) return 'over';
        if (percentageUsed >= 90) return 'critical';
        if (percentageUsed >= 75) return 'warning';
        return 'good';
    }

    // Forecasting
    forecastSpending(transactions, days = 30) {
        const recentTransactions = transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - 30);
                return transactionDate >= cutoffDate;
            });

        if (recentTransactions.length === 0) {
            return { dailyAverage: 0, forecast: 0, confidence: 0 };
        }

        const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
        const dailyAverage = totalAmount / 30; // Average over last 30 days
        const forecast = dailyAverage * days;

        // Simple confidence calculation based on transaction consistency
        const dailyAmounts = this.getDailyTrends(recentTransactions, 30)
            .map(day => day.amount);
        const variance = this.calculateVariance(dailyAmounts);
        const confidence = Math.max(0, Math.min(100, 100 - (variance / dailyAverage) * 10));

        return { dailyAverage, forecast, confidence };
    }

    calculateVariance(numbers) {
        if (numbers.length === 0) return 0;

        const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
        const squaredDifferences = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDifferences.reduce((sum, sq) => sum + sq, 0) / numbers.length;
    }

    // Insights generation
    generateInsights(transactions) {
        const insights = [];
        const stats = this.calculateStats(transactions);

        // Top spending category insight
        if (stats.topCategory) {
            const categoryTotal = stats.categoryTotals.find(c => c.category === stats.topCategory);
            const percentage = ((categoryTotal.total / stats.totalAmount) * 100).toFixed(1);
            insights.push({
                type: 'category',
                message: `Your top spending category is "${stats.topCategory}" with ${percentage}% of total expenses`,
                value: categoryTotal.total,
                impact: 'neutral'
            });
        }

        // Spending trend insight
        const recentTrend = this.getSpendingTrend(transactions, 14, 7);
        if (recentTrend.change !== 0) {
            const direction = recentTrend.change > 0 ? 'increased' : 'decreased';
            const percentage = Math.abs(recentTrend.changePercent).toFixed(1);
            insights.push({
                type: 'trend',
                message: `Your spending has ${direction} by ${percentage}% compared to last week`,
                value: recentTrend.change,
                impact: recentTrend.change > 0 ? 'negative' : 'positive'
            });
        }

        // Large transaction insight
        const largeTransactions = transactions.filter(t => t.amount > stats.averageAmount * 2);
        if (largeTransactions.length > 0) {
            insights.push({
                type: 'unusual',
                message: `You have ${largeTransactions.length} transactions that are significantly above average`,
                value: largeTransactions.length,
                impact: 'attention'
            });
        }

        return insights;
    }

    getSpendingTrend(transactions, currentPeriodDays, previousPeriodDays) {
        const today = new Date();

        // Current period
        const currentStart = new Date(today);
        currentStart.setDate(today.getDate() - currentPeriodDays);
        const currentSpending = transactions
            .filter(t => new Date(t.date) >= currentStart)
            .reduce((sum, t) => sum + t.amount, 0);

        // Previous period
        const previousStart = new Date(today);
        previousStart.setDate(today.getDate() - (currentPeriodDays + previousPeriodDays));
        const previousEnd = new Date(today);
        previousEnd.setDate(today.getDate() - currentPeriodDays);

        const previousSpending = transactions
            .filter(t => {
                const date = new Date(t.date);
                return date >= previousStart && date < previousEnd;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const change = currentSpending - previousSpending;
        const changePercent = previousSpending > 0 ? (change / previousSpending) * 100 : 0;

        return { currentSpending, previousSpending, change, changePercent };
    }

    // Cache management
    generateCacheKey(transactions) {
        const transactionIds = transactions.map(t => t.id).sort().join(',');
        const hash = this.simpleHash(transactionIds);
        return `stats_${hash}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }
}