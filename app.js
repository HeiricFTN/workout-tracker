// app.js - Main application logic and initialization

class WorkoutApp {
    constructor() {
        this.currentUser = null;
        this.currentPhase = null;
        this.currentWorkout = null;
        this.dataManager = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        console.log('Initializing WorkoutApp...');

        try {
            // Initialize core components
            await this.initializeDataManager();
            await this.loadCurrentUser();
            await this.determineCurrentPhase();
            this.setupEventListeners();
            this.initializeUI();

            this.isInitialized = true;
            console.log('WorkoutApp Initialized Successfully');
        } catch (error) {
            console.error('Failed to initialize WorkoutApp:', error);
        }
    }

    async initializeDataManager() {
        try {
            this.dataManager = {
                async getItem(key) {
                    return localStorage.getItem(key);
                },
                async setItem(key, value) {
                    localStorage.setItem(key, value);
                },
                async removeItem(key) {
                    localStorage.removeItem(key);
                }
            };
            console.log('DataManager initialized');
        } catch (error) {
            console.error('Failed to initialize data manager:', error);
            throw error;
        }
    }

    async loadCurrentUser() {
        try {
            const savedUser = await this.dataManager.getItem('currentUser');
            this.currentUser = savedUser || 'Dad';
            console.log('Current user loaded:', this.currentUser);
            this.updateUserUI();
        } catch (error) {
            console.error('Failed to load user:', error);
            this.currentUser = 'Dad'; // Default fallback
        }
    }

    async determineCurrentPhase() {
        try {
            const startDate = new Date('2025-02-18');
            const today = new Date();
            const weeksDiff = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
            this.currentPhase = weeksDiff < 12 ? 'phase1' : 'phase2';
            console.log('Current phase determined:', this.currentPhase);
            this.updatePhaseUI();
        } catch (error) {
            console.error('Failed to determine phase:', error);
            this.currentPhase = 'phase1'; // Default fallback
        }
    }

    setupEventListeners() {
        // User switching
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');

        if (dadButton) {
            dadButton.addEventListener('click', () => this.switchUser('Dad'));
        }
        if (alexButton) {
            alexButton.addEventListener('click',k', () => this.switchUser('Alex'));
        }

        console.log('Event listeners set up');
    }

    async switchUser(user) {
        console.log('Switching to user:',:', user);
        try {
            this.currentUser = user;
            await this.dataManager.setItem('currentUser', user);
            this.updateUserUI();
            this.updateWorkoutData();
            console.log('User switched successfully to:', user);
        } catch (error) {
            console.error('Error switching user:', error);
        }
    }

    updateUserUI() {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');

        if (dadButton && alexButton) {
            // Remove existing classes
            dadButton.classList.remove('bg-blue-500', 'bg-gray-200', 'text-white');
            alexButton.classList.remove('bg-blue-500', 'bg-gray-200', 'text-white');

            // Add appropriate classes
            if (this.currentUser === 'Dad') {
                dadButton.classList.add('bg-blue-500', 'text-white');
                alexButton.classList.add('bg-gray-200');
            } else {
                alexButton.classList.add('bg-blue-500', 'text-white');
                dadButton.classList.add('bg-gray-200');
            }
        }

        // Update user display if it exists
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.textContent = this.currentUser;
        }

        console.log('UI updated for user:', this.currentUser);
    }

    initializeUI() {
        this.updateUserUI();
        this.updatePhaseUI();
        console.log('UI initialized');
    }

    updatePhaseUI() {
        const phaseDisplay = document.getElementById('phaseDisplay');
        if (phaseDisplay) {
            phaseDisplay.textContent = `Phase ${this.currentPhase === 'phase1' ? '1' : '2'}`;
        }
    }

    async updateWorkoutData() {
        // Implement workout data update logic here
        console.log('Updating workout data for user:', this.currentUser);
    }

    // Helper method to check if an element exists
    elementExists(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
            return false;
        }
        return true;
    }
}

// Create and initialize the app
const app = new WorkoutApp();
document.addEventListener('DOMContentLoaded', () => app.init());

export default app;
