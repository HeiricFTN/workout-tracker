const FridayWorkout = {
    exercises: [
        {
    name: 'Modified Pull-ups',
    description: 'Using the rack, perform pull-ups with knees bent for ceiling clearance.',
    formCues: [
        'Bend knees to avoid ceiling',
        'Pull chest to bar',
        'Control descent',
        'Full arm extension at bottom'
    ],
    sets: 3,
    repRange: 'Max Reps',
    restTime: '90 sec',
    isBodyweight: true
        },
        {
            name: 'Standing DB Curls',
            description: 'Alternating dumbbell curls while standing. Keep upper arms still.',
            formCues: [
                'Elbows pinned to sides',
                'No swinging',
                'Full range of motion',
                'Squeeze at top'
            ],
            sets: 3,
            repRange: '10-12',
            restTime: '60 sec'
        },
        {
            name: 'Hammer Curls',
            description: 'Standing curls with palms facing each other for forearm focus.',
            formCues: [
                'Palms face each other',
                'Keep elbows steady',
                'Control the motion',
                'Full extension'
            ],
            sets: 3,
            repRange: '12',
            restTime: '60 sec'
        },
        {
    name: 'TRX Rows',
    description: 'Face TRX, lean back, pull chest to hands with elbows wide.',
    formCues: [
        'Body straight',
        'Chest up',
        'Squeeze shoulder blades',
        'Control return'
    ],
    sets: 3,
    repRange: '12-15',
    restTime: '60 sec',
    isBodyweight: true 
        },
        {
            name: 'Concentration Curls',
            description: 'Seated, elbow braced against inner thigh, strict curl motion.',
            formCues: [
                'Elbow on inner thigh',
                'Keep upper arm still',
                'Slow negative',
                'Full range of motion'
            ],
            sets: 2,
            repRange: '12',
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
            document.getElementById('dadButton').classList.add('bg-blue-500500', 'text-white');
        } else {
            document.getElementById('alexButton').classList.remove('bg-gray-200');
            document.getElementById('alexButton').classList.add('bg-blue-5e-500', 'text-white');
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
 `
                    <div class="exercise-grid mb-2">
                        <span class="text-sm font-medium">Set ${i + 1}</span>
                        <div class="flex items-center gap-1">
                            <button class="adjust-button bg-gray-200 rounded td touch-target" 
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
        const key = `friday_${this.currentUser}`;
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
    if (input) {
        const newValue = Number(input.value) + amount;
        if (newValue >= 0) {
            input.value = newValue;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => FridayWorkout.init());
