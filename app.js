// app.js - Main application logic and initialization

class WorkoutApp {
    constructor() {
        this.currentUser = null;
        this.currentPhase = null;
        this.currentWorkout = null;
        this.dataManager = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // Initialize core components
        await this.initializeDataManager();
        await this.loadCurrentUser();
        await this.determineCurrentPhase();
        this.setupEventListeners();
        this.initializeUI();

        this.isInitialized = true;
        console.log('Workout App Initialized');
    }

    async initializeDataManager() {
        try {
            this.dataManager = {
                async getItem(key) {
                    return localStorage.getItem(key);
                },
                async setItem(key, value) {
                    localStorage.setItem(key, value);
                },
                async removeItem(key) {
                    localStorage.removeItem(key);
                }
            };
        } catch (error) {
            console.error('Failed to initialize data manager:', error);
            throw error;
        }
    }

    async loadCurrentUser() {
        try {
            const savedUser = await this.dataManager.getItem('currentUser');
            this.currentUser = savedUser || 'Dad';
            this.updateUserUI();
        } catch (error) {
            console.error('Failed to load user:', error);
            this.currentUser = 'Dad'; // Default fallback
        }
    }

    async determineCurrentPhase() {
        try {
            const startDate = new Date('2025-02-18');
            const today = new Date();
            const weeksDiff = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
            this.currentPhase = weeksDiff < 12 ? 'phase1' : 'phase2';
            this.updatePhaseUI();
        } catch (error) {
            console.error('Failed to determine phase:', error);
            this.currentPhase = 'phase1'; // Default fallback
        }
    }

    setupEventListeners() {
        // User switching
        document.getElementById('dadButton')?.addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton')?.addEventListener('click', () => this.switchUser('Alex'));

        // Workout selection
        document.querySelectorAll('.workout-select')?.forEach(button => {
            button.addEventListener('click', (e) => this.selectWorkout(e.target.dataset.workout));
        });

        // Progress view
        document.getElementById('viewProgress')?.addEventListener('click', () => this.showProgress());

        // Save/complete workout
        document.getElementById('completeWorkout')?.addEventListener('click', () => this.completeWorkout());

        // Handle back navigation
        window.addEventListener('popstate', () => this.handleNavigation());
    }

    initializeUI() {
        this.updateUserUI();
        this.updatePhaseUI();
        this.loadSuggestedWorkout();
        this.loadRecentActivity();
        this.updateProgressCards();
    }

    updateUserUI() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        
        if (dadButton && alexButton) {
            dadButton.classList.toggle('active', this.currentUser === 'Dad');
            alexButton.classList.toggle('active', this.currentUser === 'Alex');
        }
    }

    updatePhaseUI() {
        const phaseDisplay = document.getElementById('phaseProgress');
        if (phaseDisplay) {
            const startDate = new Date('2025-02-18');
            const endDate = new Date('2025-04-15');
            const today = new Date();
            const progress = ((today - startDate) / (endDate - startDate)) * 100;
            
            phaseDisplay.innerHTML = `
                <h3>Phase ${this.currentPhase === 'phase1' ? '1' : '2'}</h3>
                <div class="progress-bar">
                    <div class="progress" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p>Week ${Math.ceil(progress / (100/12))} of 12</p>
            `;
        }
       }

    async loadSuggestedWorkout() {
        const suggestedContainer = document.getElementById('suggestedWorkout');
        if (!suggestedContainer) return;

        const today = new Date().getDay();
        const workout = this.getSuggestedWorkoutForDay(today);
        
        if (workout) {
            suggestedContainer.innerHTML = `
                <h3>Suggested Workout</h3>
                <p>${workout.name}</p>
                <button onclick="app.startWorkout('${workout.id}')">Start Workout</button>
            `;
        } else {
            suggestedContainer.innerHTML = `
                <h3>Rest Day</h3>
                <p>Take it easy today!</p>
            `;
        }
    }

    getSuggestedWorkoutForDay(day) {
        // Map days to suggested workouts
        const schedule = {
            1: 'chest_tri',    // Monday
            3: 'shoulders',    // Wednesday
            5: 'back_bi'       // Friday
        };
        return WorkoutLibrary.phases[this.currentPhase].workouts[schedule[day]];
    }

    async loadRecentActivity() {
        const recentContainer = document.getElementById('recentActivity');
        if (!recentContainer) return;

        try {
            const recentWorkouts = await this.getRecentWorkouts();
            recentContainer.innerHTML = recentWorkouts.length ? 
                this.formatRecentWorkouts(recentWorkouts) :
                '<p>No recent workouts</p>';
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            recentContainer.innerHTML = '<p>Error loading recent activity</p>';
        }
    }

    async getRecentWorkouts() {
        try {
            const workouts = JSON.parse(await this.dataManager.getItem(`workouts_${this.currentUser}`)) || [];
            return workouts.slice(-3); // Last 3 workouts
        } catch (error) {
            console.error('Failed to get recent workouts:', error);
            return [];
        }
    }

    formatRecentWorkouts(workouts) {
        return workouts.map(workout => `
            <div class="recent-workout">
                <span>${workout.name}</span>
                <span>${this.formatDate(workout.date)}</span>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    async updateProgressCards() {
        const progressContainer = document.getElementById('progressCards');
        if (!progressContainer) return;

        try {
            const progress = await this.getProgress();
            progressContainer.innerHTML = this.formatProgressCards(progress);
        } catch (error) {
            console.error('Failed to update progress cards:', error);
        }
    }

    async getProgress() {
        try {
            return JSON.parse(await this.dataManager.getItem(`progress_${this.currentUser}`)) || {};
        } catch (error) {
            console.error('Failed to get progress:', error);
            return {};
        }
    }

    formatProgressCards(progress) {
        return `
            <div class="card">
                <h3>Key Lifts</h3>
                ${this.formatKeyLifts(progress.keyLifts || {})}
            </div>
            <div class="card">
                <h3>Recent Improvements</h3>
                ${this.formatImprovements(progress.improvements || {})}
            </div>
            <div class="card">
                <h3>Next Targets</h3>
                ${this.formatTargets(progress.targets || {})}
            </div>
        `;
    }

    async switchUser(user) {
        this.currentUser = user;
        await this.dataManager.setItem('currentUser', user);
        this.updateUserUI();
        await this.loadRecentActivity();
        await this.updateProgressCards();
    }

    async selectWorkout(workoutId) {
        const workout = WorkoutLibrary.phases[this.currentPhase].workouts[workoutId];
        if (!workout) return;

        this.currentWorkout = workout;
        window.location.href = `workout.html?id=${workoutId}`;
    }

    async startWorkout(workoutId) {
        window.location.href = `workout.html?id=${workoutId}`;
    }

    showProgress() {
        window.location.href = 'progress.html';
    }

    handleNavigation() {
        // Handle browser back/forward navigation
        const path = window.location.pathname;
        if (path.endsWith('index.html') || path === '/') {
            this.initializeUI();
        }
    }
}

// Initialize the app
const app = new WorkoutApp();
document.addEventListener('DOMContentLoaded', () => app.init());

// Export for use in other modules
export default app;
