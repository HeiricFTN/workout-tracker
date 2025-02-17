const Dashboard = {
    currentUser: 'Dad',
    workoutDays: {
        1: { name: 'monday', title: 'Chest & Triceps' },
        3: { name: 'wednesday', title: 'Shoulders & Traps' },
        5: { name: 'friday', title: 'Back & Biceps' }
    },

    progressCharts: {
        weight: null,
        volume: null
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
        this.loadWorkoutSummaries();
        this.initCharts();
        // Initialize with Monday's data
        this.updateCharts('monday');
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
        this.loadWorkoutSummaries();
        this.updateCharts('monday'); // Refresh charts for new user
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
                        class="w-full py-2 bg-green-500 text-white rounded">
                    Start Today's Workout
                </button>
            `;
        } else {
            todayDiv.textContent = 'Rest Day';
            quickStartDiv.innerHTML = `
                <button class="w-full py-2 bg-gray-300 text-gray-700 rounded" disabled>
                    Rest & Recover
                </button>
            `;
        }
    },

    loadWorkoutSummaries() {
        ['monday', 'wednesday', 'friday'].forEach(day => {
            const key = `${day}_${this.currentUser}`;
            const workouts ts = JSON.parse(localStorage.getItem(key) || '[]');
            const lastWorkout = workouts[workouts.length - 1];
            
            const summaryDiv = document.getElementById(`${day}Summary`);
            if (lastWorkout) {
                summaryDiv.innerHTML = `
                    <p>Last: ${new Date(lastWorkout.date).toLocaleDateString()}</p>
                    <p class="text-gray-500">Completed ${workouts.length} workouts</p>
                `;
            } else {
                summaryDiv.innerHTML = '<p class="text-gray-500">No workouts yet</p>';
            }
        });
    },

    initCharts() {
        this.createWeightChart();
        this.createVolumeChart();
    },

    setupProgressTabs() {
        document.querySelectorAll('.progress-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab styling
                document.querySelectorAll('.progress-tab').forEach(t => {
                    t.classList.replace('bg-blue-500', 'bg-gray-200');
                    t.classList.remove('text-white');
                });
                tab.classList.replace('bg-gray-200', 'bg-blue-500');
                tab.classList.add('text-white');

                // Update charts
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
                    title: {
                        display: true,
                        text: 'Weight Progress (lbs)'
                    }
                }
            }
        });
    },

    createVolumeChart() {
        const ctx = document.getElementById('volumeProgressChart').getContext('2d');
        this.progressCharts.volume = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Total Volume (lbs × reps)'
                    }
                }
            }
        });
    },

    updateCharts(day) {
        const workouts = this.getWorkouts(day);
        const exercises = this.keyExercises[day];
        
        // Prepare data for weight progress
        const labels = workouts.map(w => new Date(w.date).toLocaleDateString());
        const weightDatasets = exercises.map(exercise => ({
            label: exercise,
            data: workouts.map(w => {
                const exerciseData = w.exercises[exercise];
                if (!exerciseData) return null;
                // Get max weight from sets
                return Math.max(...exerciseData.sets.map(s => s.weight));
            }),
            fill: false,
            borderColor: this.getRandomColor()
        }));

        // Update weight chart
        this.progressCharts.weight.data.labels = labels;
        this.progressCharts.weight.data.datasets = weightDatasets;
        this.progressCharts.weight.update();

        // Prepare data for volume progress
        const volumeDatasets = exercises.map(exercise => ({
            label: exercise,
            data: workouts.map(w => {
                const exerciseData = w.exercises[exercise];
                if (!exerciseData) return null;
                // Calculate total volume (weight × reps for all sets)
                return exerciseData.sets.reduce((total, set) => 
                    total + (set.weight * set.reps), 0);
            }),
            backgroundColor: this.getRandomColor(0.5)
        }));

        // Update volume chart
        this.progressCharts.volume.data.labels = labels;
        this.progressCharts.volume.data.datasets = volumeDatasets;
        this.progressCharts.volume.update();

        // Update personal bests
        this.updatePersonalBests(workouts, exercises);
    },

    getWorkouts(day) {
        const key = `${day}_${this.currentUser}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
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

            personalBestsHtml += `
                <p>${exercise}: ${maxWeight}lbs</p>
            `;

            recentProgressHtml += `
                <p>${exercise}: ${change >= 0 ? '+' : ''}${change}lbs</p>
            `;
        });

        personalBestsDiv.innerHTML = personalBestsHtml;
        recentProgressDiv.innerHTML = recentProgressHtml;
    },

    getRandomColor(alpha = 1) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
