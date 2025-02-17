// friday.js
const FridayWorkout = {
    exercises: [
        {
            name: 'Modified Pull-ups',
            description: 'Pull-ups with knees bent for ceiling clearance',
            sets: 3,
            repRange: 'Max Reps'
        },
        {
            name: 'Standing DB Curls',
            description: 'Curl dumbbells with elbows at sides',
            sets: 3,
            repRange: '10-12'
        },
        {
            name: 'Hammer Curls',
            description: 'Curl with palms facing each other',
            sets: 3,
            repRange: '12'
        },
        {
            name: 'TRX Rows',
            description: 'Pull chest to hands, squeezing shoulder blades',
            sets: 3,
            repRange: '12-15'
        },
        {
            name: 'Concentration Curls',
            description: 'Seated, curl dumbbell with elbow on inner thigh',
            sets: 2,
            repRange: '12'
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

createExerciseHTML(exercise) {
    return `
        <div class="workout-card bg-white rounded-lg shadow p-3 mb-3">
            <h3 class="text-lg font-bold mb-2">${exercise.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${exercise.description}</p>
            ${Array(exercise.sets).fill().map((_, i) => `
                <div class="exercise-input mb-2">
                    <span class="text-sm font-medium">Set ${i + 1}</span>
                    <div class="flex items-center gap-2">
                        <button class="touch-target px-3 bg-gray-200 rounded" 
                                onclick="adjustValue('${exercise.name}_weight_${i+1}', -5)">-</button>
                        <input type="number" 
                               id="${exercise.name}_weight_${i+1}" 
                               class="number-input border rounded py-1"
                               value="0">
                        <button class="touch-target px-3 bg-gray-200 rounded" 
                                onclick="adjustValue('${exercise.name}_weight_${i+1}', 5)">+</button>
                        <span class="text-sm">lb</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="touch-target px-3 bg-gray-200 rounded" 
                                onclick="adjustValue('${exercise.name}_reps_${i+1}', -1)">-</button>
                        <input type="number" 
                               id="${exercise.name}_reps_${i+1}" 
                               class="number-input border rounded py-1"
                               value="0">
                        <button class="touch-target px-3 bg-gray-200 rounded" 
                                onclick="adjustValue('${exercise.name}_reps_${i+1}', 1)">+</button>
                        <span class="text-sm">reps</span>
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
        const key = `friday_${this.currentUser}`;
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

        const key = `friday_${this.currentUser}`;
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

document.addEventListener('DOMContentLoaded', () => FridayWorkout.init());
