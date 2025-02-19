const Dashboard = {
    currentUser: null,

    init() {
        console.log('Dashboard initializing...');
        this.loadCurrentUser();
        this.setupEventListeners();
        this.updateUI();
    },

    loadCurrentUser() {
        this.currentUser = localStorage.getItem('currentUser') || 'Dad';
        console.log('Current user loaded:', this.currentUser);
    },

    setupEventListeners() {
        console.log('Setting up event listeners');
        document.getElementById('dadButton').addEventListener('click', () => this.switchUser('Dad'));
        document.getElementById('alexButton').addEventListener('click', () => this.switchUser('Alex'));
        document.getElementById('startWorkoutBtn').addEventListener('click', () => this.startWorkout());
    },

    switchUser(user) {
        console.log('Switching to user:', user);
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        this.updateUI();
    },

    updateUI() {
        console.log('Updating UI');
        this.updateUserButtons();
        this.updateTodayWorkout();
        this.updateWeeklyOverview();
        this.updateProgressCards();
    },

    updateUserButtons() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        
        dadButton.classList.toggle('bg-blue-500', this.currentUser === 'Dad');
        dadButton.classList.toggle('text-white', this.currentUser === 'Dad');
        dadButton.classList.toggle('bg-gray-200', this.currentUser !== 'Dad');
        
        alexButton.classList.toggle('bg-blue-500', this.currentUser === 'Alex');
        alexButton.classList.toggle('text-white', this.currentUser === 'Alex');
        alexButton.classList.toggle('bg-gray-200', this.currentUser !== 'Alex');
    },

    updateTodayWorkout() {
        const workoutPreview = document.getElementById('workoutPreview');
        const today = new Date().getDay();
        let workout = 'Rest Day';
        
        if (today === 1) workout = 'Chest & Triceps';
        if (today === 3) workout = 'Shoulders';
        if (today === 5) workout = 'Back & Biceps';

        workoutPreview.textContent = workout;
        document.getElementById('startWorkoutBtn').disabled = workout === 'Rest Day';
    },

    updateWeeklyOverview() {
        const dotsContainer = document.getElementById('weeklyDots');
        const today = new Date().getDay();
        
        dotsContainer.innerHTML = Array(7).fill().map((_, i) => {
            const isWorkoutDay = [1, 3, 5].includes(i + 1);
            const isPastDay = i + 1 < today;
            let dotClass = 'w-3 h-3 rounded-full ';
            
            if (!isWorkoutDay) dotClass += 'bg-gray-200';
            else if (isPastDay) dotClass += 'bg-green-500';
            else if (i + 1 === today) dotClass += 'bg-blue-500';
            else dotClass += 'bg-gray-300';

            return `<div class="${dotClass}"></div>`;
        }).join('');
    },

    updateProgressCards() {
        // Placeholder for progress data
        document.getElementById('keyLifts').textContent = 'Progress data coming soon';
        document.getElementById('recentImprovements').textContent = 'Improvements data coming soon';
        document.getElementById('nextTargets').textContent = 'Targets data coming soon';
    },

    startWorkout() {
        const today = new Date().getDay();
        if (today === 1) window.location.href = 'monday.html';
        if (today === 3) window.location.href = 'wednesday.html';
        if (today === 5) window.location.href = 'friday.html';
    }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
