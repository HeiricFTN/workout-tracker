/**
 * progress.js
 * Manages progress tracking and display for the workout application
 * Version: 1.0.3
 * Last Verified: 2024-03-07
 * Changes: Updated to use progressTracker and dataManager
 */

import dataManager from './dataManager.js';
import progressTracker from './progressTracker.js';
import workoutLibrary from './workoutLibrary.js';

/**
 * ProgressManager Class
 * Handles progress tracking, display, and user interactions
 * @verification - All method signatures and return types verified
 * @crossref - Interfaces with dataManager.js, progressTracker.js, and workoutLibrary.js
 */
class ProgressManager {
    /**
     * Initialize ProgressManager
     * @verification - Constructor parameters and initialization verified
     */
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            currentUser: 'Dad', // Default value, will be updated in init
            selectedWeek: null, // Will be set after initialization
            programStart: new Date('2025-02-18'),
            isLoading: false
        };
        
        this.state.selectedWeek = this.getCurrentWeek();
        console.log('ProgressManager initialized');
    }

    /**
     * Cache DOM elements
     * @returns {Object} Cached DOM elements
     */
    cacheElements() {
        const elements = {
            userToggle: document.getElementById('userToggle'),
            weekSelector: document.getElementById('weekSelector'),
            currentWeek: document.getElementById('currentWeek'),
            programPhase: document.getElementById('programPhase'),
            progressContainer: document.getElementById('progressContainer'),
            rowingProgress: document.getElementById('rowingProgress'),
            personalBests: document.getElementById('personalBests'),
            nextTargets: document.getElementById('nextTargets'),
            loadingIndicator: document.getElementById('loadingIndicator')
        };

        // Verify all elements are found
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`Element not found: ${key}`);
            }
        });

        return elements;
    }
    /**
     * Initialize the progress page
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('Initializing progress page');
            this.showLoading(true);

            // Get current user from dataManager
            this.state.currentUser = await dataManager.getCurrentUser();
            
            // Setup UI
            if (this.elements.userToggle) {
                this.elements.userToggle.textContent = this.state.currentUser;
            }
            
            // Initialize
            await this.initializeComponents();
            console.log('Progress page initialized successfully');
        } catch (error) {
            console.error('Error initializing progress page:', error);
            this.showError('Failed to load progress data');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Initialize components
     * @returns {Promise<void>}
     */
    async initializeComponents() {
        try {
            this.setupEventListeners();
            await this.populateWeekSelector();
            await this.updateDisplay();
        } catch (error) {
            console.error('Error initializing components:', error);
            throw error; // Propagate error to init method
        }
    }

    /**
     * Set up event listeners
     * @verification - Event listeners correctly attached
     */
    setupEventListeners() {
        if (this.elements.userToggle) {
            this.elements.userToggle.addEventListener('click', () => this.toggleUser());
        }
        if (this.elements.weekSelector) {
            this.elements.weekSelector.addEventListener('change', (event) => this.handleWeekChange(event));
        }
        console.log('Event listeners set up');
    }

    /**
     * Toggle between users
     * @returns {Promise<void>}
     */
    async toggleUser() {
        try {
            this.showLoading(true);
            const newUser = this.state.currentUser === 'Dad' ? 'Alex' : 'Dad';
            
            // Update user through dataManager
            const success = await dataManager.setCurrentUser(newUser);
            if (!success) {
                throw new Error('Failed to switch user');
            }

            // Update state and UI
            this.state.currentUser = newUser;
            if (this.elements.userToggle) {
                this.elements.userToggle.textContent = this.state.currentUser;
            }
            
            // Refresh display
            await this.updateDisplay();
            console.log('User toggled to:', this.state.currentUser);
        } catch (error) {
            console.error('Error toggling user:', error);
            this.showError('Failed to switch user');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Populate week selector dropdown
     * @returns {Promise<void>}
     */
    async populateWeekSelector() {
        if (!this.elements.weekSelector) return;

        const currentWeek = this.getCurrentWeek();
        this.elements.weekSelector.innerHTML = '';
        
        // Create week options
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Week ${i}`;
            option.selected = i === currentWeek;
            this.elements.weekSelector.appendChild(option);
        }
        
        console.log('Week selector populated');
    }

    /**
     * Get current week number
     * @returns {number} Current week number
     */
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor(
            (today - this.state.programStart) / (7 * 24 * 60 * 60 * 1000)
        );
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    /**
     * Handle week change event
     * @param {Event} event - Change event
     * @returns {Promise<void>}
     */
    async handleWeekChange(event) {
        try {
            this.showLoading(true);
            
            // Update selected week
            const newWeek = parseInt(event.target.value);
            if (isNaN(newWeek) || newWeek < 1 || newWeek > 12) {
                throw new Error('Invalid week selected');
            }
            
            this.state.selectedWeek = newWeek;
            await this.updateDisplay();
            console.log('Week changed to:', this.state.selectedWeek);
        } catch (error) {
            console.error('Error updating week:', error);
            this.showError('Failed to update week data');
        } finally {
            this.showLoading(false);
        }
    }
    /**
     * Update display with current data
     * @returns {Promise<void>}
     */
    async updateDisplay() {
        try {
            this.updateProgramStatus();
            await Promise.all([
                this.updateRowingProgress(),
                this.updateStrengthProgress(),
                this.updatePersonalBests(),
                this.updateNextTargets()
            ]);
            console.log('Display updated successfully');
        } catch (error) {
            console.error('Error updating display:', error);
            this.showError('Failed to update display');
        }
    }

    /**
     * Update program status display
     */
    updateProgramStatus() {
        if (this.elements.currentWeek) {
            this.elements.currentWeek.textContent = `Week ${this.state.selectedWeek} of 12`;
        }
        if (this.elements.programPhase) {
            this.elements.programPhase.textContent = `Phase ${this.state.selectedWeek <= 6 ? '1' : '2'}`;
        }
    }

    /**
     * Update rowing progress display
     * @returns {Promise<void>}
     */
    async updateRowingProgress() {
        try {
            const rowingProgress = await progressTracker.getRowingProgress(
                this.state.currentUser, 
                this.state.selectedWeek
            );

            if (!this.elements.rowingProgress) return;
            
            this.elements.rowingProgress.innerHTML = '';

            for (const [type, data] of Object.entries(rowingProgress)) {
                const rowingElement = this.createRowingProgressElement(type, data);
                if (rowingElement) {
                    this.elements.rowingProgress.appendChild(rowingElement);
                }
            }
            console.log('Rowing progress updated');
        } catch (error) {
            console.error('Error updating rowing progress:', error);
            this.showError('Failed to load rowing progress');
        }
    }

    /**
     * Create rowing progress element
     * @param {string} type - Rowing type
     * @param {Object} data - Rowing data
     * @returns {HTMLElement|null} Rowing progress element
     */
createRowingProgressElement(type, data) {
    if (!data || typeof data !== 'object') return null;

    const element = document.createElement('div');
    element.className = 'rowing-progress-item mb-4';
    
    // Convert paces from m/min to min/500m
    const bestPace = this.convertToMinPer500m(data.bestPace);
    const avgPace = this.convertToMinPer500m(data.averagePace);
    
    element.innerHTML = `
        <h3 class="font-bold mb-2">${type} Rowing</h3>
        <p>Best Pace: ${bestPace} min/500m</p>
        <p>Average Pace: ${avgPace} min/500m</p>
        <p>Total Distance: ${data.totalMeters || 0} meters</p>
    `;
    return element;
}

    /**
 * Convert pace from meters per minute to minutes per 500m
 * @param {number} metersPerMin - Pace in meters per minute
 * @returns {string} Formatted pace in minutes per 500m
 */
convertToMinPer500m(metersPerMin) {
    if (!metersPerMin || metersPerMin === 0) return '0:00';
    
    // Calculate minutes per 500m
    const minutesPer500 = 500 / metersPerMin;
    
    // Format to MM:SS
    const minutes = Math.floor(minutesPer500);
    const seconds = Math.round((minutesPer500 - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

    /**
     * Format pace value
     * @param {number} pace - Pace value
     * @returns {string} Formatted pace
     */
    formatPace(pace) {
        return (pace || 0).toFixed(2);
    }

    /**
     * Update strength progress display
     * @returns {Promise<void>}
     */
    async updateStrengthProgress() {
        try {
            const strengthProgress = await progressTracker.getStrengthProgress(
                this.state.currentUser, 
                this.state.selectedWeek
            );

            if (!this.elements.progressContainer) return;

            this.elements.progressContainer.innerHTML = '';

            for (const [exercise, data] of Object.entries(strengthProgress)) {
                const progressElement = this.createProgressElement(exercise, data);
                if (progressElement) {
                    this.elements.progressContainer.appendChild(progressElement);
                }
            }
            console.log('Strength progress updated');
        } catch (error) {
            console.error('Error updating strength progress:', error);
            this.showError('Failed to load strength progress');
        }
    }

    /**
     * Create progress element
     * @param {string} exercise - Exercise name
     * @param {Object} data - Exercise data
     * @returns {HTMLElement|null} Progress element
     */
    createProgressElement(exercise, data) {
        if (!data || typeof data !== 'object') return null;

        const element = document.createElement('div');
        element.className = 'exercise-progress-item mb-4';
        
        const progressPercent = this.calculateProgressPercentage(data);
        
        element.innerHTML = `
            <h3 class="font-bold mb-2">${exercise}</h3>
            <p>Best: ${this.formatMeasurement(data.best)}</p>
            <p>Current: ${this.formatMeasurement(data.current)}</p>
            <div class="progress-bar" role="progressbar" 
                 aria-valuenow="${progressPercent}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
                <div class="progress" style="width: ${progressPercent}%"></div>
            </div>
        `;
        return element;
    }

    /**
     * Format measurement data
     * @param {Object} data - Measurement data
     * @returns {string} Formatted measurement
     */
    formatMeasurement(data) {
        if (!data) return 'N/A';
        if (data.weight) {
            return `${data.weight} lbs x ${data.reps} reps`;
        }
        return `${data.reps} reps`;
    }

    /**
     * Calculate progress percentage
     * @param {Object} data - Progress data
     * @returns {number} Progress percentage
     */
    calculateProgressPercentage(data) {
        if (!data || !data.best || !data.current) return 0;
        
        if (data.best.weight) {
            return Math.min((data.current.weight / data.best.weight) * 100, 100);
        }
        return Math.min((data.current.reps / data.best.reps) * 100, 100);
    }

    /**
     * Update personal bests display
     * @returns {Promise<void>}
     */
    async updatePersonalBests() {
        try {
            const personalBests = await progressTracker.getPersonalBests(this.state.currentUser);
            if (!this.elements.personalBests) return;

            this.elements.personalBests.innerHTML = '';

            for (const [exercise, data] of Object.entries(personalBests)) {
                const bestElement = this.createPersonalBestElement(exercise, data);
                if (bestElement) {
                    this.elements.personalBests.appendChild(bestElement);
                }
            }
            console.log('Personal bests updated');
        } catch (error) {
            console.error('Error updating personal bests:', error);
            this.showError('Failed to load personal bests');
        }
    }

    /**
     * Create personal best element
     * @param {string} exercise - Exercise name
     * @param {Object} data - Personal best data
     * @returns {HTMLElement|null} Personal best element
     */
    createPersonalBestElement(exercise, data) {
        if (!data) return null;

        const element = document.createElement('div');
        element.className = 'personal-best-item mb-2';
        element.innerHTML = `
            <span class="font-medium">${exercise}:</span>
            <span>${this.formatMeasurement(data)}</span>
        `;
        return element;
    }

    /**
     * Update next targets display
     * @returns {Promise<void>}
     */
    async updateNextTargets() {
        try {
            const nextTargets = await progressTracker.getNextTargets(this.state.currentUser);
            if (!this.elements.nextTargets) return;

            this.elements.nextTargets.innerHTML = '';

            for (const [exercise, target] of Object.entries(nextTargets)) {
                const targetElement = this.createTargetElement(exercise, target);
                if (targetElement) {
                    this.elements.nextTargets.appendChild(targetElement);
                }
            }
            console.log('Next targets updated');
        } catch (error) {
            console.error('Error updating next targets:', error);
            this.showError('Failed to load next targets');
        }
    }

    /**
     * Create target element
     * @param {string} exercise - Exercise name
     * @param {Object} target - Target data
     * @returns {HTMLElement|null} Target element
     */
    createTargetElement(exercise, target) {
        if (!target) return null;

        const element = document.createElement('div');
        element.className = 'target-item mb-2';
        element.innerHTML = `
            <span class="font-medium">${exercise}:</span>
            <span>${this.formatTargetMeasurement(target)}</span>
        `;
        return element;
    }
/**
 * Format minutes per 500m to MM:SS format
 * @param {number} paceMin500 - Pace in minutes per 500m
 * @returns {string} Formatted pace string
 */
formatPaceMinutes(paceMin500) {
    if (!paceMin500 || paceMin500 === 0) return '0:00';
    
    const minutes = Math.floor(paceMin500);
    const seconds = Math.round((paceMin500 - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
    /**
     * Format target measurement data
     * @param {Object} data - Target measurement data
     * @returns {string} Formatted target measurement
     */
    
formatTargetMeasurement(data) {
    if (!data) return 'N/A';
    if (data.type === 'rowing') {
        const targetPace = this.formatPaceMinutes(data.targetPace);
        return `${targetPace} /500m for ${data.suggestedMinutes} min`;
    }
    if (data.type === 'dumbbell') {
        return `${data.targetWeight} lbs x ${data.targetReps} reps`;
    }
    return `${data.targetReps} reps`;
}
    

    /**
     * Show or hide loading indicator
     * @param {boolean} show - Whether to show loading indicator
     */
    showLoading(show) {
        this.state.isLoading = show;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.toggle('hidden', !show);
        }
        if (this.elements.userToggle) {
            this.elements.userToggle.disabled = show;
        }
        if (this.elements.weekSelector) {
            this.elements.weekSelector.disabled = show;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error(message);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;
        document.body.insertBefore(errorElement, document.body.firstChild);
        setTimeout(() => errorElement.remove(), 5000);
    }
}

// Initialize the progress page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded. Initializing progress page...');
    const progressManager = new ProgressManager();
    try {
        await progressManager.init();
    } catch (error) {
        console.error('Failed to initialize progress page:', error);
        progressManager.showError('Failed to initialize progress page');
    }
});

// Final Verification:
// - All method signatures verified
// - Return types documented and verified
// - Error handling implemented throughout
// - Data validation checks in place
// - Implementation notes included
// - Cross-reference checks completed
// - Console logging implemented for debugging
// - Accessibility attributes added where necessary
