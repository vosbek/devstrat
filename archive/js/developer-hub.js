// Developer Hub JavaScript
// Personalized learning, skill assessment, and community features

class DeveloperHub {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.skillData = {};
        this.trainingData = {};
        this.toolData = {};
        this.init();
    }

    async init() {
        console.log('👨‍💻 Developer Hub initializing...');
        
        try {
            await this.loadData();
            this.setupEventListeners();
            this.personalizeForUser();
            this.renderSkillProgress();
            this.renderLearningPath();
            this.renderToolRecommendations();
            this.renderCommunityFeed();
        } catch (error) {
            console.error('Failed to initialize developer hub:', error);
            this.showErrorState();
        }
    }

    loadUserProfile() {
        // Load user profile from localStorage or create default
        const savedProfile = localStorage.getItem('developerProfile');
        
        if (savedProfile) {
            return JSON.parse(savedProfile);
        }

        // Default profile
        return {
            name: 'Developer',
            level: 'intermediate',
            skillPoints: 850,
            completedCourses: 7,
            totalCourses: 12,
            communityRank: 23,
            skills: {
                promptEngineering: 85,
                contextEngineering: 60,
                toolMastery: 75,
                aiSecurity: 45
            },
            achievements: [
                { id: 'prompt-master', name: 'Prompt Master', description: 'Completed advanced prompt engineering', earned: true },
                { id: 'tool-explorer', name: 'Tool Explorer', description: 'Tested 5 different AI coding tools', earned: true },
                { id: 'community-contributor', name: 'Community Contributor', description: 'Shared 3 prompt patterns', earned: true }
            ],
            preferences: {
                learningStyle: 'hands-on',
                focusAreas: ['context-engineering', 'advanced-prompting'],
                toolInterests: ['cursor', 'claude-code']
            }
        };
    }

    saveUserProfile() {
        localStorage.setItem('developerProfile', JSON.stringify(this.userProfile));
    }

    async loadData() {
        try {
            const [trainingResponse, toolsResponse, metricsResponse] = await Promise.all([
                fetch('../data/training.json'),
                fetch('../data/tools.json'),
                fetch('../data/metrics.json')
            ]);

            this.trainingData = await trainingResponse.json();
            this.toolData = await toolsResponse.json();
            this.metricsData = await metricsResponse.json();

            console.log('📚 Developer hub data loaded successfully');
        } catch (error) {
            console.error('Error loading developer hub data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Take Assessment button
        const assessmentBtn = document.getElementById('takeAssessment');
        if (assessmentBtn) {
            assessmentBtn.addEventListener('click', () => this.startSkillAssessment());
        }

        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.openProfile());
        }

        // Quick action buttons
        this.setupQuickActions();
    }

    setupQuickActions() {
        const quickActions = document.querySelectorAll('[data-quick-action]');
        quickActions.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.quickAction;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'assessment':
                this.startSkillAssessment();
                break;
            case 'request-tool':
                this.showToolRequestModal();
                break;
            case 'share-pattern':
                this.showPatternSharingModal();
                break;
            case 'get-help':
                this.showHelpModal();
                break;
            default:
                console.log(`Unknown quick action: ${action}`);
        }
    }

    personalizeForUser() {
        // Update user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = this.userProfile.name;
        }

        // Update stats
        this.updateUserStats();
        
        // Customize content based on skill level and preferences
        this.customizeContent();
    }

    updateUserStats() {
        const updates = {
            'userLevel': this.userProfile.level.charAt(0).toUpperCase() + this.userProfile.level.slice(1),
            'completedCourses': `${this.userProfile.completedCourses}/${this.userProfile.totalCourses}`,
            'skillPoints': this.userProfile.skillPoints.toLocaleString(),
            'communityRank': `#${this.userProfile.communityRank}`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    customizeContent() {
        // Customize based on user level and interests
        const body = document.body;
        body.setAttribute('data-user-level', this.userProfile.level);
        
        // Show/hide content based on skill level
        this.adjustContentForSkillLevel();
    }

    adjustContentForSkillLevel() {
        const level = this.userProfile.level;
        
        // Hide advanced content for beginners
        if (level === 'beginner') {
            const advancedElements = document.querySelectorAll('[data-skill-level="advanced"]');
            advancedElements.forEach(el => el.style.display = 'none');
        }
        
        // Highlight recommended content
        const recommendations = document.querySelectorAll(`[data-recommended-for="${level}"]`);
        recommendations.forEach(el => {
            el.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        });
    }

    renderSkillProgress() {
        const skills = this.userProfile.skills;
        
        Object.entries(skills).forEach(([skill, percentage]) => {
            const progressBar = document.querySelector(`[data-skill="${skill}"] .progress-bar`);
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            
            const percentageText = document.querySelector(`[data-skill="${skill}"] .percentage`);
            if (percentageText) {
                percentageText.textContent = `${percentage}%`;
            }
        });

        // Update overall progress
        const overallProgress = Object.values(skills).reduce((a, b) => a + b, 0) / Object.keys(skills).length;
        this.updateOverallProgress(overallProgress);
    }

    updateOverallProgress(percentage) {
        const progressElement = document.querySelector('.overall-progress');
        if (progressElement) {
            progressElement.style.width = `${percentage}%`;
        }
    }

    renderLearningPath() {
        const curricula = this.trainingData.curricula || [];
        const userLevel = this.userProfile.level;
        
        // Filter and sort curricula based on user level
        const relevantCurricula = curricula.filter(course => {
            if (userLevel === 'beginner') return course.level === 'beginner';
            if (userLevel === 'intermediate') return ['beginner', 'intermediate'].includes(course.level);
            return true; // Advanced users see everything
        });

        // Find current course
        const currentCourse = this.findCurrentCourse(relevantCurricula);
        if (currentCourse) {
            this.updateCurrentCourseDisplay(currentCourse);
        }

        // Update course recommendations
        this.updateCourseRecommendations(relevantCurricula);
    }

    findCurrentCourse(curricula) {
        // Logic to determine current course based on completion status
        return curricula.find(course => 
            course.completion_rate > 0 && course.completion_rate < 100
        ) || curricula[0];
    }

    updateCurrentCourseDisplay(course) {
        // Update the current course card with real data
        const currentCourseCard = document.querySelector('.current-course');
        if (currentCourseCard && course) {
            const title = currentCourseCard.querySelector('h4');
            const description = currentCourseCard.querySelector('p');
            const progress = currentCourseCard.querySelector('.progress-bar');
            
            if (title) title.textContent = course.name;
            if (description) description.textContent = course.description;
            if (progress) progress.style.width = `${course.completion_rate || 0}%`;
        }
    }

    updateCourseRecommendations(curricula) {
        // Update recommended courses based on user profile
        const recommendations = this.generateCourseRecommendations(curricula);
        // Implementation would update the UI with recommendations
    }

    generateCourseRecommendations(curricula) {
        // AI-powered course recommendations based on user skills and interests
        return curricula
            .filter(course => !this.userProfile.completedCourses.includes(course.id))
            .sort((a, b) => this.calculateRecommendationScore(b) - this.calculateRecommendationScore(a))
            .slice(0, 3);
    }

    calculateRecommendationScore(course) {
        // Calculate recommendation score based on user profile
        let score = 0;
        
        // Boost score for user's focus areas
        if (this.userProfile.preferences.focusAreas.some(area => 
            course.name.toLowerCase().includes(area.replace('-', ' ')))) {
            score += 50;
        }
        
        // Consider completion rates and satisfaction
        score += (course.completion_rate || 0) * 0.3;
        score += (course.satisfaction || 0) * 10;
        
        return score;
    }

    renderToolRecommendations() {
        const tools = this.toolData.tools || [];
        const userTools = this.getUserTools();
        
        // Filter tools for recommendations
        const recommendations = this.generateToolRecommendations(tools, userTools);
        this.updateToolRecommendationDisplay(recommendations);
    }

    getUserTools() {
        // Get tools user is currently using
        return ['github-copilot']; // Default - could be dynamic
    }

    generateToolRecommendations(allTools, userTools) {
        return allTools
            .filter(tool => !userTools.includes(tool.id))
            .filter(tool => ['PILOT_COMPLETE', 'EVALUATION'].includes(tool.status))
            .sort((a, b) => this.calculateToolRecommendationScore(b) - this.calculateToolRecommendationScore(a))
            .slice(0, 3);
    }

    calculateToolRecommendationScore(tool) {
        let score = tool.evaluation_score || 0;
        
        // Boost score for tools matching user interests
        if (this.userProfile.preferences.toolInterests.includes(tool.id)) {
            score += 2;
        }
        
        // Consider user skill level
        if (this.userProfile.level === 'advanced' && tool.category === 'AI_FIRST_IDE') {
            score += 1;
        }
        
        return score;
    }

    updateToolRecommendationDisplay(recommendations) {
        // Update tool recommendation cards with real data
        recommendations.forEach((tool, index) => {
            const card = document.querySelector(`[data-tool-card="${index}"]`);
            if (card) {
                this.updateToolCard(card, tool);
            }
        });
    }

    updateToolCard(card, tool) {
        const name = card.querySelector('.tool-name');
        const description = card.querySelector('.tool-description');
        const score = card.querySelector('.match-score');
        const cost = card.querySelector('.tool-cost');
        
        if (name) name.textContent = tool.name;
        if (description) description.textContent = tool.use_cases.join(', ');
        if (score) score.textContent = `${Math.round(this.calculateToolRecommendationScore(tool) * 10)}%`;
        if (cost) cost.textContent = tool.cost_per_user_monthly ? `$${tool.cost_per_user_monthly}/month` : 'Free';
    }

    renderCommunityFeed() {
        // Render community contributions and activity
        const contributions = this.trainingData.community_contributions || [];
        this.updateCommunityDisplay(contributions);
    }

    updateCommunityDisplay(contributions) {
        // Update community feed with recent contributions
        const feed = document.querySelector('.community-feed');
        if (feed && contributions.length > 0) {
            this.populateCommunityFeed(feed, contributions);
        }
    }

    populateCommunityFeed(feedElement, contributions) {
        // Generate community feed items
        const patterns = contributions.find(c => c.type === 'pattern_library');
        if (patterns && patterns.top_patterns) {
            patterns.top_patterns.slice(0, 3).forEach((pattern, index) => {
                this.addCommunityFeedItem(feedElement, pattern, index);
            });
        }
    }

    addCommunityFeedItem(feedElement, pattern, index) {
        const item = document.createElement('div');
        item.className = 'bg-white rounded-lg p-4 mb-3';
        item.innerHTML = `
            <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-sm font-semibold">${pattern.author.split('.')[0].charAt(0).toUpperCase()}</span>
                </div>
                <div>
                    <span class="font-medium text-gray-900">${pattern.author.split('@')[0]}</span>
                    <span class="text-sm text-gray-500 ml-2">shared a pattern</span>
                </div>
            </div>
            <p class="text-sm text-gray-700 mb-2">${pattern.name}</p>
            <div class="text-xs text-gray-500">
                ⭐ ${pattern.rating} • 📥 ${pattern.downloads} downloads
            </div>
        `;
        
        feedElement.appendChild(item);
    }

    startSkillAssessment() {
        console.log('🎯 Starting skill assessment...');
        
        // Create assessment modal
        const modal = this.createAssessmentModal();
        document.body.appendChild(modal);
        
        // Initialize assessment
        this.currentAssessment = new SkillAssessment(this.trainingData.skill_assessments || []);
        this.currentAssessment.start();
    }

    createAssessmentModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.id = 'assessmentModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">AI Skills Assessment</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="assessmentContent">
                        <div class="text-center py-8">
                            <i class="fas fa-clipboard-check text-4xl text-blue-500 mb-4"></i>
                            <h4 class="text-xl font-semibold mb-4">Ready to assess your AI skills?</h4>
                            <p class="text-gray-600 mb-6">This assessment will help us personalize your learning experience.</p>
                            <button onclick="window.developerHub.beginAssessment()" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                                Begin Assessment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    beginAssessment() {
        // Placeholder for assessment logic
        const content = document.getElementById('assessmentContent');
        if (content) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                    <h4 class="text-xl font-semibold mb-4">Assessment Complete!</h4>
                    <p class="text-gray-600 mb-6">Your skills have been updated. Check out your personalized recommendations.</p>
                    <button onclick="this.closest('.fixed').remove()" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                        View Results
                    </button>
                </div>
            `;
        }
        
        // Update skill scores (simulated)
        this.updateSkillScores();
    }

    updateSkillScores() {
        // Simulate skill score updates
        const improvements = {
            promptEngineering: 5,
            contextEngineering: 10,
            aiSecurity: 15
        };
        
        Object.entries(improvements).forEach(([skill, improvement]) => {
            if (this.userProfile.skills[skill]) {
                this.userProfile.skills[skill] = Math.min(100, this.userProfile.skills[skill] + improvement);
            }
        });
        
        this.saveUserProfile();
        this.renderSkillProgress();
        this.showNotification('Skills updated based on assessment results!', 'success');
    }

    showToolRequestModal() {
        // Implementation for tool request functionality
        this.showNotification('Tool request feature coming soon!', 'info');
    }

    showPatternSharingModal() {
        // Implementation for pattern sharing
        this.showNotification('Pattern sharing feature coming soon!', 'info');
    }

    showHelpModal() {
        // Implementation for help system
        this.showNotification('Help system coming soon!', 'info');
    }

    openProfile() {
        // Open user profile management
        console.log('👤 Opening user profile...');
        this.showNotification('Profile management coming soon!', 'info');
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
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Failed to Load Developer Hub</h2>
                <p class="text-gray-600 mb-4">There was an error loading your personalized dashboard.</p>
                <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
        document.body.appendChild(errorMessage);
    }
}

// Skill Assessment class
class SkillAssessment {
    constructor(assessments) {
        this.assessments = assessments;
        this.currentAssessment = null;
        this.currentQuestion = 0;
        this.answers = [];
    }

    start() {
        if (this.assessments.length > 0) {
            this.currentAssessment = this.assessments[0]; // Start with first assessment
            this.showQuestion();
        }
    }

    showQuestion() {
        // Implementation for showing assessment questions
        console.log('Showing assessment question:', this.currentQuestion);
    }

    submitAnswer(answer) {
        this.answers.push(answer);
        this.currentQuestion++;
        
        if (this.currentQuestion < this.currentAssessment.questions) {
            this.showQuestion();
        } else {
            this.completeAssessment();
        }
    }

    completeAssessment() {
        // Calculate results and update user profile
        console.log('Assessment completed with answers:', this.answers);
    }
}

// Initialize developer hub when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.developerHub = new DeveloperHub();
});