const ProgressTracker = {
    currentUser: 'Dad',
    timeRange: 1, // Default to 1 month
    exercises: [],

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadExercises();
        this.updateUI();
    },

    loadUserData() {
        const savedUser = localStorage.getItem('currentUntUser');
        if (savedUser) {
            this.currentUser = savedUser;
            thishis.updateUserButtons();
        }
    },

    setupEventListeners() {
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        document.getElementById('timeRangeSelector').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            this.updateUI();
        });
        document.getElementById('exerciseSelector').addEventListener('change', (e) => {
            this.updateExerciseDetails(e.target.value);
        });
        document.getElementById('addGoalBtn').addEventListener('click', () => this.addNewGoal());
    },

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        this.updateUserButtons();
        this.updateUI();
    },

    updateUserButtons() {
        document.getElementById('dadButton').classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        document.getElementById('dadButton').classList.toggle('text-white', this.currentUser === 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        document.getElementById('alexButton').classList.toggle('text-white', this.currentUser === 'Alex');
    },

    loadExercises() {
        // Combine exercises from all workout days
        const mondayExercises = JSON.parse(localStorage.getItem('monday_exercises') || '[]');
        const wednesdayExercises = JSON.parse(localStorage.getItem('wednesday_exercises') || '[]');
        const fridayExercises = JSON.parse(localStorage.getItem('friday_exercises') || '[]');
        this.exercises = [...mondayExercises, ...wednesdayExercises, ...fridayExercises];

        const exerciseSelector = document.getElementById('exerciseSelector');
        exerciseSelector.innerHTML = this.exercises.map(exercise => 
            `<option value="${exercise.name}">${exercise.name}</option>`
        ).join('');
    },

    updateUI() {
        this.updateOverview();
        this.updateStrengthProgressChart();
        this.updateVolumeProgressChart();
        this.updatePersonalBests();
        this.updateGoals();
        this.updateExerciseDetails(document.getElementById('exerciseSelector').value);
    },

    updateOverview() {
        const workouts = this.getAllWorkouts();
        document.getElementById('workoutsCompleted').textContent = workouts.length;
        
        const totalVolume = workouts.reduce((total, workout) => {
            return total + this.calculateWorkoutVolume(workout);
        }, 0);
        document.getElementById('totalVolume').textContent = `${totalVolume} lbs`;
    },

    updateStrengthProgressChart() {
        const ctx = document.getElementById('strengthProgressChart').getContext('2d');
        const data = this.getStrengthProgressData();
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (lbs)'
                        }
                    }
                }
            }
        });
    },

    updateVolumeProgressChart() {
        const ctx = document.getElementById('volumeProgressChart').getContext('2d');
        const data = this.getVolumeProgressData();
        
        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume (lbs)'
                        }
                    }
                }
            }
        });
    },

    updatePersonalBests() {
        const personalBests = this.getPersonalBests();
        const personalBestsList = document.getElementById('personalBestsList');
        personalBestsList.innerHTML = Object.entries(personalBests).map(([exercise, best]) => 
            `<div>
                <strong>${exercise}:</strong> ${best.weight} lbs x ${best.reps} reps
                <span class="text-sm text-gray-500">(${new Date(best.date).toLocaleDateString()})</span>
            </div>`
        ).join('');
    },

    updateGoals() {
        const goals = this.getGoals();
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = goals.map(goal => 
            `<div class="flex justify-between items-center">
                <span>${goal.description}</span>
                <button class="px-2 py-1 bg-red-500 text-white rounded text-sm" 
                        onclick="ProgressTracker.removeGoal('${goal.id}')">Remove</button>
            </div>`
        ).join('');
    },

    updateExerciseDetails(exerciseName) {
        const exerciseData = this.getExerciseData(exerciseName);
        const detailsContainer = document.getElementById('exerciseDetails');
        
        if (exerciseData.length === 0) {
            detailsContainer.innerHTML = '<p>No data available for this exercise.</p>';
            return;
        }

        const lastWorkout = exerciseData[exerciseData.length - 1];
        const bestSet = this.getBestSet(exerciseData);

        detailsContainer.innerHTML = `
            <div class="mb-4">
                <h3 class="font-semibold">Last Workout (${new Date(lastWorkout.date).toLocaleDateString()})</h3>
                <p>${this.formatSets(lastWorkout.sets)}</p>
            </div>
            <div class="mb-4">
                <h3 class="font-semibold">Personal Best</h3>
                <p>${bestSet.weight} lbs x ${bestSet.reps} reps (${new Date(bestSet.date).toLocaleDateString()})</p>
            </div>
            <div>
                <h3 class="font-semibold">Progress Chart</h3>
                <canvas id="exerciseProgressChart"></canvas>
            </div>
        `;

        this.renderExerciseProgressChart(exerciseName, exerciseData);
    },

    renderExerciseProgressChart(exerciseName, data) {
        const ctx = document.getElementById('exerciseProgressChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'Max Weight',
                    data: data.map(d => Math.max(...d.sets.map(set => set.weight))),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (lbs)'
                        }
                    }
                }
            }
        });
    },

    getAllWorkouts() {
        const mondayWorkouts = JSON.parse(localStorage.getItem(`monday_${this.currentUser}`) || '[]');
        const wednesdayWorkouts = JSON.parse(localStorage.getItem(`wednesday_${this.currentUser}`) || '[]');
        const fridayWorkouts = JSON.parse(localStorage.getItem(`friday_${this.currentUser}`) || '[]');
        return [...mondayWorkouts, ...wednesdayWorkouts, ...fridayWorkouts]
            .filter(workout => this.isWithinTimeRange(workout.date))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    isWithinTimeRange(date) {
        const workoutDate = new Date(date);
        const now = new Date();
        const monthsAgo = new Date(now.setMonth(now.getMonth() - this.timeRange));
        return workoutDate >= monthsAgo;
    },

    calculateWorkoutVolume(workout) {
        return Object.values(workout.exercises).reduce((total, exercise) => {
            return total + exercise.sets.reduce((exerciseTotal, set) => {
                return exerciseTotal + (set.weight || 0) * set.reps;
            }, 0);
        }, 0);
    },

    getStrengthProgressData() {
        const workouts = this.getAllWorkouts();
        const exercises = this.exercises.filter(e => !e.isBodyweight);

        return {
            labels: workouts.map(w => new Date(w.date).toLocaleDateString()),
            datasets: exercises.map(exercise => ({
                label: exercise.name,
                data: workouts.map(workout => {
                    const exerciseData = workout.exercises[exercise.name];
                    return exerciseData ? Math.max(...exerciseData.sets.map(set => set.weight)) : null;
                }),
                borderColor: this.getRandomColor(),
                fill: false
            }))
        };
    },

    getVolumeProgressData() {
        const workouts = this.getAllWorkouts();
        return {
            labels: workouts.map(w => new Date(w.date).toLocaleDateString()),
            datasets: [{
                label: 'Workout Volume',
                data: workouts.map(w => this.calculateWorkoutVolume(w)),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        };
    },

    getPersonalBests() {
        const workouts = this.getAllWorkouts();
        const personalBests = {};

        workouts.forEach(workout => {
            Object.entries(workout.exercises).forEach(([exerciseName, exerciseData]) => {
                exerciseData.sets.forEach(set => {
                    if (!personalBests[exerciseName] || 
                        set.weight > personalBests[exerciseName].weight ||
                        (set.weight === personalBests[exerciseName].weight && set.reps > personalBests[exerciseName].reps)) {
                        personalBests[exerciseName] = { ...set, date: workout.date };
                    }
                });
            });
        });

        return personalBests;
    },

    getGoals() {
        return JSON.parse(localStorage.getItem(`goals_${this.currentUser}`) || '[]');
    },

    addNewGoal() {
        const description = prompt("Enter new goal:");
        if (description) {
            const goals = this.getGoals();
            goals.push({ id: Date.now(), description });
            localStorage.setItem(`goals_${this.currentUser}`, JSON.stringify(goals));
            
            this.updateGoals();
        }
    },

    removeGoal(goalId) {
        const goals = this.getGoals().filter(goal => goal.id !== parseInt(goalId));
        localStorage.setItem(`goals_${this.currentUser}`, JSON.stringify(goals));
        this.updateGoals();
    },

    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    },

    formatSets(sets) {
        return sets.map((set, index) => 
            `Set ${index + 1}: ${set.weight || ''} ${set.weight ? 'lbs x ' : ''}${set.reps} reps`
        ).join(', ');
    }
};

document.addEventListener('DOMContentLoaded', () => ProgressTracker.init());
