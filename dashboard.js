// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    const dataManager = new DataManager();
    
    // Cache DOM elements
    const elements = {
        // User buttons
        dadButton: document.getElementById('dadButton'),
        alexButton: document.getElementById('alexButton'),

        // Program status
        currentWeek: document.getElementById('currentWeek'),
        programPhase: document.getElementById('programPhase'),
        nextWorkout: document.getElementById('nextWorkout'),

        // Weekly progress
        weeklyDots: document.getElementById('weeklyDots'),
        workoutsComplete: document.getElementById('workoutsComplete'),

        // Today's workout
        todayWorkout: document.getElementById('todayWorkout'),
        startWorkoutBtn: document.getElementById('startWorkoutBtn'),

        // Workout buttons
        chestTricepsBtn: document.getElementById('chestTricepsBtn'),
        shouldersBtn: document.getElementById('shouldersBtn'),
        backBicepsBtn: document.getElementById('backBicepsBtn'),

        // Progress
        recentProgress: document.getElementById('recentProgress')
    };

    // Initialize state
    const state = {
        currentUser: dataManager.getCurrentUser(),
        programStart: new Date('2025-02-18'), // Program start date
        workouts: ['Chest & Triceps', 'Shoulders', 'Back & Biceps']
    };

    // Initialize dashboard
    function initializeDashboard() {
        updateUserButtons();
        updateProgramStatus();
        updateWeeklyProgress();
        updateTodayWorkout();
        setupEventListeners();
        updateRecentProgress();
    }

    // Update user buttons
    function updateUserButtons() {
        elements.dadButton.className = state.currentUser === 'Dad'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';

        elements.alexButton.className = state.currentUser === 'Alex'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
    }

    // Update program status
    function updateProgramStatus() {
        const currentWeek = getCurrentWeek();
        const phase = currentWeek <= 6 ? 1 : 2;

        elements.currentWeek.textContent = `Week ${currentWeek} of 12`;
        elements.programPhase.textContent = `Phase ${phase}`;
        elements.nextWorkout.textContent = getNextWorkout();
    }

    // Get current week
    function getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - state.programStart) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    // Get next workout
    function getNextWorkout() {
        const today = new Date();
        const day = today.getDay();
        
        if (day === 1 || day === 0) return 'Chest & Triceps (Monday)';
        if (day === 3 || day === 2) return 'Shoulders (Wednesday)';
        if (day === 5 || day === 4) return 'Back & Biceps (Friday)';
        return 'Rest Day (Weekend)';
    }

    // Update weekly progress
    function updateWeeklyProgress() {
        const workouts = dataManager.getWeeklyWorkouts(state.currentUser);
        const today = new Date().getDay();

        // Create dots for each day
        const dots = Array(7).fill('').map((_, index) => {
            let dotClass = 'progress-dot';
            if (workouts.includes(index)) {
                dotClass += ' dot-complete';
            } else if (index === today) {
                dotClass += ' dot-today';
            } else {
                dotClass += ' dot-upcoming';
            }
            return `<div class="${dotClass}"></div>`;
        });

        elements.weeklyDots.innerHTML = dots.join('');
        elements.workoutsComplete.textContent = 
            `${workouts.length} of 3 workouts complete this week`;
    }

    // Update today's workout
    function updateTodayWorkout() {
        const workout = getNextWorkout();
        elements.todayWorkout.textContent = workout;
        elements.startWorkoutBtn.disabled = workout.includes('Rest Day');
        
        if (workout.includes('Rest Day')) {
            elements.startWorkoutBtn.classList.add('opacity-50');
        } else {
            elements.startWorkoutBtn.classList.remove('opacity-50');
        }
    }

    // Update recent progress
    function updateRecentProgress() {
        const progress = dataManager.getRecentProgress(state.currentUser);
        
        if (!progress.length) {
            elements.recentProgress.innerHTML = 
                '<li class="text-gray-600">No recent progress recorded</li>';
            return;
        }

        elements.recentProgress.innerHTML = progress
            .slice(0, 3)
            .map(p => `
                <li class="mb-1">
                    ${p.exercise}: ${p.type === 'dumbbell' 
                        ? `${p.previousWeight}→${p.currentWeight} lbs`
                        : `${p.previousReps}→${p.currentReps} reps`}
                </li>
            `)
            .join('');
    }

    // Switch user
    function switchUser(user) {
        state.currentUser = user;
        dataManager.setCurrentUser(user);
        updateUserButtons();
        updateWeeklyProgress();
        updateRecentProgress();
    }

    // Setup event listeners
    function setupEventListeners() {
        // User switching
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));

        // Workout buttons
        elements.startWorkoutBtn.addEventListener('click', () => {
            const workout = getNextWorkout().split(' (')[0].toLowerCase().replace(/ & /g, '');
            window.location.href = `workout.html?type=${workout}&user=${state.currentUser}`;
            const workoutType = getCurrentWorkoutType(); // New function to add
        if (workoutType) {
            window.location.href = `workout.html?type=${workoutType}&user=${state.currentUser}`;
        });

        elements.chestTricepsBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=chestTriceps&user=${state.currentUser}`;
        });

        elements.shouldersBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=shoulders&user=${state.currentUser}`;
        });

        elements.backBicepsBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=backBiceps&user=${state.currentUser}`;
        });
    }
function getCurrentWorkoutType() {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    switch(day) {
        case 1: return 'chestTriceps';
        case 3: return 'shoulders';
        case 5: return 'backBiceps';
        default: return null;
    }
}
    // Start initialization
    initializeDashboard();
});
