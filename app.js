// app.js
const WorkoutTracker = {
    currentUser: 'Dad',
    users: ['Dad', 'Alex'],
    
    workoutDays: {
        monday: {
            name: 'Chest & Triceps',
            exercises: [
                {
                    name: 'Hydrow',
                    type: 'cardio',
                    sets: 1,
                    metrics: ['time', 'level']
                },
                {
                    name: 'Bench Press',
                    type: 'strength',
                    sets: 4,
                    repRange: '8-12',
                    metrics: ['weight', 'reps']
                },
                // Add more exercises
            ]
        },
        wednesday: {
            name: 'Shoulders & Traps',
            exercises: [
                // Add exercises
            ]
        },
        friday: {
            name: 'Back & Biceps',
            exercises: [
                // Add exercises
            ]
        }
    },

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateUI();
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexBexButton').addEventListener('click', () => this.switchUser('Alex'));
    },

    switchUser(user) {
        this.currentUser = user;
        this.updateUI();
        // Update button styles
        document.getElementById('dadButton').classList.toggle('bg-blue-500', user === 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-blue-500', user === 'Alex');
    },

    saveWorkout(day, data) {
        const key = `workout_${this.currentUser}_${day}_${new Date().toLocaleDateString()}`;
        localStorage.setItem(key, JSON.stringify(data));
        this.updateProgress(day, data);
    },

    loadWorkout(day) {
        const key = `workout_${this.currentUser}_${day}_${new Date().toLocaleDateString()}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },

    updateProgress(day, data) {
        const progressKey = `progress_${this.currentUser}`;
        let progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
        
        if (!progress[day]) {
            progress[day] = [];
        }
        
        progress[day].push({
            date: new Date().toISOString(),
            data: data
        });

        localStorage.setItem(progressKey, JSON.stringify(progress));
        this.updateUI();
    },

    getProgress() {
        const progressKey = `progress_${this.currentUser}`;
        return JSON.parse(localStorage.getItem(progressKey) || '{}');
    },

    updateUI() {
        const progress = this.getProgress();
        const progressDiv = document.getElementById('progressSummary');
        if (progressDiv) {
            // Show latest achievements
            let html = '<ul class="list-disc pl-4">';
            for (const [day, workouts] of Object.entries(progress)) {
                const latest = workouts[workouts.length - 1];
                if (latest) {
                    html += `<li>${day}: Last workout ${new Date(latest.date).toLocaleDateString()}</li>`;
                }
            }
            html += '</ul>';
            progressDiv.innerHTML = html;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => WorkoutTracker.init());
