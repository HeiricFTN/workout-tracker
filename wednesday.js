const WednesdayWorkout = {
    exercises: [
        {
            name: 'Seated DB Press',
            description: 'Sitting on bench with back support, press dumbbells overhead from shoulder level.',
            formCues: [
                'Back against bench',
                'Core tight',
                'Press directly up',
                'Full range of motion'
            ],
            sets: 4,
            repRange: '8-12',
            restTime: '90 sec'
        },
        {
            name: 'Lateral Raises',
            description: 'Standing with dumbbells at sides, raise arms out to shoulder level.',
            formCues: [
                'Slight elbow bend',
                'Lead with elbows',
                'Controlled descent',
                'No swinging'
            ],
            sets: 3,
            repRange: '12-15',
            restTime: '60 sec'
        },
        {
            name: 'Front Raises',
            description: 'Standing tall, raise dumbbells to front at shoulder height.',
            formCues: [
                'Slight elbow bend',
                'Palms down',
                'Control the motion',
                'Keep core tight'
            ],
            sets: 3,
            repRange: '12',
            restTime: '60 sec'
        },
        {
    name: 'TRX Y-Raises',
    description: 'Face anchor point, raise arms up and out to form a Y shape.',
    formCues: [
        'Lean back slightly',
        'Arms slightly bent',
        'Squeeze shoulder blades',
        'Control the return'
    ],
    sets: 3,
    repRange: '12-15',
    restTime: '60 sec',
    isBodyweight: true  // Add this line
        },
        {
            name: 'DB Shrugs',
            description: 'Standing with heavy dumbbells, elevate shoulders straight up.',
            formCues: [
                'Straight up and down',
                'No rolling',
                'Hold at top',
                'Keep arms straight'
            ],
            sets: 3,
            repRange: '15',
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
            document.getElementById('alexButton').classList.remove('bg-gray-200');
            document.getElementById('alexButton').classList.add('bg-blue-500', 'text-white');
        }
        
        this.displayUser();
        this.loadLastWorkout();
    },

    renderExercises() {
        const container = document.getElementById('exerciseContainer');
        if (container) {
            container.innennerHTML = this.exercises.map(exercise => this.createExerciseHTML(exercise)).join('');
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
                        <ul class="text-xs text-gray-600"00">
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
        const key = `wednesday_${this.currentUser}`;
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

        const key = `wednesday_${this.currentUser}`;
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

document.addEventListener('DOMContentLoaded', () => WednesdayWorkout.init());
