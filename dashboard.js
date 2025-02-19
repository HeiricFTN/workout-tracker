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
        
        // User switching
        document.getElementById('dadButton').addEventListener('click', () => {
            console.log('Dad button clicked');
            this.switchUser('Dad');
        });
        
        document.getElementById('alexButton').addEventListener('click', () => {
            console.log('Alex button clicked');
            this.switchUser('Alex');
        });

        // Workout starting
        document.getElementById('startWorkoutBtn')?.addEventListener('click', () => {
            this.startWorkout();
        });
    },

    switchUser(user) {
        console.log('Switching to user:', user);
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        this.updateUserButtons();
        this.updateUI();
    },

    updateUserButtons() {
        console.log('Updating user buttons for:', this.currentUser);
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');

        // Reset both buttons
        dadButton.classList.remove('bg-blue-500', 'text-white');
        alexButton.classList.remove('bg-blue-500', 'text-white');
        dadButton.classList.add('bg-gray-200');
        alexButton.classList.add('bg-gray-200');

        // Set active button
        if (this.currentUser === 'Dad') {
            dadButton.classList.remove('bg-gray-200');
            dadButton.classList.add('bg-blue-500', 'text-white');
        } else {
            alexButtonton.classList.remove('bg-gray-200');
            alexButton.classList.add('bg-blue-500', 'text-white');
        }
    },

    updateUI() {
        console.log('Updating UI');
        this.updateUserButtons();
        this.updateTodayWorkout();
        this.updateWeeklyOverview();
        this.updateProgress();
    },

    updateTodayWorkout() {
        const today = new Date().getDay(); // 0-6
        const workoutDiv = document.getElementById('todayWorkout');
        const quickStartDiv = document.getElementById('quickStart');

        if ([1, 3, 5].includes(today)) { // Monday, Wednesday, Friday
            let workout = '';
            if (today === 1) workout = 'Chest & Triceps';
            if (today === 3) workout = 'Shoulders';
            if (today === 5) workout = 'Back & Biceps';

            workoutDiv.textContent = workout;
            quickStartDiv.innerHTML = `
                <button onclick="Dashboard.startWorkout()" 
                        class="w-full py-2 bg-green-500 text-white rounded-lg shadow">
                    Start Workout
                </button>
            `;
        } else {
            workoutDiv.textContent = 'Rest Day';
            quickStartDiv.innerHTML = `
                <button class="w-full py-2 bg-gray-300 text-gray-600 rounded-lg shadow" disabled>
                    Rest & Recover
                </button>
            `;
        }
    },

    updateWeeklyOverview() {
        const dotsContainer = document.getElementById('weeklyDots');
        const today = new Date().getDay();

        if (dotsContainer) {
            dotsContainer.innerHTML = Array(7).fill().map((_, i) => {
                const isWorkoutDay = [1, 3, 5].includes(i);
                const isToday = i === today;
                let dotClass = 'w-3 h-3 rounded-full ';
                
                if (!isWorkoutDay) dotClass += 'bg-gray-200';
                else if (isToday) dotClass += 'bg-blue-500';
                else if (i < today) dotClass += 'bg-green-500';
                else dotClass += 'bg-gray-300';

                return `<div class="${dotClass}"></div>`;
            }).join('');
        }
    },

    updateProgress() {
        // Basic progress update
        const keyLifts = document.getElementById('keyLifts');
        if (keyLifts) {
            keyLifts.innerHTML = `
                <p class="text-sm text-gray-600">Progress tracking will be available after completing workouts.</p>
            `;
        }
    },

    startWorkout() {
        const today = new Date().getDay();
        let page = 'monday.html';
        
        if (today === 3) page = 'wednesday.html';
        if (today === 5) page = 'friday.html';
        
        window.location.href = page;
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Dashboard');
    Dashboard.init();
});
