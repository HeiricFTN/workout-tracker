// dashboard.js
document.addEventListener('DOMContentLoaded', async function() {
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
        currentUser: await DataManager.getCurrentUser()
    };

    // Initialize dashboard
    async function initializeDashboard() {
        updateCurrentDate();
        await updateUserButtons();
        loadTodaysWorkout();
        await updateWeeklyProgress();
        await updateProgressSection();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));
        elements.startWorkoutBtn.addEventListener('click', startWorkout);

        // Listen for data changes
        window.addEventListener('dataChanged', async (event) => {
            const { type, data } = event.detail;
            if (type === 'user') {
                state.currentUser = data;
                await updateDashboard();
            } else if (type === 'workouts') {
                await updateWeeklyProgress();
                await updateProgressSection();
            }
        });
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
    async function switchUser(user) {
        await Dt DataManager.setCurrentUser(user);
        // DataManager will trigger dataChanged event, which will update the UI
    }

    // Update user button states
    async function updateUserButtons() {
        const currentUser = await DataManager.getCurrentUser();
        elements.dadButton.className = currentUser === 'Dad' 
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
        
        elements.alexButton.className = currentUser === 'Alex'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
    }

    // Load today's suggested workout
    function loadTodaysWorkout() {
        const day = new Date().getDay();
        let workoutType = '';
        
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

        elements.workoutPreview.innerHTML = `
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
    async function updateWeeklyProgress() {
        const workouts = await DataManager.getWeeklyWorkouts(state.currentUser);
        const days = new Array(7).fill(false);
        
        workouts.forEach(workout => {
            const date = new Date(workout.timestamp);
            days[date.getDay()] = true;
        });

        elements.weeklyDots.innerHTML = days.map(hasWorkout => `
            <div class="h-3 w-3 rounded-full mx-auto ${
                hasWorkout ? 'bg-green-500' : 'bg-gray-200'
            }"></div>
        `).join('');
    }

    // Update progress section
    async function updateProgressSection() {
        const progress = await DataManager.getProgress(state.currentUser);
        updateKeyLifts(progress);
        updateRecentImprovements(progress);
        updateNextTargets(progress);
    }

    // Update key lifts section
    function updateKeyLifts(progress) {
        const keyLifts = Object.entries(progress)
            .map(([exercise, data]) => ({
                name: exercise,
                ...data.personalBest
            }))
            .slice(0, 3); // Show top 3 lifts

        elements.keyLifts.innerHTML = keyLifts.map(lift => `
            <div class="flex justify-between items-center">
                <span>${lift.name}</span>
                <span class="font-bold">${lift.weight}lbs</span>
            </div>
        `).join('');
    }

    // Update recent improvements
    function updateRecentImprovements(progress) {
        const improvements = Object.entries(progress)
            .map(([exercise, data]) => {
                const history = data.history;
                if (history.length < 2) return null;
                
                const latest = history[history.length - 1];
                const previous = history[history.length - 2];
                const increase = Math.max(...latest.sets.map(s => s.weight)) - 
                               Math.max(...previous.sets.map(s => s.weight));
                
                return increase > 0 ? { exercise, increase } : null;
            })
            .filter(Boolean)
            .slice(0, 3); // Show top 3 improvements

        elements.recentImprovements.innerHTML = improvements.map(imp => `
            <div class="flex justify-between items-center">
                <span>${imp.exercise}</span>
                <span class="text-green-500">+${imp.increase}lbs</span>
            </div>
        `).join('');
    }

    // Update next targets
    function updateNextTargets(progress) {
        const targets = Object.entries(progress)
            .map(([exercise, data]) => ({
                exercise,
                weight: Math.ceil(data.personalBest.weight * 1.05) // 5% increase as target
            }))
            .slice(0, 3); // Show top 3 targets

        elements.nextTargets.innerHTML = targets.map(target => `
            <div class="flex justify-between items-center">
                <span>${target.exercise}</span>
                <span class="font-bold">${target.weight}lbs</span>
            </div>
        `).join('');
    }

    // Start workout function
    function startWorkout() {
        window.location.href = 'workout.html';
    }

    // Update entire dashboard
    async function updateDashboard() {
        await updateUserButtons();
        loadTodaysWorkout();
        await updateWeeklyProgress();
        await updateProgressSection();
    }

    // Initialize the dashboard
    initializeDashboard().catch(error => {
        console.error('Failed to initialize dashboard:', error);
    });
});
