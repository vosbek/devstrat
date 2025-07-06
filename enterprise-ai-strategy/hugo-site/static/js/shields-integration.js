/**
 * Enterprise AI Strategy - Shields.io Integration
 * Dynamic badge generation and real-time status updates
 */

class ShieldsIntegration {
    constructor() {
        this.baseUrl = 'https://img.shields.io/badge/';
        this.apiEndpoint = 'http://localhost:8000'; // Enterprise API endpoint
        this.refreshInterval = 300000; // 5 minutes
        this.init();
    }

    /**
     * Initialize shields integration
     */
    init() {
        this.updateDynamicBadges();
        this.setupAutoRefresh();
        this.bindEventListeners();
    }

    /**
     * Generate shield URL with parameters
     */
    generateShield(label, message, color, options = {}) {
        const {
            style = 'flat-square',
            logo = null,
            logoColor = null,
            labelColor = null,
            link = null
        } = options;

        // Encode label and message for URL safety
        const encodedLabel = encodeURIComponent(label);
        const encodedMessage = encodeURIComponent(message);
        const encodedColor = encodeURIComponent(color);

        // Build URL
        let url = `${this.baseUrl}${encodedLabel}-${encodedMessage}-${encodedColor}?style=${style}`;

        if (logo) url += `&logo=${logo}`;
        if (logoColor) url += `&logoColor=${logoColor}`;
        if (labelColor) url += `&labelColor=${labelColor}`;

        return url;
    }

    /**
     * Create badge element
     */
    createBadge(label, message, color, options = {}) {
        const img = document.createElement('img');
        img.src = this.generateShield(label, message, color, options);
        img.alt = `${label}: ${message}`;
        img.className = 'badge-shield';
        
        if (options.link) {
            const link = document.createElement('a');
            link.href = options.link;
            link.appendChild(img);
            return link;
        }
        
        return img;
    }

    /**
     * Update dynamic badges with real-time data
     */
    async updateDynamicBadges() {
        try {
            const data = await this.fetchSystemMetrics();
            this.updateExecutiveBadges(data);
            this.updateToolRegistryBadges(data);
            this.updateROIBadges(data);
            this.updateRiskBadges(data);
        } catch (error) {
            console.warn('Failed to update dynamic badges:', error);
            this.showOfflineMode();
        }
    }

