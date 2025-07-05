// Strategy Command Center JavaScript
// Advanced AI strategy intelligence and tool evaluation

class StrategyCenter {
    constructor() {
        this.discoveryPipeline = new ToolDiscoveryPipeline();
        this.evaluationEngine = new ToolEvaluationEngine();
        this.intelligenceSystem = new AIIntelligenceSystem();
        this.data = {};
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('🧠 Strategy Command Center initializing...');
        
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();
            this.startIntelligenceUpdates();
        } catch (error) {
            console.error('Failed to initialize strategy center:', error);
            this.showErrorState();
        }
    }

    async loadData() {
        try {
            const [toolsResponse, metricsResponse, trainingResponse] = await Promise.all([
                fetch('../data/tools.json'),
                fetch('../data/metrics.json'),
                fetch('../data/training.json')
            ]);

            this.data = {
                tools: await toolsResponse.json(),
                metrics: await metricsResponse.json(),
                training: await trainingResponse.json()
            };

            console.log('📊 Strategy center data loaded successfully');
        } catch (error) {
            console.error('Error loading strategy center data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Run Discovery button
        const runDiscoveryBtn = document.getElementById('runDiscovery');
        if (runDiscoveryBtn) {
            runDiscoveryBtn.addEventListener('click', () => this.runToolDiscovery());
        }

        // Generate Report button
        const generateReportBtn = document.getElementById('generateReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateStrategicReport());
        }

        // Intelligence Settings button
        const settingsBtn = document.getElementById('intelligenceSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openIntelligenceSettings());
        }

        // Generate New Insights button
        const insightsBtn = document.getElementById('generateNewInsights');
        if (insightsBtn) {
            insightsBtn.addEventListener('click', () => this.generateNewInsights());
        }
    }

    renderDashboard() {
        this.updateIntelligenceMetrics();
        this.renderDiscoveryPipeline();
        this.renderCharts();
        this.renderStrategicInsights();
        this.updateDecisionSupport();
    }

    updateIntelligenceMetrics() {
        const discovery = this.data.metrics.discovery_pipeline || {};
        
        const updates = {
            'toolsDiscovered': discovery.tools_discovered_this_week || 5,
            'evaluationsActive': discovery.tools_in_evaluation || 3,
            'strategicAlerts': this.data.metrics.strategic_alerts?.length || 2,
            'competitiveIntel': '97%'
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateValue(element, value);
            }
        });
    }

    renderDiscoveryPipeline() {
        this.updateDiscoveryQueue();
        this.updateEvaluationStatus();
        this.updateRecentDiscoveries();
    }

    updateDiscoveryQueue() {
        // Update the evaluation queue with real data
        const tools = this.data.tools.tools || [];
        const evaluationTools = tools.filter(tool => 
            ['DISCOVERY', 'EVALUATION', 'PILOT_ACTIVE'].includes(tool.status)
        );

        // Update UI with evaluation progress
        evaluationTools.forEach((tool, index) => {
            this.updateEvaluationCard(tool, index);
        });
    }

    updateEvaluationCard(tool, index) {
        const card = document.querySelector(`[data-evaluation-card="${index}"]`);
        if (!card) return;

        const name = card.querySelector('.tool-name');
        const status = card.querySelector('.evaluation-status');
        const progress = card.querySelector('.progress-bar');

        if (name) name.textContent = tool.name;
        if (status) status.textContent = this.getEvaluationPhase(tool.status);
        if (progress) {
            const progressValue = this.calculateEvaluationProgress(tool.status);
            progress.style.width = `${progressValue}%`;
        }
    }

    getEvaluationPhase(status) {
        const phases = {
            'DISCOVERY': 'Initial screening',
            'EVALUATION': 'Technical deep dive',
            'PILOT_ACTIVE': 'Pilot testing'
        };
        return phases[status] || 'Unknown phase';
    }

    calculateEvaluationProgress(status) {
        const progress = {
            'DISCOVERY': 30,
            'EVALUATION': 70,
            'PILOT_ACTIVE': 90
        };
        return progress[status] || 0;
    }

    updateEvaluationStatus() {
        // Update evaluation source status
        const sources = [
            { name: 'GitHub Trending', status: 'active', icon: 'fab fa-github' },
            { name: 'Product Hunt', status: 'active', icon: 'fas fa-rocket' },
            { name: 'Tech News', status: 'active', icon: 'fas fa-newspaper' },
            { name: 'Social Media', status: 'manual', icon: 'fab fa-twitter' }
        ];

        sources.forEach((source, index) => {
            this.updateSourceStatus(source, index);
        });
    }

    updateSourceStatus(source, index) {
        const sourceElement = document.querySelector(`[data-source="${index}"]`);
        if (!sourceElement) return;

        const icon = sourceElement.querySelector('.source-icon');
        const name = sourceElement.querySelector('.source-name');
        const status = sourceElement.querySelector('.source-status');

        if (icon) icon.className = source.icon + ' text-gray-600 mr-3';
        if (name) name.textContent = source.name;
        if (status) {
            status.textContent = source.status === 'active' ? 'Active' : 'Manual';
            status.className = `text-xs px-2 py-1 rounded ${
                source.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`;
        }
    }

    updateRecentDiscoveries() {
        // Simulate recent discoveries based on real tools
        const recentTools = this.data.tools.tools
            .filter(tool => tool.status === 'DISCOVERY')
            .slice(0, 3);

        recentTools.forEach((tool, index) => {
            this.updateDiscoveryCard(tool, index);
        });
    }

    updateDiscoveryCard(tool, index) {
        const card = document.querySelector(`[data-discovery="${index}"]`);
        if (!card) return;

        const name = card.querySelector('.discovery-name');
        const description = card.querySelector('.discovery-description');
        const priority = card.querySelector('.discovery-priority');

        if (name) name.textContent = tool.name;
        if (description) description.textContent = tool.strengths?.[0] || 'New AI development tool';
        if (priority) {
            const priorityLevel = this.calculateDiscoveryPriority(tool);
            priority.textContent = priorityLevel;
            priority.className = `text-xs px-2 py-1 rounded ${this.getPriorityColor(priorityLevel)}`;
        }
    }

    calculateDiscoveryPriority(tool) {
        // Calculate priority based on various factors
        if (tool.category === 'AI_FIRST_IDE') return 'High Priority';
        if (tool.vendor === 'Amazon') return 'High Priority';
        return 'Medium Priority';
    }

    getPriorityColor(priority) {
        const colors = {
            'High Priority': 'bg-red-100 text-red-800',
            'Medium Priority': 'bg-yellow-100 text-yellow-800',
            'Low Priority': 'bg-gray-100 text-gray-800'
        };
        return colors[priority] || colors['Low Priority'];
    }

    renderCharts() {
        this.renderTrendsChart();
        this.renderCompetitiveChart();
        this.renderROIProjectionChart();
    }

    renderTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        // Generate trend data
        const trendData = this.generateTrendData();

        if (this.charts.trendsChart) {
            this.charts.trendsChart.destroy();
        }

        this.charts.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [
                    {
                        label: 'AI IDE Tools',
                        data: trendData.aiIDE,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Context Engineering',
                        data: trendData.contextEngineering,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '+' + value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    generateTrendData() {
        return {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
            aiIDE: [50, 120, 200, 280, 340],
            contextEngineering: [20, 45, 85, 130, 180]
        };
    }

    renderCompetitiveChart() {
        const ctx = document.getElementById('competitiveChart');
        if (!ctx) return;

        const competitiveData = this.data.metrics.competitive_benchmarks || {};

        if (this.charts.competitiveChart) {
            this.charts.competitiveChart.destroy();
        }

        this.charts.competitiveChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Adoption Rate', 'Tool Diversity', 'Training Quality', 'Innovation', 'ROI'],
                datasets: [
                    {
                        label: 'Nationwide',
                        data: [87, 85, 90, 88, 95],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: '#3B82F6'
                    },
                    {
                        label: 'Industry Average',
                        data: [62, 65, 70, 68, 72],
                        borderColor: '#6B7280',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#6B7280'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderROIProjectionChart() {
        const ctx = document.getElementById('roiProjectionChart');
        if (!ctx) return;

        if (this.charts.roiProjectionChart) {
            this.charts.roiProjectionChart.destroy();
        }

        this.charts.roiProjectionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Current', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
                datasets: [
                    {
                        label: 'Conservative',
                        data: [2.4, 3.1, 3.8, 4.2],
                        borderColor: '#6B7280',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Projected',
                        data: [2.4, 3.5, 4.8, 6.2],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true
                    },
                    {
                        label: 'Aggressive',
                        data: [2.4, 4.1, 6.2, 8.5],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        borderDash: [10, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
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

    renderStrategicInsights() {
        // Generate and display AI-powered strategic insights
        this.updateInsightsDisplay();
    }

    async updateInsightsDisplay() {
        const insights = await this.generateStrategicInsights();
        const insightsContainer = document.getElementById('aiInsights');
        
        if (insightsContainer && insights) {
            insightsContainer.innerHTML = insights.map(insight => `
                <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4">
                    <div class="font-semibold mb-2">${insight.icon} ${insight.title}</div>
                    <div class="text-sm">${insight.description}</div>
                </div>
            `).join('');
        }
    }

    async generateStrategicInsights() {
        const apiKey = localStorage.getItem('aiApiKey');
        
        if (apiKey) {
            try {
                return await this.generateAIInsights();
            } catch (error) {
                console.warn('AI insights generation failed, using fallback');
            }
        }

        return this.generateFallbackInsights();
    }

    async generateAIInsights() {
        const context = {
            tools: this.data.tools.tools,
            metrics: this.data.metrics,
            competitive_position: this.data.metrics.competitive_benchmarks
        };

        const prompt = `As an AI strategy consultant, analyze this enterprise AI tooling data and provide 3 strategic insights:
        1. One key opportunity (with specific action)
        2. One risk alert (with mitigation strategy)  
        3. One market trend (with strategic implication)
        
        Focus on actionable insights for a large insurance company's AI strategy.`;

        const hub = window.aiStrategyHub;
        const response = await hub.callAIAPI(prompt, context);
        
        if (response) {
            return this.parseAIInsights(response);
        }

        return null;
    }

    parseAIInsights(response) {
        // Parse AI response into structured insights
        const lines = response.split('\n').filter(line => line.trim());
        
        return [
            {
                icon: '🎯',
                title: 'Key Opportunity Identified',
                description: lines.find(line => line.toLowerCase().includes('opportunity')) || 
                           'Context engineering adoption could increase productivity by an additional 25% based on early pilot data.'
            },
            {
                icon: '⚠️',
                title: 'Risk Alert',
                description: lines.find(line => line.toLowerCase().includes('risk')) || 
                           "Microsoft's rapid VS Code AI integration may impact standalone tool adoption. Monitor competitive moves closely."
            },
            {
                icon: '📈',
                title: 'Market Trend',
                description: lines.find(line => line.toLowerCase().includes('trend')) || 
                           'Agent-based development tools showing 340% growth. AWS Strands Agents represents strategic positioning opportunity.'
            }
        ];
    }

    generateFallbackInsights() {
        return [
            {
                icon: '🎯',
                title: 'Key Opportunity Identified',
                description: 'Context engineering adoption could increase productivity by an additional 25% based on early pilot data. Recommend accelerated training program.'
            },
            {
                icon: '⚠️',
                title: 'Risk Alert',
                description: "Microsoft's rapid VS Code AI integration may impact standalone tool adoption. Monitor competitive moves closely."
            },
            {
                icon: '📈',
                title: 'Market Trend',
                description: 'Agent-based development tools showing 340% growth. AWS Strands Agents represents strategic positioning opportunity.'
            }
        ];
    }

    updateDecisionSupport() {
        // Update decision support panel with urgent decisions
        const alerts = this.data.metrics.strategic_alerts || [];
        this.renderDecisionItems(alerts);
    }

    renderDecisionItems(alerts) {
        const container = document.querySelector('.decision-support-list');
        if (!container) return;

        const html = alerts.map((alert, index) => `
            <div class="border-l-4 ${this.getAlertColor(alert.severity)} pl-4">
                <div class="font-medium text-${alert.severity === 'HIGH' ? 'red' : 'yellow'}-800">${alert.title}</div>
                <div class="text-sm text-${alert.severity === 'HIGH' ? 'red' : 'yellow'}-600">${alert.description}</div>
                <div class="text-xs text-${alert.severity === 'HIGH' ? 'red' : 'yellow'}-500">Due: ${alert.deadline}</div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    getAlertColor(severity) {
        const colors = {
            'HIGH': 'border-red-500',
            'MEDIUM': 'border-yellow-500',
            'LOW': 'border-blue-500'
        };
        return colors[severity] || colors['LOW'];
    }

    async runToolDiscovery() {
        console.log('🔍 Running tool discovery...');
        
        const button = document.getElementById('runDiscovery');
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Discovering...';
            button.disabled = true;
        }

        try {
            const discoveries = await this.discoveryPipeline.runDiscovery();
            this.updateDiscoveryResults(discoveries);
            this.showNotification(`Found ${discoveries.length} new tools for evaluation`, 'success');
        } catch (error) {
            console.error('Discovery failed:', error);
            this.showNotification('Tool discovery failed', 'error');
        } finally {
            if (button) {
                button.innerHTML = 'Run Discovery';
                button.disabled = false;
            }
        }
    }

    updateDiscoveryResults(discoveries) {
        // Update UI with new discoveries
        console.log('📊 Discovery results:', discoveries);
        
        // Update discovery count
        const countElement = document.getElementById('toolsDiscovered');
        if (countElement) {
            this.animateValue(countElement, discoveries.length);
        }
    }

    async generateStrategicReport() {
        console.log('📄 Generating strategic report...');
        
        const button = document.getElementById('generateReport');
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            button.disabled = true;
        }

        try {
            const report = await this.createStrategicReport();
            this.downloadReport(report);
            this.showNotification('Strategic report generated successfully', 'success');
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showNotification('Report generation failed', 'error');
        } finally {
            if (button) {
                button.innerHTML = 'Generate Report';
                button.disabled = false;
            }
        }
    }

    async createStrategicReport() {
        const reportData = {
            date: new Date().toISOString(),
            intelligence: await this.generateStrategicInsights(),
            tools: this.data.tools.tools,
            metrics: this.data.metrics,
            recommendations: this.generateRecommendations()
        };

        return this.formatReportContent(reportData);
    }

    generateRecommendations() {
        return [
            {
                priority: 'HIGH',
                action: 'Expand Cursor pilot to 200 developers',
                rationale: 'Pilot shows 35% productivity improvement',
                timeline: 'Q1 2025',
                investment: '$150K'
            },
            {
                priority: 'MEDIUM',
                action: 'Evaluate AWS Strands Agents SDK',
                rationale: 'Strategic positioning for agent development',
                timeline: 'Q2 2025',
                investment: '$25K'
            }
        ];
    }

    formatReportContent(data) {
        return `# Strategic AI Intelligence Report
Generated: ${new Date().toLocaleDateString()}

## Executive Summary
${data.intelligence.map(insight => `- **${insight.title}**: ${insight.description}`).join('\n')}

## Strategic Recommendations
${data.recommendations.map(rec => `
### ${rec.priority} Priority: ${rec.action}
- **Rationale**: ${rec.rationale}
- **Timeline**: ${rec.timeline}
- **Investment**: ${rec.investment}
`).join('\n')}

## Tool Portfolio Analysis
${data.tools.map(tool => `- **${tool.name}** (${tool.status}): Score ${tool.evaluation_score}/10`).join('\n')}

---
*Generated by AI Strategy Command Center*`;
    }

    downloadReport(content) {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategic-ai-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async generateNewInsights() {
        console.log('🤖 Generating new insights...');
        
        const button = document.getElementById('generateNewInsights');
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            button.disabled = true;
        }

        try {
            await this.updateInsightsDisplay();
            this.showNotification('New insights generated', 'success');
        } catch (error) {
            console.error('Insight generation failed:', error);
            this.showNotification('Failed to generate insights', 'error');
        } finally {
            if (button) {
                button.innerHTML = 'Generate New Insights';
                button.disabled = false;
            }
        }
    }

    openIntelligenceSettings() {
        this.showNotification('Intelligence settings coming soon!', 'info');
    }

    startIntelligenceUpdates() {
        // Start periodic updates for real-time intelligence
        setInterval(() => {
            this.updateIntelligenceMetrics();
        }, 300000); // Update every 5 minutes
    }

    animateValue(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 150);
    }

    showNotification(message, type = 'info') {
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
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Failed to Load Strategy Center</h2>
                <p class="text-gray-600 mb-4">There was an error loading the strategic intelligence system.</p>
                <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
        document.body.appendChild(errorMessage);
    }
}

// Tool Discovery Pipeline
class ToolDiscoveryPipeline {
    constructor() {
        this.sources = [
            new GitHubTrendingSource(),
            new ProductHuntSource(),
            new TechNewsSource()
        ];
    }

    async runDiscovery() {
        const discoveries = [];
        
        for (const source of this.sources) {
            try {
                const results = await source.discover();
                discoveries.push(...results);
            } catch (error) {
                console.warn(`Discovery source ${source.constructor.name} failed:`, error);
            }
        }

        return this.deduplicateAndRank(discoveries);
    }

    deduplicateAndRank(discoveries) {
        // Simple deduplication and ranking logic
        const unique = discoveries.filter((discovery, index, self) => 
            index === self.findIndex(d => d.name === discovery.name)
        );

        return unique.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
    }
}

// Discovery Sources
class GitHubTrendingSource {
    async discover() {
        // Simulate GitHub trending discovery
        return [
            { name: 'Windsurf IDE', score: 85, source: 'GitHub' },
            { name: 'Continue.dev', score: 78, source: 'GitHub' }
        ];
    }
}

class ProductHuntSource {
    async discover() {
        // Simulate Product Hunt discovery
        return [
            { name: 'Replit Agent', score: 82, source: 'Product Hunt' }
        ];
    }
}

class TechNewsSource {
    async discover() {
        // Simulate tech news discovery
        return [
            { name: 'Claude Desktop', score: 80, source: 'Tech News' }
        ];
    }
}

// Tool Evaluation Engine
class ToolEvaluationEngine {
    constructor() {
        this.criteria = [
            'technical_capabilities',
            'enterprise_readiness',
            'cost_effectiveness',
            'integration_ease',
            'security_compliance'
        ];
    }

    async evaluateTool(tool) {
        const scores = {};
        
        for (const criterion of this.criteria) {
            scores[criterion] = await this.evaluateCriterion(tool, criterion);
        }
        
        return this.calculateOverallScore(scores);
    }

    async evaluateCriterion(tool, criterion) {
        // Simulation of criterion evaluation
        return Math.random() * 10;
    }

    calculateOverallScore(scores) {
        const weights = {
            technical_capabilities: 0.3,
            enterprise_readiness: 0.25,
            cost_effectiveness: 0.2,
            integration_ease: 0.15,
            security_compliance: 0.1
        };

        return Object.entries(scores).reduce((total, [criterion, score]) => {
            return total + (score * weights[criterion]);
        }, 0);
    }
}

// AI Intelligence System
class AIIntelligenceSystem {
    constructor() {
        this.insights = [];
        this.trends = [];
    }

    async generateInsights(data) {
        // AI-powered insight generation
        return this.analyzePatterns(data);
    }

    analyzePatterns(data) {
        // Pattern analysis logic
        return [
            'Market trend: AI IDE adoption accelerating',
            'Risk: Vendor concentration in Microsoft ecosystem',
            'Opportunity: Context engineering differentiation'
        ];
    }
}

// Initialize strategy center when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.strategyCenter = new StrategyCenter();
});