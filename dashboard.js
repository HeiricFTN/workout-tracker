// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    const dataManager = new DataManager();
    
    // Cache DOM elements
    const elements = {
        dadButton: document.getElementById('dadButton'),
        alexButton: document.getElementById('alexButton'),
        chestTricepsBtn: document.getElementById('chestTricepsBtn'),
        shouldersBtn: document.getElementById('shouldersBtn'),
        backBicepsBtn: document.getElementById('backBicepsBtn')
    };

    // Initialize state
    const state = {
        currentUser: dataManager.getCurrentUser()
    };

    // Update UI based on current user
    function updateUserButtons() {
        // Dad button
        elements.dadButton.className = state.currentUser === 'Dad'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';

        // Alex button
        elements.alexButton.className = state.currentUser === 'Alex'
            ? 'flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg shadow'
            : 'flex-1 py-2 px-4 bg-gray-200 rounded-lg shadow';
    }

    // Switch user
    function switchUser(user) {
        state.currentUser = user;
        dataManager.setCurrentUser(user);
        updateUserButtons();
        console.log('Switched to user:', user);
    }

    // Setup workout buttons
    function setupWorkoutButtons() {
        elements.chestTricepsBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=chestTriceps&user=${state.currentUser}`;
        });

        elements.shouldersBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=shoulders&user=${state.currentUser}`;
        });

        elements.backBicepsBtn.addEventListener('click', () => {
            window.location.href = `workout.html?type=backBckBiceps&user=${state.currentUser}`;
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        elements.dadButton.addEventListener('click', () => switchUser('Dad'));
        elements.alexButton.addEventListener('click', () => switchUser('Alex'));
        setupWorkoutButtons();
    }

    // Initialize dashboard
    function initializeDashboard() {
        updateUserButtons();
        setupEventListeners();
        console.log('Dashboard initialized with user:', state.currentUser);
    }

    // Start initialization
    initializeDashboard();
});
