// dashboard.js
const Dashboard = {
    currentUser: 'Dad',
    workoutDays: {
        1: { name: 'monday', title: 'Chest & Triceps' },
        3: { name: 'wednesday', title: 'Shoulders & Traps' },
        5: { name: 'friday', title: 'Back & Biceps' }
    },

    progressCharts: {
        weight: null
    },

    keyExercises: {
        monday: ['DB Bench Press', 'Incline DB Press'],
        wednesday: ['Seated DB Press', 'Lateral Raises'],
        friday: ['Modified Pull-ups', 'Standing DB Curls']
    },

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateTodayWorkout();
        this.updateCurrentDate();
        this.loadWorkoutSummaries();
        this.initCharts();
        this.updateCharts('monday');
    },

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        this.setupProgressTabs();
    },

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        
        // Update button styles
        document.getElementById('dadButton').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('alexButton').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('dadButton').classList.add('bg-gray-200');
        document.getElementById('alexButton').classList.add('bg-gray-200');
        
        if (user === 'Dad') {
            document.getElementById('dadButton').classList.remove('bg-gray-200');
            document.getElementById('dadButton').classList.add('bg-blue-500', 'text-white');
        } else {
            document.getElementById('alexButton').classList.remove('bg-gray-200');
            document.getElementById('alexButton').classList.add('bg-blue-500', 'text-white');
        }

        this.loadWorkoutSummaries();
        this.updateCharts('monday');
    },

    loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.switchUser(savedUser);
        }
    },

    updateTodayWorkout() {
        const today = new Date().getDay();
           const todayDiv = document.getElementById('todayWorkout');
        const quickStartDiv = document.getElementById('quickStart');
        
        if (this.workoutDays[today]) {
            const workout = this.workoutDays[today];
            todayDiv.textContent = workout.title;
            quickStartDiv.innerHTML = `
                <button onclick="location.href='${workout.name}.html'" 
                        class="w-full py-2 bg-green-500 text-white rounded-lg shadow touch-target">
                    Start Workout
                </button>
            `;
        } else {
            todayDiv.textContent = 'Rest Day';
            quickStartDiv.innerHTML = `
                <button class="w-full py-2 bg-gray-200 text-gray-600 rounded-lg shadow touch-target" disabled>
                    Rest & Recover
                </button>
            `;
        }
    },

    loadWorkoutSummaries() {
        ['monday', 'wednesday', 'friday'].forEach(day => {
            const workouts = this.getWorkouts(day);
            const lastWorkout = workouts[workouts.length - 1];
            const summaryDiv = document.getElementById(`${day}Summary`);
            
            if (summaryDiv) {
                if (lastWorkout) {
                    const date = new Date(lastWorkout.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                    summaryDiv.innerHTML = `
                        <p>Last: ${date}</p>
                        <p class="text-gray-500">Completed ${workouts.length} workouts</p>
                    `;
                } else {
                    summaryDiv.innerHTML = '<p class="text-gray-500">No workouts yet</p>';
                }
            }
        });
    },

    initCharts() {
        this.createWeightChart();
    },

    setupProgressTabs() {
        document.querySelectorAll('.progress-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.progress-tab').forEach(t => {
                    t.classList.remove('bg-blue-500', 'text-white');
                    t.classList.add('bg-gray-200');
                });
                tab.classList.remove('bg-gray-200');
                tab.classList.add('bg-blue-500', 'text-white');
                this.updateCharts(tab.dataset.day);
            });
        });
    },

    createWeightChart() {
        const ctx = document.getElementById('weightProgressChart');
        if (ctx) {
            this.progressCharts.weight = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
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
                            beginAtZero: true,
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { 
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }
    },

    updateCharts(day) {
        const workouts = this.getWorkouts(day);
        const exercises = this.keyExercises[day];
        
        if (this.progressCharts.weight) {
            const labels = workouts.map(w => new Date(w.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }));

            const datasets = exercises.map(exercise => ({
                label: exercise,
                data: workouts.map(w => {
                    const exerciseData = w.exercises[exercise];
                    if (!exerciseData) return null;
                    return Math.max(...exerciseData.sets.map(s => s.weight));
                }),
                fill: false,
                borderColor: this.getRandomColor(),
                tension: 0.1
            }));

            this.progressCharts.weight.data.labels = labels;
            this.progressCharts.weight.data.datasets = datasets;
            this.progressCharts.weight.update();

            this.updatePersonalBests(workouts, exercises);
        }
    },

    updatePersonalBests(workouts, exercises) {
        const personalBestsDiv = document.getElementById('personalBests');
        const recentProgressDiv = document.getElementById('recentProgress');
        
        if (personalBestsDiv && recentProgressDiv) {
            let personalBestsHtml = '';
            let recentProgressHtml = '';

            exercises.forEach(exercise => {
                const maxWeight = Math.max(...workouts.flatMap(w => 
                    w.exercises[exercise]?.sets.map(s => s.weight) || [0]
                ));

                const recentWorkouts = workouts.slice(-2);
                const previousWeight = recentWorkouts[0]?.exercises[exercise]?.sets[0]?.weight || 0;
                const currentWeight = recentWorkouts[1]?.exercises[exercise]?.sets[0]?.weight || 0;
                const change = currentWeight - previousWeight;

                personalBestsHtml += `<div>${exercise}: ${maxWeight}lb</div>`;
                recentProgressHtml += `<div>${exercise}: ${change >= 0 ? '+' : ''}${change}lb</div>`;
            });

            personalBestsDiv.innerHTML = personalBestsHtml;
            recentProgressDiv.innerHTML = recentProgressHtml;
        }
    },

    getWorkouts(day) {
        const key = `${day}_${this.currentUser}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    getRandomColor(alpha = 1) {
        const hue = Math.floor(Math.random() * 360);
        return `hsla(${hue}, 70%, 50%, ${alpha})`;
    }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
