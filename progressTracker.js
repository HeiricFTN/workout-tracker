const ProgressTracker = {
    currentUser: null,
    charts: {},
    selectedTimeRange: '1',
    selectedExercise: null,

    async init() {
        console.log('Initializing ProgressTracker...');
        try {
            this.currentUser = await DataManager.getCurrentUser();
            this.setupEventListeners();
            await this.loadInitialData();
            this.hideLoading();
            console.log('ProgressTracker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ProgressTracker:', error);
            this.showError('Failed to load progress data');
        }
    },

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    showError(message) {
        // TODO: Implement error display
        console.error(message);
    },

    setupEventListeners() {
        // User switching
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));

        // Time range selection
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.selectedTimeRange = e.target.value;
            this.updateCharts();
        });

        // Exercise selection
        document.getElementById('exerciseSelect').addEventListener('change', (e) => {
            this.selectedExercise = e.target.value;
            this.updateExerciseDetail();
        });

        // Export button
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());

        // Handle data changes
        window.addEventListener('dataChanged', (e) => this.handleDataChange(e.detail));
    },

    async loadInitialData() {
        this.showLoading();
        try {
            await this.updateUserButtons();
            await this.populateExerciseSelect();
            await this.updateCharts();
            await this.updatePersonalBests();
            await this.updateRecentActivity();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data');
        }
        this.hideLoading();
    },

    async switchUser(user) {
        console.log('Switching to user:', user);
        this.showLoading();
        try {
            this.currentUser = user;
            await DataManager.setCurrentUser(user);
            await this.updateUserButtons();
            await this.loadInitialData();
        } catch (error) {
            console.error('Error switching user:', error);
            this.showError('Failed to switch user');
        }
        this.hideLoading();
    },

    updateUserButtons() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        
        dadButton.classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        dadButton.classList.toggle('text-white', this.currentUser === 'Dad');
        alexButton.classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        alexButton.classList.toggle('text-white', this.currentUser === 'Alex');
    },

    async populateExerciseSelect() {
        const select = document.getElementById('exerciseSelect');
        const progress = await DataManager.getProgress(this.currentUser);
        const exercises = Object.keys(progress || {});

        select.in.innerHTML = exercises.map(exercise => 
            `<option value="${exercise}">${exercise}</option>`
        ).join('');

        if (exercises.length > 0) {
            this.selectedExercise = exercises[0];
            await this.updateExerciseDetail();
        }
    },

    async updateCharts() {
        this.showLoading();
        try {
            const progress = await DataManager.getProgress(this.currenrentUser);
            this.updateStrengthChart(progress);
        } catch (error) {
            console.error('Error updating charts:', error);
            this.showError('Failed to update charts');
        }
        this.hideLoading();
    },

    updateStrengthChart(progress) {
        const ctx = document.getElementById('strengthChart');
        if (!ctx) return;

        if (this.charts.strength) {
               this.charts.strength.destroy();
        }

        const datasets = this.prepareChartData(progress);
        
        this.charts.strength = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(progress),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: { size: 10 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Weight (lbs)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    },

    prepareChartData(progress) {
        return Object.entries(progress)
            .filter(([_, data]) => data.history?.length > 0)
            .map(([exercise, data]) => ({
                label: exercise,
                data: this.filterDataByTimeRange(data.history).map(entry => 
                    Math.max(...entry.sets.map(set => set.weight || 0))
                ),
                borderColor: this.getRandomColor(),
                tension: 0.1,
                fill: false
            }));
    },

    filterDataByTimeRange(history) {
        if (this.selectedTimeRange === 'all') return history;

        const months = parseInt(this.selectedTimeRange);
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - months);

        return history.filter(entry => new Date(entry.date) >= cutoff);
    },

    generateDateLabels(progress) {
        const allDates = Object.values(progress)
            .flatMap(data => data.history || [])
            .map(entry => new Date(entry.date))
            .sort((a, b) => a - b);

        return [...new Set(allDates)].map(date => 
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
    },

    async updatePersonalBests() {
        const container = document.getElementById('personalBests');
        const progress = await DataManager.getProgress(this.currentUser);

        if (!progress || Object.keys(progress).length === 0) {
            container.innerHTML = '<p class="text-gray-500">No personal bests recorded yet</p>';
            return;
        }

        const bests = Object.entries(progress)
            .map(([exercise, data]) => ({
                exercise,
                ...data.personalBest
            }))
            .filter(best => best.weight > 0);

        container.innerHTML = bests.map(best => `
            <div class="flex justify-between items-center">
                <span class="text-sm">${best.exercise}</span>
                <span class="text-sm font-medium">
                    ${best.weight}lb × ${best.reps}
                    <span class="text-xs text-gray-500 ml-2">
                        (${new Date(best.date).toLocaleDateString()})
                    </span>
                </span>
            </div>
        `).join('');
    },

    async updateExerciseDetail() {
        if (!this.selectedExercise) return;

        const container = document.getElementById('exerciseDetail');
        const progress = await DataManager.getProgress(this.currentUser);
        const exerciseData = progress[this.selectedExercise];

        if (!exerciseData || !exerciseData.history.length) {
            container.innerHTML = '<p class="text-gray-500">No data available for this exercise</p>';
            return;
        }

        const history = this.filterDataByTimeRange(exerciseData.history);
        const recentWorkout = history[history.length - 1];
        const personalBest = exerciseData.personalBest;

        container.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-bold mb-1">Personal Best</h3>
                        <p class="text-sm">
                            ${personalBest.weight}lb × ${personalBest.reps}
                            <span class="text-xs text-gray-500 block">
                                ${new Date(personalBest.date).toLocaleDateString()}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold mb-1">Latest</h3>
                        <p class="text-sm">
                            ${this.formatSets(recentWorkout.sets)}
                            <span class="text-xs text-gray-500 block">
                                ${new Date(recentWorkout.date).toLocaleDateString()}
                            </span>
                        </p>
                    </div>
                </div>
                <canvas id="exerciseDetailChart"></canvas>
            </div>
        `;

        this.updateExerciseChart(history);
    },

    updateExerciseChart(history) {
        const ctx = document.getElementById('exerciseDetailChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(entry => 
                    new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                    label: 'Max Weight',
                    data: history.map(entry => Math.max(...entry.sets.map(set => set.weight || 0))),
                    borderColor: this.getRandomColor(),
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    },

    async updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        const workouts = await DataManager.getWorkouts(this.currentUser, { limit: 5 });

        if (!workouts || workouts.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No recent activity</p>';
            return;
        }

        container.innerHTML = workouts.map(workout => `
            <div class="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">
                        ${new Date(workout.date).toLocaleDateString()}
                    </span>
                    <span class="text-xs text-gray-500">
                        ${Object.keys(workout.exercises).length} exercises
                    </span>
                </div>
            </div>
        `).join('');
    },

    formatSets(sets) {
        return sets.map(set => `${set.weight}×${set.reps}`).join(', ');
    },

    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    },

    async exportData() {
        try {
            const data = await DataManager.getProgress(this.currentUser);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workout-progress-${this.currentUser}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data');
        }
    },

    handleDataChange(detail) {
        if (detail.type === 'workouts' || detail.type === 'progress') {
            this.loadInitialData();
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => ProgressTracker.init());

export default ProgressTracker;
