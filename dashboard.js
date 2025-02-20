// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    const dataManager = new DataManager();
    const workoutTracker = new WorkoutTracker(dataManager);

    // Cache DOM elements
    const elements = {
        dadButton: document.getElementById('dadButton'),
        alexButton: document.getElementById('alexButton'),
        startWorkoutBtn: document.getElementById('startWorkoutBtn'),
        workoutPreview: document.getElementById('workoutPreview'),
        currentDate: document.getElementById('currentDate'),
        weeklyDots: document.getElementById('weeklyDots'),
        keyLifts: document.getElementById('keyLifts'),
        recentImprovements: document.getElementById('recentImprovements'),
        nextTargets: document.getElementById('nextTargets')
    };

    // Dashboard state
    const state = {
        currentUser: dataManager.getCurrentUser() || 'Dad',
        currentWorkout: null
    };

    // Initialize dashboard
    function initializeDashboard() {
        updateCurrentDate();
        updateUserButtons();
        loadTodaysWorkout();
        updateWeeklyProgress();
        updateProgressSection();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));
        elements.startWorkoutBtn.addEventListener('click', startWorkout);
    }

    // Update current date
    function updateCurrentDate() {
        const date = new Date();
        elements.currentDate.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    // User switching
    function switchUser(user) {
        state.currentUser = user;
        dataManager.switchUser(user);
        updateUserButtons();
        loadTodaysWorkout();
        updateProgressSection();
    }

    // Update user button states
    function updateUserButtons() {
        elements.dadButton.className = state.currentUser === 'Dad' 
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
        
        elements.alexButton.className = state.currentUser === 'Alex'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
    }

    // Load today's suggested workout
    function loadTodaysWorkout() {
        const day = new Date().getDay();
        let workoutType = '';
        
        // Suggested workout based on day
        switch(day) {
            case 1: // Monday
                workoutType = 'Chest & Triceps';
                break;
            case 3: // Wednesday
                workoutType = 'Shoulders';
                break;
            case 5: // Friday
                workoutType = 'Back & Biceps';
                break;
            default:
                workoutType = 'Rest Day';
        }

        elements.workoutPreview.innerHTML =L = `
            <div class="text-center py-2">
                <h3 class="font-semibold">${workoutType}</h3>
                ${workoutType !== 'Rest Day' 
                    ? '<p class="text-sm text-gray-600">Tap Start Workout to begin</p>'
                    : '<p class="text-sm text-gray-600">Take it easy today!</p>'
                }
            </div>
        `;
    }

    // Update weekly progress dots
    function updateWeeklyProgress() {
        const workouts = dataManager.getWeeklyWorkouts(state.currentUser);
        elements.weeklyDots.innerHTML = Array(7).fill(0).map((_, i) => `
            <div class="h-3 w-3 rounded-full mx-auto ${
                workouts.includes(i) ? 'bg-green-500' : 'bg-gray-200'
            }"></div>
        `).join('');
    }

    // Update progress section
    function updateProgressSection() {
        updateKeyLifts();
        updateRecentImprovements();
        updateNextTargets();
    }

    // Update key lifts section
    function updateKeyLifts() {
        const keyLifts = dataManager.getKeyLifts(state.currentUser);
        elements.keyLifts.innerHTML = keyLifts.map(lift => `
            <div class="flex justify-between items-center">
                <span>${lift.name}</span>
                <span class="font-bold">${lift.weight}lbs</span>
            </div>
        `).join('');
    }

    // Update recent improvements
    function updateRecentImprovements() {
        const improvements = dataManager.getRecentImprovements(state.currentUser);
        elements.recentImprovements.innerHTML = improvements.map(imp => `
            <div class="flex justify-between items-center">
                <span>${imp.exercise}</span>
                <span class="text-green-500">+${imp.increase}lbs</span>
            </div>
        `).join('');
    }

    // Update next targets
    function updateNextTargets() {
        const targets = dataManager.getNextTargets(state.currentUser);
        elements.nextTargets.innerHTML = targets.map(target => `
            <div class="flex justify-between items-center">
                <span>${target.exercise}</span>
                <span class="font-bold">${target.weight}lbs</span>
            </div>
        `).join('');
    }

    // Start workout function
    function startWorkout() {
        // Redirect to workout page or show workout interface
        window.location.href = 'workout.html';
    }

    // Initialize the dashboard
    initializeDashboard();
});
