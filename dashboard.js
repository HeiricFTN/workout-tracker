const Dashboard = {
    currentUser: 'Dad',
    
    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateTodayWorkout();
        this.loadWorkoutSummaries();
        this.initCharts();
        this.updateCharts('monday');
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
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

        // Update data displays
        this.loadWorkoutSummaries();
        this.updateCharts('monday');
    },

    loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.switchUser(savedUser);
        }
    }
    workoutDays: {
        1: { name: 'monday', title: 'Chest & Triceps' },
        3: { name: 'wednesday', title: 'Shoulders & Traps' },
        5: { name: 'friday', title: 'Back & Biceps' }
    },

    progressCharts: {
        weight: null
    },

    keyExercises: {
        monday: ['Bench Press', 'Incline DB Press'],
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
        this.updateRecentActivity();
        this.updateCharts('monday');
    },

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        this.setupProgressTabs();
    },

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        document.getElementById('dadButton').classList.toggle('bg-blue-500', user === 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-blue-500', user === 'Alex');
        document.getElementById('dadButton').classList.toggle('text-white', user === 'Dad');
        document.getElementById('alexButton').classList.toggle('text-white', user === 'Alex');
        document.getElementById('dadButton').classList.toggle('bg-gray-200', user !== 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-gray-200', user !== 'Alex');
        this.loadWorkoutSummaries();
        this.updateCharts('monday');
        this.updateRecentActivity();
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
        const days = ['monday', 'wednesday', 'friday'];
        days.forEach(day => {
            const workouts = this.getWorkouts(day);
            const lastWorkout = workouts[workouts.length - 1];
            if (lastWorkout) {
                const date = new Date(lastWorkout.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                document.getElementById(`${day}Summary`).textContent = `Last: ${date}`;
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
    const ctx = document.getElementById('weightProgressChart').getContext('2d');
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
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    bodyFont: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}


    updateCharts(day) {
        const workouts = this.getWorkouts(day);
        const exercises = this.keyExercises[day];
        
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
    },

    updatePersonalBests(workouts, exercises) {
        const personalBestsDiv = document.getElementById('personalBests');
        const recentProgressDiv = document.getElementById('recentProgress');
        
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
    },

    updateRecentActivity() {
        const recentActivityDiv = document.getElementById('recentActivity');
        const allWorkouts = ['monday', 'wednesday', 'friday']
            .flatMap(day => this.getWorkouts(day).map(workout => ({
                ...workout,
                day: day
            })))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        if (allWorkouts.length === 0) {
            recentActivityDiv.innerHTML = '<div class="text-gray-500">No workouts recorded yet</div>';
            return;
        }

        recentActivityDiv.innerHTML = allWorkouts.map(workout => `
            <div class="mb-2 pb-2 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <span class="font-medium capitalize">${workout.day}</span>
                    <span class="text-xs text-gray-500">
                        ${new Date(workout.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>
        `).join('');
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