    /**
     * Fetch system metrics from API
     */
    async fetchSystemMetrics() {
        const response = await fetch(`${this.apiEndpoint}/stats/dashboard`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem('enterprise_ai_token') || '';
    }

    /**
     * Update executive dashboard badges
     */
    updateExecutiveBadges(data) {
        const badges = {
            'overall-status': {
                label: 'AI Strategy',
                message: this.getOverallStatus(data),
                color: this.getStatusColor(data.success_rate || 0)
            },
            'budget-status': {
                label: 'Budget',
                message: `${Math.round((data.budget_utilized || 87))}% Utilized`,
                color: this.getBudgetColor(data.budget_utilized || 87)
            },
            'risk-level': {
                label: 'Risk Level',
                message: this.getRiskLevel(data.risk_score || 2.1),
                color: this.getRiskColor(data.risk_score || 2.1)
            },
            'portfolio-roi': {
                label: 'Portfolio ROI',
                message: `${data.portfolio_roi || 240}%`,
                color: 'brightgreen'
            }
        };

        this.updateBadgeElements(badges);
    }

    /**
     * Update tool registry badges
     */
    updateToolRegistryBadges(data) {
        const badges = {
            'tools-evaluated': {
                label: 'Total Evaluated',
                message: data.tools_evaluated || '173',
                color: 'blue'
            },
            'tools-approved': {
                label: 'Approved',
                message: data.tools_approved || '42',
                color: 'brightgreen'
            },
            'in-pilot': {
                label: 'In Pilot',
                message: data.tools_pilot || '12',
                color: 'yellow'
            },
            'under-review': {
                label: 'Under Review',
                message: data.tools_review || '28',
                color: 'orange'
            }
        };

        this.updateBadgeElements(badges);
    }

    /**
     * Update ROI analytics badges
     */
    updateROIBadges(data) {
        const badges = {
            'annual-savings': {
                label: 'Annual Savings',
                message: `$${(data.annual_savings || 6.72)}M`,
                color: 'brightgreen'
            },
            'total-investment': {
                label: 'Total Investment',
                message: `$${(data.total_investment || 2.8)}M`,
                color: 'blue'
            },
            'payback-period': {
                label: 'Payback Period',
                message: `${data.payback_months || 14} Months`,
                color: 'blue'
            }
        };

        this.updateBadgeElements(badges);
    }

    /**
     * Update risk monitor badges
     */
    updateRiskBadges(data) {
        const badges = {
            'overall-risk': {
                label: 'Overall Risk',
                message: this.getRiskLevel(data.risk_score || 2.1),
                color: this.getRiskColor(data.risk_score || 2.1)
            },
            'security-incidents': {
                label: 'Incidents (90d)',
                message: data.security_incidents || '0',
                color: data.security_incidents === 0 ? 'brightgreen' : 'red'
            },
            'compliance': {
                label: 'Compliance',
                message: `${data.compliance_score || 98}%`,
                color: this.getComplianceColor(data.compliance_score || 98)
            },
            'high-risk-tools': {
                label: 'High Risk Tools',
                message: data.high_risk_tools || '1',
                color: data.high_risk_tools === 0 ? 'brightgreen' : 'red'
            }
        };

        this.updateBadgeElements(badges);
    }

    /**
     * Update badge elements in DOM
     */
    updateBadgeElements(badges) {
        Object.entries(badges).forEach(([id, config]) => {
            const elements = document.querySelectorAll(`[data-shield-id="${id}"]`);
            elements.forEach(element => {
                if (element.tagName === 'IMG') {
                    element.src = this.generateShield(
                        config.label,
                        config.message,
                        config.color,
                        { style: 'for-the-badge' }
                    );
                    element.alt = `${config.label}: ${config.message}`;
                }
            });
        });
    }

    /**
     * Helper functions for dynamic values
     */
    getOverallStatus(data) {
        const successRate = data.success_rate || 0;
        if (successRate >= 90) return 'Excellent';
        if (successRate >= 80) return 'Good';
        if (successRate >= 70) return 'Fair';
        return 'Needs Attention';
    }

    getStatusColor(successRate) {
        if (successRate >= 90) return 'brightgreen';
        if (successRate >= 80) return 'green';
        if (successRate >= 70) return 'yellow';
        return 'red';
    }

    getBudgetColor(utilized) {
        if (utilized <= 85) return 'green';
        if (utilized <= 95) return 'yellow';
        return 'red';
    }

    getRiskLevel(score) {
        if (score <= 3) return 'Low';
        if (score <= 6) return 'Medium';
        if (score <= 8) return 'High';
        return 'Critical';
    }

    getRiskColor(score) {
        if (score <= 3) return 'brightgreen';
        if (score <= 6) return 'yellow';
        if (score <= 8) return 'orange';
        return 'red';
    }

    getComplianceColor(score) {
        if (score >= 95) return 'brightgreen';
        if (score >= 90) return 'green';
        if (score >= 80) return 'yellow';
        return 'red';
    }

    /**
     * Set up auto-refresh for dynamic badges
     */
    setupAutoRefresh() {
        setInterval(() => {
            this.updateDynamicBadges();
        }, this.refreshInterval);

        // Also refresh on page focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateDynamicBadges();
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEventListeners() {
        // Manual refresh button
        const refreshButtons = document.querySelectorAll('[data-action="refresh-badges"]');
        refreshButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.updateDynamicBadges();
                button.textContent = 'Refreshed!';
                setTimeout(() => {
                    button.textContent = 'Refresh';
                }, 2000);
            });
        });

        // Badge click tracking
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('badge-shield')) {
                this.trackBadgeClick(event.target);
            }
        });
    }

    /**
     * Track badge clicks for analytics
     */
    trackBadgeClick(badgeElement) {
        const badgeId = badgeElement.closest('[data-shield-id]')?.dataset.shieldId;
        if (badgeId) {
            // Send analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'badge_click', {
                    'badge_id': badgeId,
                    'page': window.location.pathname
                });
            }
        }
    }

    /**
     * Show offline mode when API is unavailable
     */
    showOfflineMode() {
        const offlineBadges = document.querySelectorAll('[data-shield-offline]');
        offlineBadges.forEach(badge => {
            badge.src = this.generateShield('Status', 'Offline', 'lightgray');
            badge.alt = 'Status: Offline';
        });
    }

    /**
     * Create predefined badge configurations
     */
    static getBadgeConfigs() {
        return {
            // Status badges
            status: {
                healthy: { color: 'brightgreen', icon: 'heart' },
                warning: { color: 'yellow', icon: 'exclamation-triangle' },
                error: { color: 'red', icon: 'times-circle' },
                offline: { color: 'lightgray', icon: 'power-off' }
            },

            // Progress badges
            progress: {
                complete: { color: 'brightgreen', icon: 'check' },
                inProgress: { color: 'blue', icon: 'clock' },
                pending: { color: 'yellow', icon: 'hourglass' },
                failed: { color: 'red', icon: 'times' }
            },

            // Business metrics
            business: {
                excellent: { color: 'brightgreen', threshold: 90 },
                good: { color: 'green', threshold: 80 },
                fair: { color: 'yellow', threshold: 70 },
                poor: { color: 'red', threshold: 0 }
            },

            // Risk levels
            risk: {
                low: { color: 'brightgreen', max: 3 },
                medium: { color: 'yellow', max: 6 },
                high: { color: 'orange', max: 8 },
                critical: { color: 'red', max: 10 }
            }
        };
    }
}

