// dashboard.js
import dataManager from './dataManager.js';

console.log('Starting dashboard script...');

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

// Log elements after they're defined
console.log('Elements found:', {
    weeklyDots: !!elements.weeklyDots,
    workoutsComplete: !!elements.workoutsComplete
});

// State management
let state = {
    currentUser: 'Dad',
    programStart: new Date('2025-02-18'),
    workouts: ['Chest & Triceps', 'Shoulders', 'Back & Biceps']
};

// Event Listeners Setup
function setupEventListeners() {
    console.log('Setting up event listeners');

    // User switching
    elements.dadButton?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Dad button clicked');
        await switchUser('Dad');
    });

    elements.alexButton?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Alex button clicked');
        await switchUser('Alex');
    });

    // Workout buttons
    elements.chestTricepsBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Chest & Triceps clicked');
        navigateToWorkout('chestTriceps');
    });

    elements.shouldersBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Shoulders clicked');
        navigateToWorkout('shoulders');
    });

    elements.backBicepsBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Back & Biceps clicked');
        navigateToWorkout('backBiceps');
    });

    // Start workout button
    elements.startWorkoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Start workout clicked');
        const workoutType = getCurrentWorkoutType();
        if (workoutType) {
            navigateToWorkout(workoutType);
        }
    });
}

// Navigation
function navigateToWorkout(type) {
    const url = `workout.html?type=${type}&user=${state.currentUser}`;
    console.log('Navigating to:', url);
    window.location.href = url;
}

// UI Updates
function updateUserButtons() {
    console.log('Updating user buttons for:', state.currentUser);
    
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

// Program Status
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

// Progress Updates
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

// Utility Functions
function getCurrentWeek() {
    const today = new Date();
    const weeksPassed = Math.floor((today - state.programStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(weeksPassed + 1, 1), 12);
}

function getNextWorkout() {
    const today = new Date();
    const day = today.getDay();
    
    if (day === 1 || day === 0) return 'Chest & Triceps (Monday)';
    if (day === 3 || day === 2) return 'Shoulders (Wednesday)';
    if (day === 5 || day === 4) return 'Back & Biceps (Friday)';
    return 'Rest Day (Weekend)';
}

function getCurrentWorkoutType() {
    const day = new Date().getDay();
    switch(day) {
        case 1: return 'chestTriceps';
        case 3: return 'shoulders';
        case 5: return 'backBiceps';
        default: return null;
    }
}

// Weekly Progress
async function updateWeeklyProgress() {
    console.log('Starting updateWeeklyProgress');
    try {
        const workouts = await dataManager.getWeeklyWorkouts(state.currentUser);
        console.log('Workouts received:', workouts);
        
        if (!elements.weeklyDots) {
            console.error('weeklyDots element not found');
            return;
        }

        const today = new Date().getDay();
        console.log('Today is day:', today);
        
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
        console.log('Dots HTML set:', elements.weeklyDots.innerHTML);
        
        if (elements.workoutsComplete) {
            elements.workoutsComplete.textContent = 
                `${workouts.length} of 3 workouts complete this week`;
        }
        
        console.log('Weekly progress updated successfully');
    } catch (error) {
        console.error('Error updating weekly progress:', error);
    }
}

// Today's Workout
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

// Recent Progress
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
                    return `<li class="mb-1">${p.exercise}: ${p.previousWeight}→${p.currentWeight} lbs</li>`;
                } else if (p.type === 'trx') {
                    return `<li class="mb-1">${p.exercise}: ${p.previousReps}→${p.currentReps} reps</li>`;
                } else if (p.type === 'rowing') {
                    return `<li class="mb-1">${p.exercise}: ${p.previousPace}→${p.currentPace} m/min</li>`;
                }
                return '';
            })
            .join('');
    } catch (error) {
        console.error('Error updating recent progress:', error);
    }
}

// User Switching
async function switchUser(user) {
    console.log('Switching to user:', user);
    try {
        state.currentUser = user;
        updateUserButtons(); // Update UI immediately
        await dataManager.setCurrentUser(user);
        
        // Update all dependent data
        await Promise.all([
            updateWeeklyProgress(),
            updateRowingProgress(),
            updateRecentProgress()
        ]);
        
        console.log('User switch completed:', user);
    } catch (error) {
        console.error('Error switching user:', error);
        // Revert state if save failed
        state.currentUser = await dataManager.getCurrentUser();
        updateUserButtons();
    }
}

// Initialize dashboard
async function initializeDashboard() {
    console.log('Starting initializeDashboard');
    try {
        // Get initial user
        state.currentUser = await dataManager.getCurrentUser();
        console.log('Current user:', state.currentUser);
        
        // Setup UI
        setupEventListeners();
        console.log('Event listeners set up');
        
        updateUserButtons();
        updateProgramStatus();
        updateTodayWorkout();
        
        // Load data
        console.log('Starting data updates...');
        await Promise.all([
            updateWeeklyProgress(),
            updateRowingProgress(),
            updateRecentProgress()
        ]);
        
        console.log('Dashboard initialization complete');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');
    try {
        // Wait for Firebase to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize dashboard
        await initializeDashboard();
        
        // Add global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });

        console.log('Complete initialization finished');
    } catch (error) {
        console.error('Critical initialization error:', error);
    }
});
