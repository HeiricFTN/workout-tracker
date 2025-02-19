// dashboard.js

// Wait for DOM to load before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core objects
    const dataManager = new DataManager();
    const workoutTracker = new WorkoutTracker(dataManager);
    const progressTracker = new ProgressTracker(dataManager);

    // Cache DOM elements
    const elements = {
        userPanel: document.getElementById('userPanel'),
        workoutPanel: document.getElementById('workoutPanel'),
        progressPanel: document.getElementById('progressPanel'),
        dadButton: document.getElementById('userDad'),
        alexButton: document.getElementById('userAlex'),
        workoutButtons: {
            chestTriceps: document.getElementById('chestTriceps'),
            shoulders: document.getElementById('shoulders'),
            backBiceps: document.getElementById('backBiceps')
        },
        activeWorkout: document.getElementById('activeWorkout'),
        workoutHistory: document.getElementById('workoutHistory')
    };

    // Initialize dashboard state
    const dashboardState = {
        currentUser: dataManager.getCurrentUser(),
        currentWorkout: null,
        isWorkoutActive: false
    };

    // Set up event listeners
    function initializeEventListeners() {
        // User switching
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));

        // Workout selection
        Object.entries(elements.workoutButtons).forEach(([type, button]) => {
            button.addEventListener('click', () => startWorkout(type));
        });
    }

    // User switching functionality
    function switchUser(user) {
        dashboardState.currentUser = user;
        dataManager.switchUser(user);
        updateUIForUser(user);
        loadUserHistory(user);
        console.log(`Switched to user: ${user}`);
    }

    // Update UI for selected user
    function updateUIForUser(user) {
        // Update button states
        elements.dadButton.classList.toggle('active', user === 'Dad');
        elements.alexButton.classList.toggle('active', user === 'Alex');

        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${user}!`;
        }

        // Clear active workout if exists
        if (!dashboardState.isWorkoutActive) {
            elements.activeWorkout.innerHTML = '';
        }
    }

    // Start new workout
    function startWorkout(workoutType) {
        if (dashboardState.isWorkoutActive) {
            if (!confirm('Do you want to abandon current workout and start new one?')) {
                return;
            }
        }

        const workout = workoutLibrary[workoutType];
        if (!workout) {
            console.error(`Workout type ${workoutType} not found`);
            return;
        }

        dashboardState.currentWorkout = workout;
        dashboardState.isWorkoutActive = true;

        displayActiveWorkout(workout);
        console.log(`Starting ${workoutType} workout`);
    }

    // Display active workout
    function displayActiveWorkout(workout) {
        elements.activeWorkout.innerHTML = `
            <div class="workout-header">
                <h2>${workout.name}</h2>
                <button onclick="completeWorkout()" class="complete-button">Complete Workout</button>
            </div>
            <div class="supersets">
                ${generateSupersetHTML(workout.supersets)}
            </div>
        `;

        // Add input event listeners
        addInputEventListeners();
    }

    // Generate HTML for supersets
    function generateSupersetHTML(supersets) {
        return supersets.map((superset, index) => `
            <div class="superset" data-superset="${index}">
                <h3>Superset ${index + 1}</h3>
                <div class="exercises">
                    ${superset.exercises.map((exercise, exIndex) => `
                        <div class="exercise">
                            <label>${exercise}</label>
                            <input type="number" 
                                   class="weight-input" 
                                   placeholder="Weight (lbs)"
                                   data-exercise="${exIndex}">
                            <input type="number" 
                                   class="reps-input" 
                                   placeholder="Reps"
                                   data-exercise="${exIndex}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Add input event listeners for workout tracking
    function addInputEventListeners() {
        const inputs = elements.activeWorkout.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', function(e) {
                const supersetElement = e.target.closest('.superset');
                const supersetIndex = supersetElement.dataset.superset;
                const exerciseIndex = e.target.dataset.exercise;
                const isWeight = e.target.classList.contains('weight-input');
                
                updateWorkoutProgress(supersetIndex, exerciseIndex, isWeight, e.target.value);
            });
        });
    }

    // Update workout progress
    function updateWorkoutProgress(supersetIndex, exerciseIndex, isWeight, value) {
        if (!dashboardState.currentWorkout.progress) {
            dashboardState.currentWorkout.progress = {};
        }

        const progressKey = `${supersetIndex}-${exerciseIndex}`;
        if (!dashboardState.currentWorkout.progress[progressKey]) {
            dashboardState.currentWorkout.progress[progressKey] = {};
        }

        if (isWeight) {
            dashboardState.currentWorkout.progress[progressKey].weight = value;
        } else {
            dashboardState.currentWorkout.progress[progressKey].reps = value;
        }
    }

    // Complete workout
    window.completeWorkout = function() {
        if (!dashboardState.currentWorkout) return;

        const workoutData = {
            type: dashboardState.currentWorkout.name,
            date: new Date().toISOString(),
            progress: dashboardState.currentWorkout.progress
        };

        dataManager.saveWorkout(workoutData);
        dashboardState.isWorkoutActive = false;
        dashboardState.currentWorkout = null;

        elements.activeWorkout.innerHTML = '<div class="success-message">Workout completed!</div>';
        loadUserHistory(dashboardState.currentUser);
        
        console.log('Workout completed and saved');
    };

    // Load user's workout history
    function loadUserHistory(user) {
        const history = dataManager.getWorkoutHistory(user);
        displayWorkoutHistory(history);
    }

    // Display workout history
    function displayWorkoutHistory(history) {
        if (!elements.workoutHistory) return;

        if (!history || history.length === 0) {
            elements.workoutHistory.innerHTML = '<p>No workout history available</p>';
            return;
        }

        elements.workoutHistory.innerHTML = `
            <h3>Recent Workouts</h3>
            <div class="history-list">
                ${history.map(workout => `
                    <div class="history-item">
                        <span class="workout-type">${workout.type}</span>
                        <span class="workout-date">${new Date(workout.date).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Initialize dashboard
    function initializeDashboard() {
        initializeEventListeners();
        updateUIForUser(dashboardState.currentUser);
        loadUserHistory(dashboardState.currentUser);
        console.log('Dashboard initialized');
    }

    // Start the dashboard
    initializeDashboard();
});
