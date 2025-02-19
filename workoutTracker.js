const WorkoutTracker = {
    currentUser: null,
    currentWorkout: null,
    startTime: null,
    supersetProgress: {},
    restTimer: null,
    workoutData: {
        date: null,
        exercises: {},
        duration: 0,
        notes: '',
        completed: false
    },

    async init() {
        console.log('Initializing WorkoutTracker...');
        try {
            this.showLoading();
            this.currentUser = await DataManager.getCurrentUser();
            await this.loadWorkoutFromUrl();
            this.setupEventListeners();
            this.initializeUI();
            this.hideLoading();
            console.log('WorkoutTracker initialized');
        } catch (error) {
            console.error('Failed to initialize WorkoutTracker:', error);
            this.showError('Failed to load workout');
        }
    },

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
    },

    async loadWorkoutFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');
        
        if (!workoutId) {
            throw new Error('No workoutout ID provided');
        }

        const phase = WorkoutLibrary.getCurrentPhase();
        this.currentWorkout = WorkoutLibrary.getWorkout(phase, workoutId);
        
        if (!this.currentWorkout) {
            throw new Error('Workout not found');
        }

        this.workoutData.date = new Date().toISOString();
        this.startTime = Date.now();
        console.log('Workout loaded:', this.currentWorkout.name);
    },

    setupEventListeners() {
        // User switching
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        
        // Workout controls
        document.getElementById('restTimerBtn').addEventListener('click', () => this.startRestTimer());
        document.getElementById('completeWorkoutBtn').addEventListener('click', () => this.showCompletionModal());

        // Modal buttons
        document.getElementById('skipNotesBtn')?.addEventListener('click', () => this.skipNotes());
        document.getElementById('saveWorkoutBtn')?.addEventListener('click', () => this.finalizeWorkout());

        console.log('Event listeners set up');
    },

    async switchUser(user) {
        console.log('Switching to user:', user);
        this.currentUser = user;
        await DataManager.setCurrentUser(user);
        this.updateUserButtons();
        this.loadLastWorkout();
    },

    updateUserButtons() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        
        dadButton.classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        dadButton.classList.toggle('text-white', this.currentUser === 'Dad');
        alexButton.classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        alexButtonton.classList.toggle('text-white', this.currentUser === 'Alex');
    },

    initializeUI() {
        if (!this.currentWorkout) return;

        // Update workout title
        document.getElementById('workoutTitle').textContent = this.currentWorkout.name;
        
        // Render supersets
        const container = document.getElementById('supersetsContainer');
        container.innerHTML = this.currentWorkout.supersets
            .map(superset => this.renderSuperset(superset))
            .join('');

        // Initialize progress tracking
        this.currentWorkout.supersets.forEach(superset => {
            this.supersetProgress[superset.name] = {
                completed: false,
                exercises: {}
            };
        });

        this.updateUserButtons();
    },

    renderSuperset(superset) {
        return `
            <div class="workout-card" id="superset-${superset.name}">
                <h3 class="text-lg font-bold mb-4">Superset ${superset.name}</h3>
                ${superset.exercises.map(exercise => this.renderExercise(exercise, superset.name)).join('')}
                <div class="mt-4">
                    <button class="rest-timer-btn bg-blue-500 text-white px-4 py-2 rounded"
                            onclick="WorkoutTracker.startRestTimer(${exercise.rest || 60})">
                        Rest Timer (${Math.floor((exercise.rest || 60) / 60)}:${(exercise.rest || 60) % 60})
                    </button>
                </div>
            </div>
        `;
    },

    renderExercise(exercise, supersetName) {
        return `
            <div class="mb-6" id="exercise-${exercise.name.replace(/\s+/g, '-')}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold">${exercise.name}</h4>
                        <p class="text-sm text-gray-600">${exercise.description}</p>
                    </div>
                    <span class="text-sm text-gray-500">${exercise.repRange} reps</span>
                </div>

                <div class="bg-blue-50 p-2 rounded mb-4">
                    <p class="text-xs font-bold mb-1">Form Cues:</p>
                    <ul class="text-xs text-gray-600">
                        ${exercise.formCues.map(cue => `<li>• ${cue}</li>`).join('')}
                    </ul>
                </div>

                ${Array(exercise.sets).fill().map((_, i) => this.renderSet(exercise, i)).join('')}
            </div>
        `;
    },

    renderSet(exercise, setIndex) {
        const isBodyweight = exercise.isBodyweight;
        return `
            <div class="flex items-center gap-4 mb-2">
                <span class="text-sm">Set ${setIndex + 1}:</span>
                ${!isBodyweight ? `
                    <div class="flex items-center gap-2">
                        <button class="adjust-button" onclick="WorkoutTracker.adjustValue('${exercise.name}_weight_${setIndex}', -5)">-</button>
                        <input type="number" id="${exercise.name}_weight_${setIndex}" class="number-input" value="0">
                        <button class="adjust-button" onclick="WorkoutTracker.adjustValue('${exercise.name}_weight_${setIndex}', 5)">+</button>
                        <span class="text-sm">lb</span>
                    </div>
                ` : ''}
                <div class="flex items-center gap-2">
                    <button class="adjust-button" onclick="WorkoutTracker.adjustValue('${exercise.name}_reps_${setIndex}', -1)">-</button>
                    <input type="number" id="${exercise.name}_reps_${setIndex}" class="number-input" value="0">
                    <button class="adjust-button" onclick="WorkoutTracker.adjustValue('${exercise.name}_reps_${setIndex}', 1)">+</button>
                    <span class="text-sm">reps</span>
                </div>
            </div>
        `;
    },

    adjustValue(id, amount) {
        const input = document.getElementById(id);
        if (input) {
            const newValue = Math.max(0, Number(input.value) + amount);
            input.value = newValue;
            this.updateProgress(id);
        }
    },

    updateProgress(inputId) {
        // Implementation for tracking progress during workout
    },

    startRestTimer(seconds = 60) {
        if (this.restTimer) {
            clearInterval(this.restTimer);
        }

        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.classList.remove('hidden');
        
        let timeLeft = seconds;
        this.updateTimerDisplay(timeLeft);

        this.restTimer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(this.restTimer);
                timerDisplay.classList.add('hidden');
                // Vibrate if supported
                if ('vibrate' in navigator) {
                    navigator.vibrate(200);
                }
            }
        }, 1000);
    },

    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('timerDisplay').textContent = 
            `Rest: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    showCompletionModal() {
        document.getElementById('completionModal').classList.remove('hidden');
    },

    hideCompletionModal() {
        document.getElementById('completionModal').classList.add('hidden');
    },

    skipNotes() {
        this.finalizeWorkout();
    },

    async finalizeWorkout() {
        this.workoutData.duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.workoutData.notes = document.getElementById('workoutNotes').value;
        this.workoutData.completed = true;

        try {
            await this.saveWorkoutData();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving workout:', error);
            this.showError('Failed to save workout');
        }
    },

    async saveWorkoutData() {
        // Gather all exercise data
        this.currentWorkout.supersets.forEach(superset => {
            superset.exercises.forEach(exercise => {
                const sets = Array(exercise.sets).fill().map((_, i) => ({
                    weight: exercise.isBodyweight ? null : 
                        Number(document.getElementById(`${exercise.name}_weight_${i}`).value),
                    reps: Number(document.getElementById(`${exercise.name}_reps_${i}`).value)
                }));
                this.workoutData.exercises[exercise.name] = { sets };
            });
        });

        await DataManager.saveWorkout(this.currentUser, this.workoutData);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => WorkoutTracker.init());

export default WorkoutTracker;
