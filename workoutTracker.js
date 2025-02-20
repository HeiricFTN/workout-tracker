// workoutTracker.js
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize core elements
    const elements = {
        workoutContainer: document.getElementById('workoutContainer'),
        currentUser: document.getElementById('currentUser'),
        completeWorkoutBtn: document.getElementById('completeWorkoutBtn'),
        timerModal: document.getElementById('timerModal'),
        timerDisplay: document.getElementById('timerDisplay'),
        startTimer: document.getElementById('startTimer'),
        cancelTimer: document.getElementById('cancelTimer')
    };

    // Initialize state
    const state = {
        currentWorkout: null,
        currentUser: null,
        timer: null,
        isRestTimerActive: false
    };

    // Initialize data manager
    const dataManager = new DataManager();

    // Load current user
    async function loadCurrentUser() {
        try {
            state.currentUser = await dataManager.getCurrentUser();
            if (elements.currentUser) {
                elements.currentUser.textContent = state.currentUser;
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }

    // Start workout
    function startWorkout(workoutType) {
        const workout = workoutLibrary[workoutType];
        if (!workout) {
            console.error('Workout not found:', workoutType);
            return;
        }
        state.currentWorkout = workout;
        renderWorkout();
    }

    // Render workout
    function renderWorkout() {
        if (!state.currentWorkout) return;

        let html = `
            <div class="workout-card">
                <h2 class="text-xl font-bold mb-4">${state.currentWorkout.name}</h2>
        `;

        state.currentWorkout.supersets.forEach((superset, supersetIndex) => {
            html += `
                <div class="superset mb-6" data-superset="${supersetIndex}">
                    <h3 class="font-semibold mb-2">Superset ${supersetIndex + 1}</h3>
                    <div class="space-y-3">
                        ${superset.exercises.map((exercise, exerciseIndex) => `
                            <div class="exercise-grid" data-exercise="${exerciseIndex}">
                                <span class="exercise-name">${exercise}</span>
                                <div class="flex items-center gap-2">
                                    <input type="number" 
                                           class="number-input weight-input" 
                                           placeholder="Weight"
                                           min="0"
                                           max="999">
                                    <span>lbs</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="number" 
                                           class="number-input reps-input" 
                                           placeholder="Reps"
                                           min="0"
                                           max="999">
                                    <span>reps</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="start-rest py-2 px-4 bg-blue-500 text-white rounded-lg mt-2"
                            onclick="startRestTimer(${supersetIndex})">
                        Start Rest Timer
                    </button>
                </div>
            `;
        });

        html += '</div>';
        elements.workoutContainer.innerHTML = html;
        addInputEventListeners();
    }

    // Add input event listeners
    function addInputEventListeners() {
        const inputs = elements.workoutContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', validateInput);
            input.addEventListener('input', validateInput);
        });
    }

    // Validate input
    function validateInput(event) {
        const input = event.target;
        let value = parseInt(input.value);
        
        // Remove non-numeric characters
        input.value = input.value.replace(/[^\d]/g, '');
        
        // Enforce min/max values
        if (value < 0) input.value = 0;
        if (value > 999) input.value = 999;
    }

    // Complete workout
    async function completeWorkout() {
        if (!state.currentWorkout) return;

        const workoutData = {
            name: state.currentWorkout.name,
            date: new Date().toISOString(),
            user: state.currentUser,
            supersets: []
        };

        // Gather data from all supersets
        const supersets = elements.workoutContainer.querySelectorAll('.superset');
        supersets.forEach((superset, supersetIndex) => {
            const exercises = [];
            const exerciseElements = superset.querySelectorAll('.exercise-grid');
            
            exerciseElements.forEach((exercise, exerciseIndex) => {
                const weight = exercise.querySelector('.weight-input').value;
                const reps = exercise.querySelector('.reps-input').value;
                
                if (weight || reps) {
                    exercises.push({
                        name: state.currentWorkout.supersets[supersetIndex].exercises[exerciseIndex],
                        weight: parseInt(weight) || 0,
                        reps: parseInt(reps) || 0
                    });
                }
            });

            if (exercises.length > 0) {
                workoutData.supersets.push({ exercises });
            }
        });

        try {
            await dataManager.saveWorkout(workoutData);
            showSuccessMessage('Workout completed and saved!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Error saving workout:', error);
            showErrorMessage('Failed to save workout');
        }
    }

    // Timer functions
    function startRestTimer(supersetIndex) {
        if (state.isRestTimerActive) return;
        
        state.isRestTimerActive = true;
        let timeLeft = 90; // 90 seconds rest
        
        elements.timerModal.classList.remove('hidden');
        elements.timerDisplay.textContent = formatTime(timeLeft);
        
        state.timer = setInterval(() => {
            timeLeft--;
            elements.timerDisplay.textContent = formatTime(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(state.timer);
                state.isRestTimerActive = false;
                elements.timerModal.classList.add('hidden');
            }
        }, 1000);
    }

    function cancelRestTimer() {
        if (state.timer) {
            clearInterval(state.timer);
            state.isRestTimerActive = false;
            elements.timerModal.classList.add('hidden');
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Message display functions
    function showSuccessMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.textContent = message;
        elements.workoutContainer.prepend(messageElement);
    }

    function showErrorMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'error-message';
        messageElement.textContent = message;
        elements.workoutContainer.prepend(messageElement);
    }

    // Event listeners
    function setupEventListeners() {
        elements.completeWorkoutBtn?.addEventListener('click', completeWorkout);
        elements.startTimer?.addEventListener('click', () => startRestTimer(0));
        elements.cancelTimer?.addEventListener('click', cancelRestTimer);
    }

    // Initialize
    async function initialize() {
        await loadCurrentUser();
        setupEventListeners();
        
        // Check for workout type in URL
        const urlParams = new URLSearchParams(window.location.search);
        const workoutType = urlParams.get('type');
        
        if (workoutType) {
            startWorkout(workoutType);
        } else {
            elements.workoutContainer.innerHTML = `
                <div class="workout-card">
                    <h2 class="text-xl font-bold">No Workout Selected</h2>
                    <p class="text-gray-600">Please select a workout from the dashboard.</p>
                </div>
            `;
        }
    }

    // Start initialization
    initialize().catch(error => {
        console.error('Failed to initialize workout tracker:', error);
        showErrorMessage('Failed to initialize workout tracker');
    });
});
