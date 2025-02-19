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
        console.log('Current user:', this.currentUser);
    },

    setupEventListeners() {
        // User switching
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');
        const startButton = document.getElementById('startWorkoutBtn');

        if (dadButton) {
            dadButton.addEventListener('click', () => {
                console.log('Dad button clicked');
                this.switchUser('Dad');
            });
        }

        if (alexButton) {
            alexButton.addEventListener('click', () => {
                console.log('Alex button clicked');
                this.switchUser('Alex');
            });
        }

        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startWorkout();
            });
        }
    },
},

    switchUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', user);
        console.log('Switched to user:', user);
        this.updateUI();
    },

    updateUI() {
        this.updateUserButtons();
        this.updateTodayWorkout();
        this.updateWeeklyOverview();
        this.updateProgressCards();
    },

    updateUserButtons() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');

        if (dadButton && alexButton) {
            // Reset both buttons
            dadButton.className = 'flex-1 py-2 px-4 rounded-lg';
            alexButton.className = 'flex-1 py-2 px-4 rounded-lg';

            // Set active button
            if (this.currentUser === 'Dad') {
                dadButton.classList.add('bg-blue-500', 'text-white');
                alexButton.classList.add('bg-gray-200');
            } else {
                alexButton.on.classList.add('bg-blue-500', 'text-white');
                dadButton.classList.add('bg-gray-200');
            }
        }
    },

    updateTodayWorkout() {
        const workoutPreview = document.getElementById('workoutPreview');
        const startButton = document.getElementById('startWorkoutBtn');
        const today = new Date().getDay();
        let workout = 'Rest Day';

        if (today === 1) workout = 'Chest & Triceps';
        if (today === 3) workout = 'Shoulders';
        if (today === 5) workout = 'Back & Biceps';

        if (workoutPreview) {
            workoutPreview.textContent = workout;
        }

        if (startButton) {
            if (workout === 'Rest Day') {
                startButton.disabled = true;
                startButton.classList.remove('bg-green-500');
                startButton.classList.add('bg-gray-300');
            } else {
                startButton.disabled = false;
                startButton.classList.remove('bg-gray-300');
                startButton.classList.add('bg-green-500');
            }
        }
    },

    updateWeeklyOverview() {
        const dotsContainer = document.getElementById('weeklyDots');
        if (!dotsContainer) return;

        const today = new Date().getDay();
        const dots = [];

        for (let i = 0; i < 7; i++) {
            const isWorkoutDay = [1, 3, 5].includes(i);
            const isPastDay = i < today;
            let dotClass = 'w-3 h-3 rounded-full ';

            if (!isWorkoutDay) {
                dotClass += 'bg-gray-200';
            } else if (isPastDay) {
                dotClass += 'bg-green-500';
            } else if (i === today) {
                dotClass += 'bg-blue-500';
            } else {
                dotClass += 'bg-gray-300';
            }

            dots.push(`<div class="${dotClass}"></div>`);
        }

        dotsContainer.innerHTML = dots.join('');
    },

    updateProgressCards() {
        const sections = ['keyLifts', 'recentImprovements', 'nextTargets'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.textContent = 'Coming soon...';
            }
        });
    },

    startWorkout() {
        const today = new Date().getDay();
        let page = '';

        switch (today) {
            case 1:
                page = 'monday.html';
                break;
            case 3:
                page = 'wednesday.html';
                break;
            case 5:
                page = 'friday.html';
                break;
            default:
                console.log('No workout scheduled for today');
                return;
        }

        if (page) {
            console.log('Navigating to:', page);
            window.location.href = page;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing dashboard...');
    Dashboard.init();
});
