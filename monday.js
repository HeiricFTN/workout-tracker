const MondayWorkout = {
    exercises: [
        {
            name: 'DB Bench Press',
            description: 'Lying on flat bench, press dumbbells up from chest level. Keep wrists straight, back flat on bench, and feet planted.',
            formCues: [
                'Back flat on bench',
                'Feet planted firmly',
                'Squeeze chest at top',
                'Control the descent'
            ],
            sets: 4,
            repRange: '8-12',
            restTime: '90 sec'
        },
        {
            name: 'Incline DB Press',
            description: 'Press dumbbells while on incline bench (30-45°). Focus on upper chest activation.',
            formCues: [
                'Back against bench',
                'Drive elbows under wrists',
                'Slight arch in back',
                'Full range of motion'
            ],
            sets: 3,
            repRange: '8-12',
            restTime: '90 sec'
        },
        {
            name: 'TRX Push-ups',
            description: 'Hands in TRX straps, perform push-up motion. Adjust difficulty by moving feet position.',
            formCues: [
                'Core tight',
                'Body straight line',
                'Chest to hands',
                'Control the motion'
            ],
            sets: 3,
            repRange: '10-15',
            restTime: '60 sec'
        },
        {
            name: 'DB Flyes',
            description: 'Lying flat, slight bend in elbows, open arms wide and squeeze chest.',
            formCues: [
                'Keep slight elbow bend',
                'Wide arc movement',
                'Squeeze at top',
                'Controlled descent'
            ],
            sets: 3,
            repRange: '12-15',
            restTime: '60 sec'
        },
        {
            name: 'TRX Tricep Press',
            description: 'Face away from anchor, hands close, press down for tricep focus.',
            formCues: [
                'Elbows by ears',
                'Body straight',
                'Full extension',
                'Slow negatives'
            ],
            sets: 3,
            repRange: '12-15',
            restTime: '60 sec'
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
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.textContent = this.currentUser;
        }
    },

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        
        document.getElementById('dadButton').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('alexButton').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('dadButton').classList.add('bg-gray-200');
        document.getElementById('alexButton').classList.add('bg-gray-200');
        
        if (user === 'Dad') {
            document.getElementById('dadButton').classList.remove('bg-gray-200');
            document.getElementById('dadButton').classList.add('bg-blue-500', 'text-white');
        } else {
            document.getElementById('alexButton').classList.remove('bg-gray-2y-200');
            document.getElementById('alexButton').classList.add('bg-blue-500', 'text-white');
        }
        
        this.displayUser();
        this.loadLastWorkout();
    },

    renderExercises() {
        const container = document.getElementById('exerciseContainer');
        if (container) {
            container.innerHTML = this.exercises.map(exercise => this.createExerciseHTML(exercise)).join('');
        }
    },

    createExerciseHTML(exercise) {
        return `
            <div class="workout-card bg-white rounded-lg shadow p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${exercise.name}</h3>
                    <span class="text-sm text-gray-500">Rest: ${exercise.restTime}</span>
                </div>
                
                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">${exercise.description}</p>
                    <div class="bg-blue-50 p-2 rounded">
                        <p class="text-xs font-bold mb-1">Form Cues:</p>
                        <ul class="text-xs text-gray-600">
                            ${exercise.formCues.map(cue => `<li>• ${cue}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mb-2 text-sm text-gray-600">Target: ${exercise.repRange} reps</div>
                
                ${Array(exercise.sets).fill().map((_, i) => `
                    <div class="exercise-grid mb-2">
                        <span class="text-sm font-medium">Set ${i + 1}</span>
                        <div class="flex items-center gap-1">
                            <button class="adjust-button bg-gray-200 rounded touch-target" 
                                    onclick="adjustValue('${exercise.name}_weight_${i+1}', -5)">-</button>
                            <input type="number" 
                                   id="${exercise.name}_weight_${i+1}" 
                                   class="number-input border rounded" 
                                   value="0">
                            <button class="adjust-button bg-gray-200 rounded touch-target" 
                                    onclick="adjustValue('${exercise.name}_weight_${i+1}', 5)">+</button>
                            <span class="text-sm">lb</span>
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
                            <span class="text-sm">reps</span>
                        </div>
                    </div>
                `).join('')}

                <div class="text-xs text-gray-500 mt-2">
                    Previous: <span id="${exercise.name}_previous"></span>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        document.getElementById('saveWorkout').addEventListener('click', () => this.saveWorkout());
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
    },

    loadLastWorkout() {
        const lastWorkout = this.getLastWorkout();
        if (lastWorkout) {
            Object.entries(lastWorkout.exercises).forEach(([name, data]) => {
                const previousSpan = document.getElementById(`${name}_previous`);
                if (previousSpan) {
                    const lastSet = data.sets[data.sets.length - 1];
                    previousSpan.textContent = `${lastSet.weight}lb × ${lastSet.reps}`;
                }
                
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
        const key = `monday_${this.currentUser}`;
        const workouts = JSON.parse(localStorage.getItem(key) || '[]');
        return workouts[workouts.length - 1];
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
    if (input) {
        const newValue = Number(input.value) + amount;
        if (newValue >= 0) {
            input.value = newValue;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => MondayWorkout.init());