// Custom shield helper functions
window.ShieldsHelper = {
    /**
     * Create a simple status badge
     */
    status: (label, status, link = null) => {
        const shields = new ShieldsIntegration();
        const colors = {
            'online': 'brightgreen',
            'offline': 'red',
            'maintenance': 'yellow',
            'unknown': 'lightgray'
        };
        
        return shields.createBadge(label, status, colors[status] || 'blue', { link });
    },

    /**
     * Create a metric badge with value and trend
     */
    metric: (label, value, trend = null, link = null) => {
        const shields = new ShieldsIntegration();
        let message = value;
        let color = 'blue';
        
        if (trend) {
            const arrow = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';
            message = `${value} ${arrow}`;
            color = trend > 0 ? 'brightgreen' : trend < 0 ? 'red' : 'blue';
        }
        
        return shields.createBadge(label, message, color, { link });
    },

    /**
     * Create a percentage badge with color coding
     */
    percentage: (label, percent, link = null) => {
        const shields = new ShieldsIntegration();
        let color;
        
        if (percent >= 90) color = 'brightgreen';
        else if (percent >= 80) color = 'green';
        else if (percent >= 70) color = 'yellow';
        else if (percent >= 50) color = 'orange';
        else color = 'red';
        
        return shields.createBadge(label, `${percent}%`, color, { link });
    },

    /**
     * Create a count badge
     */
    count: (label, count, maxCount = null, link = null) => {
        const shields = new ShieldsIntegration();
        let message = count.toString();
        let color = 'blue';
        
        if (maxCount) {
            message = `${count}/${maxCount}`;
            const ratio = count / maxCount;
            if (ratio >= 0.9) color = 'brightgreen';
            else if (ratio >= 0.7) color = 'green';
            else if (ratio >= 0.5) color = 'yellow';
            else color = 'red';
        } else {
            if (count === 0) color = 'brightgreen';
            else if (count <= 5) color = 'yellow';
            else color = 'red';
        }
        
        return shields.createBadge(label, message, color, { link });
    }
};

// Initialize shields integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enterpriseShields = new ShieldsIntegration();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShieldsIntegration };
}