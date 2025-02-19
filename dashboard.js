const Dashboard = {
    currentUser: null,
    currentPhase: null,
    workoutLibrary: null,

    async init() {
        console.log('Dashboard initializing...');
        await this.loadInitialData();
        this.setupEventListeners();
        this.updateUI();
        this.startAutoRefresh();
        console.log('Dashboard initialized for user:', this.currentUser);
    },
async init() {
    try {
        console.log('Dashboard initializing...');
        await this.loadInitialData();
        this.setupEventListeners();
        this.updateUI();
        this.startAutoRefresh();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}
    async loadInitialData() {
        this.currentUser = await DataManager.getCurrentUser();
        this.currentPhase = WorkoutLibrary.getCurrentPhase();
        this.updateCurrentDate();
        console.log('Initial data loaded:', { user: this.currentUser, phase: this.currentPhase });
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        
        // Set up event listeners for other interactive elements
        document.getElementById('viewProgressBtn').addEventListener('click', () => this.viewProgress());
        document.getElementById('startWorkoutBtn').addEventListener('click', () => this.startWorkout());
        
        console.log('Event listeners set up');
            const dadButton = document.getElementBntById('dadButton');
    const alexButton = document.getElementById('alexButton');
    
    if (dadButton) dadButton.addEventListener('click', () => this.switchUser('Dad'));
    if (alexButton) alexButton.addEventListener('click', () => this.ss.switchUser('Alex'));

    },

    async switchUser(user) {
        console.log('Switching user to:', user);
        this.currentUser = user;
        await DataManager.setCurrentUser(user);
        this.updateUserButtons();
        await this.updateUI();
        console.log('User switched successfully');
    },

    updateUserButtons() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        
        dadButton.classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        dadButton.classList.toggle('text-white', this.currentUser === 'Dad');
        alexButton.classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        alexButton.classList.toggle('text-white', this.currentUser === 'Alex');
        
        console.log('User buttons updated for:', this.currentUser);
    },

async updateUI() {
    if (!this.currentUser) return;
        console.log('Updating UI for user:', this.currentUser);
        this.updateUserButtons();
        await this.updateTodayWorkout();
        await this.updateWeeklyOverview();
        await this.updateProgressCards();
        this.updatePhaseProgress();
        console.log('UI update completed');
    },

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options =s = { weekday: 'short', month: 'short', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    async updateTodayWorkout() {
        const workoutPreview = document.getElementById('workoutPreview');
        const startButton = document.getElementById('startWorkoutBtn');
        
        const suggestedWorkout = WorkoutLibrary.getSuggestedWorkoutForDay(new Date().getDay());
        
        if (suggestedWorkout) {
            workoutPreview.innerHTML = `
                <h3 class="text-lg font-bold mb-2">${suggestedWorkout.name}</h3>
                <ul class="list-disc pl-5">
                    ${suggestedWorkout.exercises.map(ex => `<li>${ex.name}</li>`).join('')}
                </ul>
            `;
            startButton.disabled = false;
            startButton.textContent = 'Start Workout';
        } else {
            workoutPreview.innerHTML = '<p class="text-gray-500">Rest day. Focus on recovery!</p>';
            startButton.disabled = true;
            startButton.textContent = 'Rest Day';
        }
    },

    async updateWeeklyOverview() {
        const dotsContainer = document.getElementById('weeklyDots');
        const today = new Date().getDay();
        const workouts = await DataManager.getWeeklyWorkouts(this.currentUser);
        
        dotsContainer.innerHTML = Array(7).fill().map((_, i) => {
            const isWorkoutDay = WorkoutLibrary.isWorkoutDay(i);
            const isComplete = workouts.some(w => new Date(w.date).getDay() === i);
            const isToday = i === today;
            
            return `
                <div class="w-6 h-6 rounded-full ${this.getDotClass(isWorkoutDay, isComplete, isToday)}"></div>
            `;
        }).join('');
    },

    getDotClass(isWorkoutDay, isComplete, isToday) {
        if (!isWorkoutDay) return 'bg-gray-200';
        if (isComplete) return 'bg-green-500';
        if (isToday) return 'bg-blue-500';
        return 'bg-gray-300';
    },

    async updateProgressCards() {
        await this.updateKeyLifts();
        await this.updateRecentImprovements();
        await this.updateNextTargets();
    },

    async updateKeyLifts() {
        const container = document.getElementById('keyLifts');
        const progress = await DataManager.getProgress(this.currentUser);
        
        if (!progress) return;

        const keyLifts = Object.entries(progress)
            .filter(([_, data]) => data.history?.length > 0)
            .map(([exercise, data]) => {
                const latest = data.history[data.history.length - 1];
                const bestSet = this.findBestSet(latest.sets);
                return { exercise, weight: bestSet.weight, reps: bestSet.reps };
            });

        container.innerHTML = keyLifts.map(lift => `
            <div class="flex justify-between items-center">
                <span class="text-sm">${lift.exercise}</span>
                <span class="text-sm font-medium">${lift.weight}lb × ${lift.reps}</span>
            </div>
        `).join('');
    },

    async updateRecentImprovements() {
        // Implementation for recent improvements
    },

    async updateNextTargets() {
        // Implementation for next targets
    },

    updatePhaseProgress() {
        const container = document.getElementById('phaseProgress');
        const phase = WorkoutLibrary.phases[this.currentPhase];
        const start = new Date(phase.startDate);
        const end = new Date(phase.endDate);
        const today = new Date();
        
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const daysComplete = (today - start) / (1000 * 60 * 60 * 24);
        const progress = Math.min(Math.max((daysComplete / totalDays) * 100, 0), 100);
        
        container.innerHTML = `
            <div class="mb-2">
                <span class="text-sm">Phase ${this.currentPhase === 'phase1' ? '1' : '2'}</span>
                <span class="text-xs text-gray-500 ml-2">Week ${Math.ceil(daysComplete / 7)} of 12</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500" style="width: ${progress}%"></div>
            </div>
        `;
    },

    findBestSet(sets) {
        return sets.reduce((best, current) => {
            if (!best || current.weight > best.weight) return current;
            if (current.weight === best.weight && current.reps > best.reps) return current;
            return best;
        });
    },

    startWorkout() {
        const workout = WorkoutLibrary.getSuggestedWorkoutForDay(new Date().getDay());
        if (workout) {
            window.location.href = `workout.html?id=${workout.id}`;
        }
    },

    viewProgress() {
        window.location.href = 'progress.html';
    },

    startAutoRefresh() {
        setInterval(() => {
            this.updateCurrentDate();
            this.updateWeeklyOverview();
        }, 60000); // Refresh every minute
    },

    handleDataChange(detail) {
        console.log('Data change detected:', detail);
        if (detail.type === 'workouts' || detail.type === 'progress' || detail.type === 'user') {
            this.updateUI();
        }
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Dashboard');
    Dashboard.init();
});

export default Dashboard;
