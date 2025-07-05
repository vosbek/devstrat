// Main JavaScript for AI Strategy Hub
// Client-side intelligence and interactivity

class AIStrategyHub {
    constructor() {
        this.init();
        this.loadSettings();
        this.setupEventListeners();
        this.loadData();
    }

    init() {
        console.log('🤖 AI Strategy Hub initialized');
        this.showLoadingState();
        
        // Initialize user preferences
        this.userRole = localStorage.getItem('userRole') || 'developer';
        this.apiKey = localStorage.getItem('aiApiKey') || null;
        this.theme = localStorage.getItem('theme') || 'light';
        
        // Apply theme
        this.applyTheme();
        
        // Update UI based on user role
        this.updateUserRole();
    }

    loadSettings() {
        // Load user role from dropdown
        const roleSelect = document.getElementById('userRole');
        if (roleSelect) {
            roleSelect.value = this.userRole;
        }
    }

    setupEventListeners() {
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const cancelSettings = document.getElementById('cancelSettings');
        const saveSettings = document.getElementById('saveSettings');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => this.openSettings());
            closeSettings?.addEventListener('click', () => this.closeSettings());
            cancelSettings?.addEventListener('click', () => this.closeSettings());
            saveSettings?.addEventListener('click', () => this.saveSettings());
        }

        // User role change
        const roleSelect = document.getElementById('userRole');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                this.userRole = e.target.value;
                localStorage.setItem('userRole', this.userRole);
                this.updateUserRole();
            });
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsModal && !settingsModal.classList.contains('hidden')) {
                this.closeSettings();
            }
        });
    }

    async loadData() {
        try {
            // Load metrics data for homepage
            const metricsResponse = await fetch('data/metrics.json');
            const metrics = await metricsResponse.json();
            
            this.updateHomepageMetrics(metrics);
            this.hideLoadingState();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showErrorState();
        }
    }

    updateHomepageMetrics(metrics) {
        // Update key metrics on homepage
        const elements = {
            'totalDevelopers': metrics.overview.total_developers.toLocaleString(),
            'toolsTracked': metrics.overview.tools_tracked,
            'monthlyROI': `$${(metrics.overview.monthly_roi / 1000000).toFixed(1)}M`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateUserRole() {
        // Update interface based on user role
        const body = document.body;
        body.setAttribute('data-user-role', this.userRole);
        
        // You could hide/show different elements based on role
        console.log(`🎭 User role updated to: ${this.userRole}`);
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        const apiKeyInput = document.getElementById('apiKey');
        const themeSelect = document.getElementById('theme');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Populate current settings
            if (apiKeyInput) apiKeyInput.value = this.apiKey || '';
            if (themeSelect) themeSelect.value = this.theme;
        }
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveSettings() {
        const apiKeyInput = document.getElementById('apiKey');
        const themeSelect = document.getElementById('theme');
        
        if (apiKeyInput) {
            this.apiKey = apiKeyInput.value.trim() || null;
            localStorage.setItem('aiApiKey', this.apiKey || '');
        }
        
        if (themeSelect) {
            this.theme = themeSelect.value;
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
        }
        
        this.closeSettings();
        this.showNotification('Settings saved successfully', 'success');
    }

    applyTheme() {
        // Apply theme to the document
        document.documentElement.setAttribute('data-theme', this.theme);
        
        if (this.theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.classList.add(bgColors[type] || bgColors.info, 'text-white');
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showLoadingState() {
        // Show loading indicators
        const loadingElements = document.querySelectorAll('[data-loading]');
        loadingElements.forEach(el => {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        });
    }

    hideLoadingState() {
        // Hide loading indicators
        const loadingElements = document.querySelectorAll('[data-loading]');
        loadingElements.forEach(el => {
            el.innerHTML = '';
        });
    }

    showErrorState() {
        // Show error state
        const errorElements = document.querySelectorAll('[data-error]');
        errorElements.forEach(el => {
            el.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500"></i> Error loading data';
        });
    }

    // Utility method for making AI API calls
    async callAIAPI(prompt, context = {}) {
        if (!this.apiKey) {
            console.warn('No AI API key configured');
            return null;
        }

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (error) {
            console.error('AI API call failed:', error);
            return null;
        }
    }

    // Utility method for smart fallback insights
    generateFallbackInsights(data, type = 'general') {
        const insights = {
            general: [
                "AI tool adoption is accelerating across the organization",
                "Focus on training programs to maximize ROI",
                "Consider diversifying tool portfolio to reduce vendor risk"
            ],
            tools: [
                "GitHub Copilot shows strong adoption but may need supplementation",
                "Advanced tools like Cursor show promise for complex tasks",
                "Evaluate emerging tools regularly for competitive advantage"
            ],
            training: [
                "Prompt engineering basics show high completion rates",
                "Advanced context engineering needs more attention",
                "Security training should be prioritized"
            ]
        };

        return insights[type] || insights.general;
    }
}

// Utility functions
class DataUtils {
    static async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            return null;
        }
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    static formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    static formatPercentage(decimal, decimals = 1) {
        return `${(decimal * 100).toFixed(decimals)}%`;
    }

    static formatDate(dateString) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    }

    static formatDateTime(dateString) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(new Date(dateString));
    }
}

// Chart utilities
class ChartUtils {
    static createDefaultOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: !!title,
                    text: title
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    static generateColors(count) {
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
            '#EC4899', '#6366F1', '#14B8A6', '#F472B6'
        ];
        
        return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiStrategyHub = new AIStrategyHub();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIStrategyHub, DataUtils, ChartUtils };
}