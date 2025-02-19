// workoutTracker.js - Handles active workout tracking and management

const WorkoutTracker = {
    currentWorkout: null,
    currentUser: null,
    startTime: null,
    supersetProgress: {},
    workoutData: {
        date: null,
        exercises: {},
        duration: 0,
        completed: false
    },

    async init() {
        this.currentUser = localStorage.getItem('currentUser') || 'Dad';
        await this.loadWorkoutFromUrl();
        this.setupEventListeners();
        this.initializeUI();
    },

    async loadWorkoutFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');
        if (!workoutId) {
            console.error('No workout ID provided');
            window.location.href = 'index.html';
            return;
        }

        const phase = WorkoutLibrary.getCurrentPhase();
        this.currentWorkout = WorkoutLibrary.getWorkout(phase, workoutId);
        
        if (!this.currentWorkout) {
            console.error('Workout not found');
            window.location.href = 'index.html';
            return;
        }

        this.workoutData.date = new Date().toISOString();
        this.startTime = Date.now();
    },

    setupEventListeners() {
        document.getElementById('completeWorkout')?.addEventListener('click', () => this.completeWorkout());
        
        // Set up increment/decrement listeners for all number inputs
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = document.getElementById(e.target.dataset.target);
                if (input) {
                    input.value = Number(input.value) + Number(e.target.dataset.amount);
                    this.updateSetData(e.target.dataset.exercise, e.target.dataset.set);
                }
            });
        });

        // Timer controls
        document.querySelectorAll('.rest-timer').forEach(button => {
            button.addEventListener('click', (e) => {
                this.startRestTimer(Number(e.target.dataset.seconds));
            });
        });
    },

    initializeUI() {
        if (!this.currentWorkout) return;

        const container = document.getElementById('workoutContainer');
        if (!container) return;

        container.innerHTML = `
            <h2 class="text-xl font-bold mb-4">${this.currentWorkout.name}</h2>
            ${this.currentWorkout.supersets.map(superset => this.renderSuperset(superset)).join('')}
        `;

        // Initialize progress tracking
        this.currentWorkout.supersets.forEach(superset => {
            this.supersetProgress[superset.name] = {
                completed: false,
                exercises: {}
            };
        });
    },

    renderSuperset(superset) {
        return `
            <div class="superset-container mb-6" id="superset-${superset.name}">
                <h3 class="text-lg font-semibold mb-2">Superset ${superset.name}</h3>
                <div class="exercises-container">
                    ${superset.exercises.map(exercise => this.renderExercise(exercise, superset.name)).join('')}
                </div>
                <div class="rest-timer-container mt-2">
                    <button class="rest-timer bg-blue-500 text-white px-4 py-2 rounded" 
                            data-seconds="${superset.exercises[0].rest || 60}">
                        Start Rest Timer (${Math.floor((superset.exercises[0].rest || 60) / 60)}:${(superset.exercises[0].rest || 60) % 60})
                    </button>
                </div>
            </div>
        `;
    },

    renderExercise(exercise, supersetName) {
        const isBodyweight = exercise.isBodyweight;
        
        return `
            <div class="exercise-container bg-white rounded-lg shadow-sm p-4 mb-4" 
                 id="exercise-${exercise.name.replace(/\s+/g, '-')}">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold">${exercise.name}</h4>
                    <span class="text-sm text-gray-500">${exercise.repRange} reps</span>
                </div>
                
                <p class="text-sm text-gray-600 mb-2">${exercise.description}</p>
                
                <div class="form-cues bg-blue-50 p-2 rounded mb-4">
                    <ul class="text-xs">
                        ${exercise.formCues.map(cue => `<li>• ${cue}</li>`).join('')}
                    </ul>
                </div>

                ${Array(exercise.sets).fill().map((_, i) => `
                    <div class="set-container mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-sm">Set ${i + 1}:</span>
                            
                            ${!isBodyweight ? `
                                <div class="weight-input flex items-center">
                                    <button class="increment px-2 py-1 bg-gray-200 rounded" 
                                            data-target="${exercise.name}-weight-${i}" 
                                            data-amount="-5"
                                            data-exercise="${exercise.name}"
                                            data-set="${i}">-</button>
                                    <input type="number" 
                                           id="${exercise.name}-weight-${i}"
                                           class="w-16 text-center border rounded mx-1"
                                           value="0">
                                    <button class="increment px-2 py-1 bg-gray-200 rounded" 
                                            data-target="${exercise.name}-weight-${i}" 
                                            data-amount="5"
                                            data-exercise="${exercise.name}"
                                            data-set="${i}">+</button>
                                    <span class="ml-1">lbs</span>
                                </div>
                            ` : ''}
                            
                            <div class="reps-input flex items-center ml-2">
                                <button class="increment px-2 py-1 bg-gray-200 rounded" 
                                        data-target="${exercise.name}-reps-${i}" 
                                        data-amount="-1"
                                        data-exercise="${exercise.name}"
                                        data-set="${i}">-</button>
                                <input type="number" 
                                       id="${exercise.name}-reps-${i}"
                                       class="w-16 text-center border rounded mx-1"
                                       value="0">
                                <button class="increment px-2 py-1 bg-gray-200 rounded" 
                                        data-target="${exercise.name}-reps-${i}" 
                                        data-amount="1"
                                        data-exercise="${exercise.name}"
                                        data-set="${i}">+</button>
                                <span class="ml-1">reps</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateSetData(exerciseName, setIndex) {
        const exercise = this.currentWorkout.supersets
            .flatMap(s => s.exercises)
            .find(e => e.name === exerciseName);
            
        if (!exercise) return;

        const weightInput = document.getElementById(`${exerciseName}-weight-${setIndex}`);
        const repsInput = document.getElementById(`${exerciseName}-reps-${setIndex}`);

        if (!this.workoutData.exercises[exerciseName]) {
            this.workoutData.exercises[exerciseName] = {
                sets: []
            };
        }

        this.workoutData.exercises[exerciseName].sets[setIndex] = {
            weight: exercise.isBodyweight ? null : Number(weightInput?.value || 0),
            reps: Number(repsInput?.value || 0)
        };
    },

    startRestTimer(seconds) {
        let timeLeft = seconds;
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'fixed bottom-20 right-4 bg-blue-500 text-white px-4 py-2 rounded';
        document.body.appendChild(timerDisplay);

        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerDisplay.textContent = `Rest: ${minutes}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft === 0) {
                clearInterval(timer);
                document.body.removeChild(timerDisplay);
                // Vibrate if supported
                if ('vibrate' in navigator) {
                    navigator.vibrate(200);
                }
            }
            timeLeft--;
        }, 1000);
    },

    async completeWorkout() {
        this.workoutData.duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.workoutData.completed = true;

        // Save workout data
        try {
            const key = `workouts_${this.currentUser}`;
            const workouts = JSON.parse(localStorage.getItem(key) || '[]');
            workouts.push(this.workoutData);
            localStorage.setItem(key, JSON.stringify(workouts));

            // Update progress data
            await this.updateProgress();

            // Show completion message
            alert('Workout completed and saved!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Error saving workout. Please try again.');
        }
    },

    async updateProgress() {
        try {
            const key = `progress_${this.currentUser}`;
            const progress = JSON.parse(localStorage.getItem(key) || '{}');
            
            // Update personal bests
            Object.entries(this.workoutData.exercises).forEach(([exercise, data]) => {
                const maxWeight = Math.max(...data.sets.map(set => set.weight || 0));
                const maxReps = Math.max(...data.sets.map(set => set.reps));

                if (!progress[exercise] || maxWeight > progress[exercise].maxWeight) {
                    progress[exercise] = {
                        maxWeight,
                        maxReps,
                        date: this.workoutData.date
                    };
                }
            });

            localStorage.setItem(key, JSON.stringify(progress));
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }
};

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => WorkoutTracker.init());

export default WorkoutTracker;
