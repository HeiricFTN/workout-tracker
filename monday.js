// monday.js
const MondayWorkout = {
    exercises: [
        {
            name: 'Bench Press',
            description: 'Press dumbbells from chest to full extension',
            sets: 4,
            repRange: '8-12'
        },
        {
            name: 'Incline DB Press',
            description: 'Press on 30-45° incline',
            sets: 3,
            repRange: '8-12'
        },
        {
            name: 'Dips',
            description: 'Body weight, lean forward slightly',
            sets: 3,
            repRange: 'Max Reps'
        },
        {
            name: 'TRX Tricep Extensions',
            description: 'Face anchor, extend arms down',
            sets: 3,
            repRange: '12-15'
        },
        {
            name: 'Diamond Push-ups',
            description: 'Hands together, elbows tight',
            sets: 2,
            repRange: 'Max Reps'
        }
    ],

    init() {
        this.currentUser = localStorage.getItem('currentUser') || 'Dad';
        this.displayUser();
        this.renderExercises();
        this.loadLastWorkout();
        this.setupEventListeners();
    },

    displayUser() {
        document.getElementById('userDisplay').textContent = this.currentUser;
    },

    renderExercises() {
        const container = document.getElementById('exerciseContainer');
        container.innerHTML = this.exercises.map(exercise => this.createExerciseHTML(exercise)).join('');
    },

function createExerciseHTML(exercise) {
    return `
        <div class="workout-card bg-white rounded-lg shadow">
            <h3 classass="dynamic-text font-bold mb-2">${exercise.name}</h3>
            <p class="dynamic-text text-gray-600 mb-2">${exercise.description}</p>
            ${Array(exercise.sets).fill().map((_, i) => `
                <div class="exercise-grid mb-2">
                    <span class="dynamic-text">Set ${i + 1}</span>
                    <div class="flex items-center gap-1">
                        <button class="adjust-button bg-gray-200 rounded touch-target" 
                                onclick="adjustValue('${exercise.name}_weight_${i+1}', -5)">-</button>
                        <input type="number" 
                               id="${exercise.name}_weight_${i+1}" 
                               class="number-input border rounded" 
                               value="0">
                        <button class="adjust-button bg-gray-200 rounded touch-target" 
                                onclick="adjustValue('${exercise.name}_weight_${i+1}', 5)">+</button>
                        <span class="dynamic-text">lb</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button class="adjust-button bg-gray-200 rounded touch-target" 
                                onclick="adjustValue('${exercise.name}_reps_${i+1}', -1)">-</button>
                        <input type="number" 
                               id="${exercise.name}_reps_${i+1}" 
                               class="number-input border rounded" 
                               value="0">
                        <button class="adjust-button bg-gray-200 rounded touch-target" 
                                onclick="adjustValue('${exercise.name}_reps_${i+1}', 1)">+</button>
                        <span class="dynamic-text">reps</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

    setupEventListeners() {
        document.getElementById('saveWorkout').addEventListener('click', () => this.saveWorkout());
    },

    loadLastWorkout() {
        const lastWorkout = this.getLastWorkout();
        if (lastWorkout) {
            const summary = document.getElementById('lastWorkoutSummary');
            summary.innerHTML = this.createWorkoutSummary(lastWorkout);
        }
    },

    getLastWorkout() {
        const key = `monday_${this.currentUser}`;
        const workouts = JSON.parse(localStorage.getItem(key) || '[]');
        return workouts[workouts.length - 1];
    },

    createWorkoutSummary(workout) {
        return `
            <div class="text-sm">
                <p>Date: ${new Date(workout.date).toLocaleDateString()}</p>
                ${Object.entries(workout.exercises).map(([name, data]) => `
                    <p>${name}: ${data.sets.map(set => `${set.weight}x${set.reps}`).join(', ')}</p>
                `).join('')}
            </div>
        `;
    },

    saveWorkout() {
        const workout = {
            date: new Date().toISOString(),
            exercises: {}
        };

        this.exercises.forEach(exercise => {
            workout.exercises[exercise.name] = {
                sets: Array(exercise.sets).fill().map((_, i) => ({
                    weight: Number(document.getElementById(`${exercise.name}_weight_${i+1}`).value),
                    reps: Number(document.getElementById(`${exercise.name}_reps_${i+1}`).value)
                }))
            };
        });

        const key = `monday_${this.currentUser}`;
        const workouts = JSON.parse(localStorage.getItem(key) || '[]');
        workouts.push(workout);
        localStorage.setItem(key, JSON.stringify(workouts));

        alert('Workout saved!');
        this.loadLastWorkout();
    }
};

function adjustValue(id, amount) {
    const input = document.getElementById(id);
    input.value = Number(input.value) + amount;
}

document.addEventListener('DOMContentLoaded', () => MondayWorkout.init());
