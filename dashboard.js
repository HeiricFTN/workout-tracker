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

    async loadInitialData() {
        this.currentUser = await DataManager.getCurrentUser();
        this.currentPhase = WorkoutLibrary.getCurrentPhase();
        this.updateCurrentDate();
        console.log('Initial data loaded:', { user: this.currentUser, phase: this.currentPhase });
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        // ... other event listeners
        console.log('Event listeners set up');
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
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    updateUserButtons() {
        document.getElementById('dadButton').classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        document.getElementById('dadButton').classList.toggle('text-white', this.currentUser === 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        document.getElementById('alexButton').classList.toggle('text-white', this.currentUser === 'Alex');
    },

    async updateTodayWorkout() {
        const workoutPreview = document.getElementById('workoutPreview');
        const startButton = document.getElementById('startWorkoutBtn');
        
        const suggestedWorkout = this.getSuggestedWorkout();
        
        if (suggestedWorkout) {
            workoutPreview.innerHTML = `
                <div class="mb-3">
                    <h3 class="font-bold text-lg mb-2">${suggestedWorkout.name}</h3>
                    ${this.formatSupersets(suggestedWorkout.supersets)}
                </div>
            `;
            startButton.disabled = false;
            startButton.textContent = 'Start Workout';
        } else {
            workoutPreview.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500">Rest Day</p>
                    <p class="text-sm text-gray-400">Focus on recovery</p>
                </div>
            `;
            startButton.disabled = true;
            startButton.textContent = 'Rest Day';
        }
    },

    formatSupersets(supersets) {
        return supersets.map(superset => `
            <div class="mb-2">
                <div class="text-sm font-medium">Superset ${superset.name}</div>
                <div class="text-sm text-gray-600">
                    ${superset.exercises.map(ex => `• ${ex.name}`).join('<br>')}
                </div>
            </div>
        `).join('');
    },

    async updateWeeklyOverview() {
        const dotsContainer = document.getElementById('weeweeklyDots');
        const today = new Date().getDay();
        const workouts = await this.getThisWeeksWorkouts();
        
        dotsContainer.innerHTML = Array(7).fill(0).map((_, i) => {
            const isWorkoutDay = [1, 3, 5].includes(i);
            const isComplete = workouts.some(w => new Date(w.date).getDay() === i);
            const isToday = i === today;
            
            return `
                <div class="flex justify-center">
                    <div class="w-3 h-3 rounded-full ${this.getDotClass(isWorkoutDay, isComplete, isToday)}"></div>
                </div>
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
        const container = document.getElementById('recentImprovements');
        const progress = await DataManager.getProgress(this.currentUser);
        
        if (!progress) return;

        const improvements = Object.entries(progress)
            .filter(([_, data]) => data.history?.length >= 2)
            .map(([exercise, data]) => {
                const recent = data.history.slice(-1)[0];
                const previous = data.history.slice(-2)[0];
                const recentBest = this.findBestSet(recent.sets);
                const previousBest = this.findBestSet(previous.sets);
                const change = recentBest.weight - previousBest.weight;
                return { exercise, change };
            })
            .filter(imp => imp.change !== 0);

        container.innerHTML = improvements.map(imp => `
            <div class="flex justify-between items-center">
                <span class="text-sm">${imp.exercise}</span>
                <span class="text-sm font-medium ${imp.change > 0 ? 'text-green-500' : 'text-red-500'}">
                    ${imp.change > 0 ? '+' : ''}${imp.change}lb
                </span>
            </div>
        `).join('');
    },

    async updateNextTargets() {
        const container = document.getElementById('nextTargets');
        const progress = await DataManager.getProgress(this.currentUser);
        
        if (!progress) return;

        const targets = Object.entries(progress)
            .filter(([_, data]) => data.history?.length > 0)
            .map(([exercise, data]) => {
                const latest = data.history[data.history.length - 1];
                const bestSet = this.findBestSet(latest.sets);
                return {
                    exercise,
                    target: Math.ceil(bestSet.weight / 5) * 5 + 5 // Round up to next 5lb increment
                };
            });

        container.innerHTML = targets.map(target => `
            <div class="flex justify-between items-center">
                <span class="text-sm">${target.exercise}</span>
                <span class="text-sm font-medium">${target.target}lb</span>
            </div>
        `).join('');
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
                <div class="text-sm mb-1">Phase ${this.currentPhase === 'phase1' ? '1' : '2'}</div>
                <div class="text-xs text-gray-500">
                    ${Math.ceil(daysComplete / 7)} of 12 weeks complete
                </div>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" 
                     style="width: ${progress}%"></div>
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

    getSuggestedWorkout() {
        const today = new Date().getDay();
        return WorkoutLibrary.getSuggestedWorkoutForDay(today);
    },

    async getThisWeeksWorkouts() {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        return await DataManager.getWorkouts(this.currentUser, {
            startDate: startOfWeek,
            endDate: new Date()
        });
    },

    async switchUser(user) {
        this.currentUser = user;
        await DataManager.setCurrentUser(user);
        this.updateUI();
    },

    startWorkout() {
        const workout = this.getSuggestedWorkout();
        if (workout) {
            window.location.href = `workout.html?id=${workout.id}`;
        }
    },

    openSettings() {
        // Implement settings modal or navigation
        console.log('Settings clicked');
    },

    handleDataChange(detail) {
        console.log('Data change detected:', detail);
        if (detail.type === 'workouts' || detail.type === 'progress' || detail.type === 'user') {
            this.updateUI();
        }
    },

    startAutoRefresh() {
        // Update current date and weekly overview every minute
        setInterval(() => {
            this.updateCurrentDate();
            this.updateWeeklyOverview();
        }, 60000);
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Dashboard');
    Dashboard.init();
});

export default Dashboard;
