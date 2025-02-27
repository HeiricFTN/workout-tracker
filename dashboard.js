// dashboard.js
import dataManager from './dataManager.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Cache DOM elements
    const elements = {
        dadButton: document.getElementById('dadButton'),
        alexButton: document.getElementById('alexButton'),
        currentWeek: document.getElementById('currentWeek'),
        programPhase: document.getElementById('programPhase'),
        nextWorkout: document.getElementById('nextWorkout'),
        breatheProgress: document.getElementById('breatheProgress'),
        sweatProgress: document.getElementById('sweatProgress'),
        driveProgress: document.getElementById('driveProgress'),
        weeklyDots: document.getElementById('weeklyDots'),
        workoutsComplete: document.getElementById('workoutsComplete'),
        todayWorkout: document.getElementById('todayWorkout'),
        startWorkoutBtn: document.getElementById('startWorkoutBtn'),
        chestTricepsBtn: document.getElementById('chestTricepsBtn'),
        shouldersBtn: document.getElementById('shouldersBtn'),
        backBicepsBtn: document.getElementById('backBicepsBtn'),
        recentProgress: document.getElementById('recentProgress')
    };

    // Verify all elements exist
    Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
            console.error(`Missing element: ${key}`);
        }
    });

    // Initialize state
    const state = {
        currentUser: await dataManager.getCurrentUser() || 'Dad',
        programStart: new Date('2025-02-18'),
        workouts: ['Chest & Triceps', 'Shoulders', 'Back & Biceps']
    };

    // Setup event listeners first
    function setupEventListeners() {
        // User switching
        elements.dadButton?.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton?.addEventListener('click', () => switchUser('Alex'));

        // Direct workout buttons
        elements.chestTricepsBtn?.addEventListener('click', () => {
            navigateToWorkout('chestTriceps');
        });

        elements.shouldersBtn?.addEventListener('click', () => {
            navigateToWorkout('shoulders');
        });

        elements.backBicepsBtn?.addEventListener('click', () => {
            navigateToWorkout('backBiceps');
        });

        // Start workout button
        elements.startWorkoutBtn?.addEventListener('click', () => {
            const workoutType = getCurrentWorkoutType();
            if (workoutType) {
                navigateToWorkout(workoutType);
            }
        });
    }

    function navigateToWorkout(type) {
        window.location.href = `workout.html?type=${type}&user=${state.currentUser}`;
    }

    // Update user buttons
    function updateUserButtons() {
        const baseClasses = 'flex-1 py-2 px-4 rounded-lg shadow';
        const activeClasses = 'bg-blue-500 text-white';
        const inactiveClasses = 'bg-gray-200';

        if (elements.dadButton) {
            elements.dadButton.className = `${baseClasses} ${state.currentUser === 'Dad' ? activeClasses : inactiveClasses}`;
        }
        if (elements.alexButton) {
            elements.alexButton.className = `${baseClasses} ${state.currentUser === 'Alex' ? activeClasses : inactiveClasses}`;
        }
    }

    // Update program status
    function updateProgramStatus() {
        const currentWeek = getCurrentWeek();
        const phase = currentWeek <= 6 ? 1 : 2;

        if (elements.currentWeek) {
            elements.currentWeek.textContent = `Week ${currentWeek} of 12`;
        }
        if (elements.programPhase) {
            elements.programPhase.textContent = `Phase ${phase}`;
        }
        if (elements.nextWorkout) {
            elements.nextWorkout.textContent = getNextWorkout();
        }
    }

    // Update rowing progress
    async function updateRowingProgress() {
        try {
            const progress = await dataManager.getProgress(state.currentUser);
            updateRowingType('Breathe', elements.breatheProgress, progress);
            updateRowingType('Sweat', elements.sweatProgress, progress);
            updateRowingType('Drive', elements.driveProgress, progress);
        } catch (error) {
            console.error('Error updating rowing progress:', error);
        }
    }

    function updateRowingType(type, element, progress) {
        if (!element) return;

        const rowingKey = `rowing_${type}`;
        const rowingData = progress?.[rowingKey];

        if (rowingData?.history?.length > 0) {
            const recent = rowingData.history[rowingData.history.length - 1];
            const bestPace = rowingData.personalBest?.pace || 0;
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
            if (!elements.weeklyDots) return;

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
            if (elements.workoutsComplete) {
                elements.workoutsComplete.textContent = 
                    `${workouts.length} of 3 workouts complete this week`;
            }
        } catch (error) {
            console.error('Error updating weekly progress:', error);
        }
    }

    // Update today's workout
    function updateTodayWorkout() {
        if (!elements.todayWorkout || !elements.startWorkoutBtn) return;

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
        if (!elements.recentProgress) return;

        try {
            const progress = await dataManager.getRecentProgress(state.currentUser);
            
            if (!progress || progress.length === 0) {
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
            await dataManager.setCurrentUser(user);
            updateUserButtons();
            await updateWeeklyProgress();
            await updateRowingProgress();
            await updateRecentProgress();
        } catch (error) {
            console.error('Error switching user:', error);
        }
    }

    // Initialize dashboard
    async function initializeDashboard() {
        try {
            setupEventListeners(); // Setup listeners first
            updateUserButtons();
            updateProgramStatus();
            await updateWeeklyProgress();
            updateTodayWorkout();
            await updateRowingProgress();
            await updateRecentProgress();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // Start initialization
    await initializeDashboard();
});
