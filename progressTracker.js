// progressTracker.js - Handles progress tracking, analysis, and visualization
const currentUser = localStorage.getItem('currentUser') || 'Dad';
console.log('Current User:', currentUser);

const ProgressTracker = {
    currentUser: null,
    charts: {},

    init() {
        this.currentUser = localStorage.getItem('currentUser') || 'Dad';
        this.setupEventListeners();
        this.loadProgress();
    },

    setupEventListeners() {
        // User switching
        document.getElementById('dadButton')?.addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById(Id('alexButton')?.addEventListener('click', () => this.switchUser('Alex'));

        // Time range filtering
        document.getElementById('timeRange')?.addEventListener('change', (e) => {
            this.updateCharts(e.target.value);
        });

        // Exercise filtering
        document.getElementById('exerciseSelect')?.addEventListener('change', (e) => {
            this.updateExerciseDetail(e.target.value);
        });
    },

    async loadProgress() {
        try {
            const progress = await DataManager.getProgress(this.currentUser);
            this.updateUI(progress);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    },

    updateUI(progress) {
        this.updateSummaryStats(progress);
        this.updatePersonalBests(progress);
        this.updateRecentImprovements(progress);
        this.initializeCharts(progress);
    },

    updateSummaryStats(progress) {
        const statsContainer = document.getElementById('summaryStats');
        if (!statsContainer) return;

        const stats = this.calculateSummaryStats(progress);
        statsContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="stat-card">
                    <h3 class="text-sm font-bold">Key Lifts</h3>
                    ${this.formatKeyLifts(stats.keyLifts)}
                </div>
                <div class="stat-card">
                    <h3 class="text-sm font-bold">Recent Progress</h3>
                    ${this.formatRecentProgress(stats.recentProgress)}
                </div>
            </div>
        `;
    },

    calculateSummaryStats(progress) {
        const stats = {
            keyLifts: {},
            recentProgress: {}
        };

        // Calculate key lift stats
        Object.entries(progress).forEach(([exercise, data]) => {
            if (data.history && data.history.length > 0) {
                const recent = data.history.slice(-1)[0];
                const previous = data.history.slice(-2)[0];

                stats.keyLifts[exercise] = {
                    current: this.findBestSet(recent.sets),
                    best: data.personalBest
                };

                if (previous) {
                    const currentBest = this.findBestSet(recent.sets);
                    const previousBest = this.findBestSet(previous.sets);
                    stats.recentProgress[exercise] = {
                        weightChange: currentBest.weight - previousBest.weight,
                        repsChange: currentBest.reps - previousBest.reps
                    };
                }
            }
        });

        return stats;
    },

    findBestSet(sets) {
        return sets.reduce((best, current) => {
            if (!best || current.weight > best.weight) return current;
            if (current.weight === best.weight && current.reps > best.reps) return current;
            return best;
        });
    },

    formatKeyLifts(keyLifts) {
        return Object.entries(keyLifts)
            .map(([exercise, data]) => `
                <div class="text-xs mb-1">
                    <span class="font-medium">${exercise}:</span>
                    ${data.current.weight}lb × ${data.current.reps}
                </div>
            `).join('');
    },

    formatRecentProgress(recentProgress) {
        return Object.entries(recentProgress)
            .map(([exercise, change]) => `
                <div class="text-xs mb-1">
                    <span class="font-medium">${exercise}:</span>
                    ${change.weightChange >= 0 ? '+' : ''}${change.weightChange}lb
                </div>
            `).join('');
    },

    initializeCharts(progress) {
        this.initializeStrengthChart(progress);
        this.initializeVolumeChart(progress);
    },

    initializeStrengthChart(progress) {
        const ctx = document.getElementById('strengthChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.strength) {
            this.charts.strength.destroy();
        }

        const datasets = this.prepareStrengthDatasets(progress);

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
                    }
                }
            }
        });
    },

    prepareStrengthDatasets(progress) {
        return Object.entries(progress)
            .filter(([_, data]) => data.history?.length > 0)
            .map(([exercise, data]) => ({
                label: exercise,
                data: data.history.map(entry => 
                    Math.max(...entry.sets.map(set => set.weight || 0))
                ),
                fill: false,
                borderColor: this.getRandomColor(),
                tension: 0.1
            }));
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

    updateExerciseDetail(exerciseName) {
        const container = document.getElementById('exerciseDetail');
        if (!container) return;

        DataManager.getProgress(this.currentUser, exerciseName)
            .then(data => {
                if (!data) return;

                const personalBest = data.personalBest;
                const recentWorkout = data.history[data.history.length - 1];

                container.innerHTML = `
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <h3 class="font-bold mb-2">${exerciseName}</h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 class="text-sm font-semibold">Personal Best</h4>
                                <p class="text-sm">
                                    ${personalBest.weight}lb × ${personalBest.reps}
                                    <span class="text-xs text-gray-500">
                                        (${new Date(personalBest.date).toLocaleDateString()})
                                    </span>
                                </p>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold">Last Workout</h4>
                                <p class="text-sm">
                                    ${this.formatSets(recentWorkout.sets)}
                                    <span class="text-xs text-gray-500">
                                        (${new Date(recentWorkout.date).toLocaleDateString()})
                                    </span>
                                </p>
                            </div>
                        </div>

                        <canvas id="exerciseChart"></canvas>
                    </div>
                `;

                this.initializeExerciseChart(exerciseName, data.history);
            });
    },

    initializeExerciseChart(exerciseName, history) {
        const ctx = document.getElementById('exerciseChart')?.getContext('2d');
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

    formatSets(sets) {
        return sets.map(set => `${set.weight}×${set.reps}`).join(', ');
    },

    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    },

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        this.loadProgress();
    }
};

// Initialize the progress tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => ProgressTracker.init());

export default ProgressTracker;
