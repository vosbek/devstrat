// Executive Dashboard JavaScript
// Advanced analytics and reporting for leadership

class ExecutiveDashboard {
    constructor() {
        this.data = {};
        this.charts = {};
        this.aiInsights = null;
        this.init();
    }

    async init() {
        console.log('📊 Executive Dashboard initializing...');
        
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderCharts();
            this.updateMetrics();
            this.generateExecutiveSummary();
            this.setupPeriodicUpdates();
        } catch (error) {
            console.error('Failed to initialize executive dashboard:', error);
            this.showErrorState();
        }
    }

    async loadData() {
        try {
            // Load all necessary data
            const [metricsData, toolsData, trainingData] = await Promise.all([
                fetch('../data/metrics.json').then(r => r.json()),
                fetch('../data/tools.json').then(r => r.json()),
                fetch('../data/training.json').then(r => r.json())
            ]);

            this.data = {
                metrics: metricsData,
                tools: toolsData,
                training: trainingData
            };

            console.log('📈 Executive data loaded successfully');
        } catch (error) {
            console.error('Error loading executive data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Refresh data button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Export report button
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }

        // Last updated timestamp
        this.updateLastUpdated();
    }

    async refreshData() {
        console.log('🔄 Refreshing executive data...');
        const refreshBtn = document.getElementById('refreshData');
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            refreshBtn.disabled = true;
        }

        try {
            await this.loadData();
            this.renderCharts();
            this.updateMetrics();
            this.generateExecutiveSummary();
            
            // Show success notification
            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showNotification('Failed to refresh data', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshBtn.disabled = false;
            }
        }
    }

    updateMetrics() {
        const metrics = this.data.metrics;
        
        // Update KPI cards
        const updates = {
            'monthlyROI': `$${(metrics.overview.monthly_roi / 1000000).toFixed(1)}M`,
            'adoptionRate': `${metrics.overview.adoption_rate.toFixed(0)}%`,
            'productivityGain': `+${this.calculateAverageProductivityGain()}%`,
            'satisfaction': `${metrics.satisfaction_survey.overall_satisfaction}/5`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateValue(element, value);
            }
        });

        // Update report date
        const reportDate = document.getElementById('reportDate');
        if (reportDate) {
            reportDate.textContent = new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }

    calculateAverageProductivityGain() {
        const gains = [
            this.data.metrics.productivity_metrics.development_velocity.stories_per_sprint_increase,
            this.data.metrics.productivity_metrics.development_velocity.bug_fix_time_reduction,
            this.data.metrics.productivity_metrics.development_velocity.code_review_time_reduction
        ];
        
        return Math.round(gains.reduce((a, b) => a + b, 0) / gains.length);
    }

    renderCharts() {
        this.renderROITrendChart();
        this.renderAdoptionChart();
        this.renderProductivityChart();
        this.renderCostBenefitChart();
    }

    renderROITrendChart() {
        const ctx = document.getElementById('roiChart');
        if (!ctx) return;

        const monthlyTrends = this.data.metrics.monthly_trends;
        const months = Object.keys(monthlyTrends).map(month => {
            const [year, monthNum] = month.split('_');
            return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
        });
        const roiData = Object.values(monthlyTrends).map(trend => trend.roi / 1000000);

        if (this.charts.roiChart) {
            this.charts.roiChart.destroy();
        }

        this.charts.roiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly ROI ($M)',
                    data: roiData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...ChartUtils.createDefaultOptions(),
                plugins: {
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    renderAdoptionChart() {
        const ctx = document.getElementById('adoptionChart');
        if (!ctx) return;

        const adoptionData = this.data.metrics.adoption_metrics.by_tool;
        const labels = adoptionData.map(tool => tool.tool_name);
        const data = adoptionData.map(tool => tool.adoption_rate);

        if (this.charts.adoptionChart) {
            this.charts.adoptionChart.destroy();
        }

        this.charts.adoptionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ChartUtils.generateColors(labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderProductivityChart() {
        const ctx = document.getElementById('productivityChart');
        if (!ctx) return;

        const tools = this.data.tools.tools.filter(tool => 
            tool.status === 'DEPLOYED' || tool.status === 'PILOT_COMPLETE'
        );
        
        const labels = tools.map(tool => tool.name);
        const data = tools.map(tool => 
            tool.roi_calculation ? tool.roi_calculation.productivity_gain_percent : 0
        );

        if (this.charts.productivityChart) {
            this.charts.productivityChart.destroy();
        }

        this.charts.productivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Productivity Gain (%)',
                    data: data,
                    backgroundColor: ChartUtils.generateColors(labels.length),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                ...ChartUtils.createDefaultOptions(),
                plugins: {
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    renderCostBenefitChart() {
        const ctx = document.getElementById('costBenefitChart');
        if (!ctx) return;

        const tools = this.data.tools.tools.filter(tool => 
            tool.roi_calculation && (tool.status === 'DEPLOYED' || tool.status === 'PILOT_COMPLETE')
        );

        const data = tools.map(tool => ({
            x: tool.roi_calculation.monthly_cost,
            y: tool.roi_calculation.monthly_savings,
            label: tool.name,
            r: Math.sqrt(tool.users_count) * 2 // Bubble size based on user count
        }));

        if (this.charts.costBenefitChart) {
            this.charts.costBenefitChart.destroy();
        }

        this.charts.costBenefitChart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Cost vs Benefit',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3B82F6',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Monthly Cost ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Monthly Savings ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.parsed;
                                const tool = data[context.dataIndex];
                                return [
                                    `Tool: ${tool.label}`,
                                    `Cost: $${point.x.toLocaleString()}`,
                                    `Savings: $${point.y.toLocaleString()}`,
                                    `ROI: ${((point.y / point.x - 1) * 100).toFixed(0)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    async generateExecutiveSummary() {
        // Generate AI-powered insights if API key is available
        const apiKey = localStorage.getItem('aiApiKey');
        
        if (apiKey) {
            try {
                const insights = await this.generateAIInsights();
                if (insights) {
                    this.updateExecutiveSummary(insights);
                    return;
                }
            } catch (error) {
                console.warn('AI insights generation failed, using fallback');
            }
        }

        // Fallback to template-based insights
        this.updateExecutiveSummary(this.generateFallbackInsights());
    }

    async generateAIInsights() {
        const apiKey = localStorage.getItem('aiApiKey');
        if (!apiKey) return null;

        const context = {
            roi: this.data.metrics.overview.monthly_roi,
            adoption: this.data.metrics.overview.adoption_rate,
            satisfaction: this.data.metrics.satisfaction_survey.overall_satisfaction,
            tools: this.data.tools.tools.map(t => ({ name: t.name, status: t.status, score: t.evaluation_score })),
            alerts: this.data.metrics.strategic_alerts
        };

        const prompt = `As an AI strategy consultant, analyze this data and provide a 30-second executive summary with:
        1. Key Win (one specific achievement with numbers)
        2. New Opportunity (emerging trend or tool to explore)
        3. Resource Need (specific budget or investment request)
        
        Keep each point to one sentence, focus on actionable insights for insurance industry executives.`;

        try {
            const hub = window.aiStrategyHub;
            const response = await hub.callAIAPI(prompt, context);
            
            if (response) {
                return this.parseAIResponse(response);
            }
        } catch (error) {
            console.error('AI insights generation failed:', error);
        }

        return null;
    }

    parseAIResponse(response) {
        // Simple parsing of AI response
        const lines = response.split('\n').filter(line => line.trim());
        
        return {
            keyWin: lines.find(line => line.includes('Win') || line.includes('achievement')) || 
                   "Cursor pilot completed with 8.5/10 success rate, demonstrating 35% productivity improvement for complex tasks",
            newOpportunity: lines.find(line => line.includes('Opportunity') || line.includes('trend')) || 
                          "AWS Strands Agents SDK offers enterprise-grade AI development platform with production-ready capabilities",
            resourceNeed: lines.find(line => line.includes('Resource') || line.includes('budget') || line.includes('investment')) || 
                         "$150K budget request for Cursor enterprise licenses and advanced training program expansion"
        };
    }

    generateFallbackInsights() {
        const metrics = this.data.metrics;
        
        return {
            keyWin: `${metrics.overview.adoption_rate.toFixed(0)}% AI tool adoption achieved, generating $${(metrics.overview.monthly_roi / 1000000).toFixed(1)}M monthly ROI`,
            newOpportunity: "Context engineering adoption shows potential for additional 25% productivity gains based on pilot data",
            resourceNeed: `$150K investment in Cursor expansion could accelerate ROI to $${((metrics.overview.monthly_roi * 1.4) / 1000000).toFixed(1)}M monthly`
        };
    }

    updateExecutiveSummary(insights) {
        const elements = {
            'keyWin': insights.keyWin,
            'newOpportunity': insights.newOpportunity,
            'resourceNeed': insights.resourceNeed
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }

    animateValue(element, newValue) {
        // Simple animation for value changes
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 100);
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleString();
        }
    }

    setupPeriodicUpdates() {
        // Update timestamp every minute
        setInterval(() => {
            this.updateLastUpdated();
        }, 60000);
    }

    exportReport() {
        console.log('📄 Exporting executive report...');
        
        // Generate report content
        const reportData = this.generateReportData();
        
        // Create downloadable content
        const reportContent = this.formatReportForExport(reportData);
        
        // Create and trigger download
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-strategy-executive-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully', 'success');
    }

    generateReportData() {
        const metrics = this.data.metrics;
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });

        return {
            date: currentDate,
            metrics: {
                roi: metrics.overview.monthly_roi,
                adoption: metrics.overview.adoption_rate,
                satisfaction: metrics.satisfaction_survey.overall_satisfaction,
                developers: metrics.overview.total_developers
            },
            insights: this.generateFallbackInsights(),
            tools: this.data.tools.tools.filter(t => t.status === 'DEPLOYED' || t.status === 'PILOT_COMPLETE'),
            alerts: metrics.strategic_alerts || []
        };
    }

    formatReportForExport(data) {
        return `# AI Strategy Executive Report - ${data.date}

## Executive Summary

### Key Win
${data.insights.keyWin}

### New Opportunity
${data.insights.newOpportunity}

### Resource Need
${data.insights.resourceNeed}

## Key Performance Indicators

- **Monthly ROI**: $${(data.metrics.roi / 1000000).toFixed(1)}M
- **Adoption Rate**: ${data.metrics.adoption.toFixed(1)}%
- **Developer Satisfaction**: ${data.metrics.satisfaction}/5
- **Total Developers**: ${data.metrics.developers.toLocaleString()}

## Strategic Recommendations

### High Priority
- Expand Cursor pilot to 200 developers (ROI: 240%)
- Implement context engineering certification program

### Medium Priority
- Evaluate AWS Strands Agents SDK for custom development
- Enhance training programs based on completion rates

## Risk Assessment

${data.alerts.map(alert => `- **${alert.title}**: ${alert.description}`).join('\n')}

## Tool Portfolio Status

${data.tools.map(tool => `- **${tool.name}**: ${tool.status} (Score: ${tool.evaluation_score}/10)`).join('\n')}

---
*Generated by AI Strategy Hub on ${new Date().toLocaleString()}*`;
    }

    showNotification(message, type = 'info') {
        // Reuse notification system from main.js
        if (window.aiStrategyHub) {
            window.aiStrategyHub.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showErrorState() {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed inset-0 flex items-center justify-center bg-gray-100';
        errorMessage.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
                <p class="text-gray-600 mb-4">There was an error loading the executive dashboard data.</p>
                <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
        document.body.appendChild(errorMessage);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.executiveDashboard = new ExecutiveDashboard();
});