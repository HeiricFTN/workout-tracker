const WednesdayWorkout = {
    exercises: [
        {
            name: 'Seated DB Press',
            description: 'Press dumbbells overhead from shoulders',
            sets: 4,
            repRange: '8-12'
        },
        {
            name: 'Lateral Raises',
            description: 'Raise dumbbells to sides to shoulder level',
            sets: 3,
            repRange: '12-15'
        },
        {
            name: 'Front Raises',
            description: 'Raise dumbbells to front to shoulder level',
            sets: 3,
            repRange: '12'
        },
        {
            name: 'TRX Face Pulls',
            description: 'Pull TRX handles to face level, elbows high',
            sets: 3,
            repRange: '15'
        },
        {
            name: 'DB Shrugs',
            description: 'Shrug shoulders straight up and hold',
            sets: 3,
            repRange: '15'
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
            <div class="workout-card bg-white rounded-lg shadow">
                <h3 class="dynamic-text font-bold mb-2">${exercise.name}</h3>
                <p class="dynamic-text text-gray-600 mb-2">${exercise.description}</p>
                <p class="dynamic-text text-gray-600 mb-2">Target: ${exercise.repRange} reps</p>
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
    },

    setupEventListeners() {
        document.getElementById('saveWorkout').addEventListener('click', () => this.saveWorkout());
    },

    loadLastWorkout() {
        const lastWorkout = this.getLastWorkout();
        if (lastWorkout) {
            const summary = document.getElementById('lastWorkoutSummary');
            summary.innerHTML = this.createWorkoutSummary(lastWorkout);
            
            // Pre-fill inputs with last workout's values
            Object.entries(lastWorkout.exercises).forEach(([name, data]) => {
                data.sets.forEach((set, index) => {
                    const weightInput = document.getElementById(`${name}_weight_${index + 1}`);
                    const repsInput = document.getElementById(`${name}_reps_${index + 1}`);
                    if (weightInput) weightInput.value = set.weight;
                    if (repsInput) repsInput.value = set.reps;
                });
            });
        }
    },

    getLastWorkout() {
        const key = `wednesday_${this.currentUser}`;
        const workouts = JSON.parse(localStorage.getItem(key) || '[]');
        return workouts[workouts.length - 1];
    },

    createWorkoutSummary(workout) {
        return `
            <div class="text-sm">
                <p>Last: ${new Date(workout.date).toLocaleDateString()}</p>
                ${Object.entries(workout.exercises).map(([name, data]) => `
                    <p>${name}: ${data.sets.map(set => `${set.weight}×${set.reps}`).join(', ')}</p>
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

        const key = `wednesday_${this.currentUser}`;
        const workouts = JSON.parse(localStorage.getItem(key) || '[]');
        workouts.push(workout);
        localStorage.setItem(key, JSON.stringify(workouts));

        alert('Workout saved!');
        this.loadLastWorkout();
    }
};

// Helper function for adjusting input values
function adjustValue(id, amount) {
    const input = document.getElementById(id);
    if (input) {
        const newValue = Number(input.value) + amount;
        if (newValue >= 0) { // Prevent negative values
            input.value = newValue;
        }
    }
}

// Initialize the workout when the page loads
document.addEventListener('DOMContentLoaded', () => WednesdayWorkout.init());
