// dashboard.js
import dataManager from './dataManager.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Cache DOM elements
    const elements = {
        // User buttons
        dadButton: document.getElementById('dadButton'),
        alexButton: document.getElementById('alexButton'),

        // Program status
        currentWeek: document.getElementById('currentWeek'),
        programPhase: document.getElementById('programPhase'),
        nextWorkout: document.getElementById('nextWorkout'),

        // Rowing progress
        breatheProgress: document.getElementById('breatheProgress'),
        sweatProgress: document.getElementById('sweatProgress'),
        driveProgress: document.getElementById('driveProgress'),

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
    async function initializeDashboard() {
        try {
            updateUserButtons();
            updateProgramStatus();
            await updateWeeklyProgress();
            updateTodayWorkout();
            await updateRowingProgress();
            setupEventListeners();
            await updateRecentProgress();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
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

    // Update rowing progress
    async function updateRowingProgress() {
        try {
            const progress = await dataManager.getProgress(state.currentUser);
            await updateRowingType('Breathe', elements.breatheProgress, progress);
            await updateRowingType('Sweat', elements.sweatProgress, progress);
            await updateRowingType('Drive', elements.driveProgress, progress);
        } catch (error) {
            console.error('Error updating rowing progress:', error);
        }
    }

    async function updateRowingType(type, element, progress) {
        const rowingKey = `rowing_${type}`;
        const rowingData = progress[rowingKey];

        if (rowingData && rowingData.history.length > 0) {
            const recent = rowingData.history[rowingData.history.length - 1];
            const bestPace = rowingData.personalBest.pace;
            element.textContent = `${Math.round(recent.pace)} m/min (Best: ${Math.round(bestPace)})`;
        } else {
            element.textContent = 'No data';
        }
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

    // Get current workout type
    function getCurrentWorkoutType() {
        const day = new Date().getDay();
        switch(day) {
            case 1: return 'chestTriceps';
            case 3: return 'shoulders';
            case 5: return 'backBiceps';
            default: return null;
        }
    }

    // Update weekly progress
    async function updateWeeklyProgress() {
        try {
            const workouts = await dataManager.getWeeklyWorkouts(state.currentUser);
            const today = new Date().getDay();
            const dayLabels = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

            const dotsAndLabels = Array(7).fill('').map((_, index) => {
                let dotClass = 'progress-dot';
                if (workouts.includes(index)) {
                    dotClass += ' dot-complete';
                } else if (index === today) {
                    dotClass += ' dot-today';
                } else {
                    dotClass += ' dot-upcoming';
                }
                return `
                    <div class="flex flex-col items-center">
                        <span class="text-xs text-gray-600 mb-1">${dayLabels[index]}</span>
                        <div class="${dotClass}"></div>
                    </div>
                `;
            });

            elements.weeklyDots.innerHTML = dotsAndLabels.join('');
            elements.workoutsComplete.textContent = 
                `${workouts.length} of 3 workouts complete this week`;
        } catch (error) {
            console.error('Error updating weekly progress:', error);
        }
    }

    // Update today's workout
    function updateTodayWorkout() {
        const workout = getNextWorkout();
        elements.todayWorkout.textContent = workout;
        
        const workoutType = getCurrentWorkoutType();
        elements.startWorkoutBtn.disabled = !workoutType;
        
        if (!workoutType) {
            elements.startWorkoutBtn.classList.add('opacity-50');
        } else {
            elements.startWorkoutBtn.classList.remove('opacity-50');
        }
    }

    // Update recent progress
    async function updateRecentProgress() {
        try {
            const progress = await dataManager.getRecentProgress(state.currentUser);
            
            if (!progress.length) {
                elements.recentProgress.innerHTML = 
                    '<li class="text-gray-600">No recent progress recorded</li>';
                return;
            }

            elements.recentProgress.innerHTML = progress
                .slice(0, 3)
                .map(p => {
                    if (p.type === 'dumbbell') {
                        return `
                            <li class="mb-1">
                                ${p.exercise}: ${p.previousWeight}→${p.currentWeight} lbs
                            </li>`;
                    } else if (p.type === 'trx') {
                        return `
                            <li class="mb-1">
                                ${p.exercise}: ${p.previousReps}→${p.currentReps} reps
                            </li>`;
                    } else if (p.type === 'rowing') {
                        return `
                            <li class="mb-1">
                                ${p.exercise}: ${p.previousPace}→${p.currentPace} m/min
                            </li>`;
                    }
                })
                .join('');
        } catch (error) {
            console.error('Error updating recent progress:', error);
        }
    }

    // Switch user
    async function switchUser(user) {
        try {
            state.currentUser = user;
            dataManager.setCurrentUser(user);
            updateUserButtons();
            await updateWeeklyProgress();
            await updateRowingProgress();
            await updateRecentProgress();
        } catch (error) {
            console.error('Error switching user:', error);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // User switching
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));

        // Workout buttons
        elements.startWorkoutBtn.addEventListener('click', () => {
            const workoutType = getCurrentWorkoutType();
            if (workoutType) {
                window.location.href = `workout.html?type=${workoutType}&user=${state.currentUser}`;
            }
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

    // Start initialization
    await initializeDashboard();
});
