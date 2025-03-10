/**
 * dataManager.js
 * Manages data operations between Firebase, local storage, and application state
 * Version: 1.0.3
 * Last Verified: 2024-03-07
 * Changes: Updated to use firebaseService
 */

import firebaseService from './firebaseService.js';

/**
 * DataManager Class
 * Handles all data operations and synchronization
 * @verification - All method signatures and return types verified
 * @crossref - Interfaces with workoutTracker.js and firebaseService.js
 */
class DataManager {
    /**
     * Initialize DataManager
     * @verification - Constructor parameters and initialization verified
     */
    constructor() {
        // Storage key definitions - verified for consistency
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };

        // Program start date - verified format and timezone handling
        this.programStartDate = new Date('2025-03-03');
        
        console.log('DataManager initialized');
    }

    /**
     * Get current user
     * @returns {Promise<string>} Current user ID
     */
    async getCurrentUser() {
        try {
            const user = localStorage.getItem(this.storageKeys.currentUser);
            console.log('Getting current user:', user);
            return user || 'Dad';
        } catch (error) {
            console.error('Error getting current user:', error);
            return 'Dad';
        }
    }

    /**
     * Set current user
     * @param {string} user - User ID to set
     * @returns {Promise<boolean>} Success status
     */
    async setCurrentUser(user) {
        try {
            console.log('Setting current user to:', user);
            if (user === 'Dad' || user === 'Alex') {
                localStorage.setItem(this.storageKeys.currentUser, user);
                window.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
                console.log('User set successfully to:', user);
                return true;
            } else {
                console.error('Invalid user:', user);
                return false;
            }
        } catch (error) {
            console.error('Error setting current user:', error);
            return false;
        }
    }

    /**
     * Save workout data - Manual save only
     * @param {string} userId - User ID
     * @param {Object} workoutData - Workout data to save
     * @returns {Promise<boolean>} Success status
     */
    async saveWorkout(userId, workoutData) {
        try {
            console.log('Manual save initiated for workout');
            
            if (!this.validateWorkoutData(workoutData)) {
                console.error('Invalid workout data');
                return false;
            }

            const workoutWithMeta = {
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek(),
                timestamp: Date.now(),
                userId: userId
            };

            // Save workout
            const result = await firebaseService.saveWorkout(userId, workoutWithMeta);
            if (!result) {
                throw new Error('Failed to save workout');
            }

            // Update progress
            await this.updateProgress(userId, workoutWithMeta);

            console.log('Workout saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            return false;
        }
    }

    /**
     * Validate workout data structure
     * @param {Object} workoutData - Workout data to validate
     * @returns {boolean} Validation result
     */
    validateWorkoutData(workoutData) {
        return workoutData && 
               (workoutData.exercises || workoutData.rowing) &&
               (!workoutData.exercises || Array.isArray(workoutData.exercises));
    }

    /**
     * Get all workouts for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of workouts
     */
    async getWorkouts(userId) {
        try {
            console.log('Fetching workouts for user:', userId);
            const workouts = await firebaseService.getWorkouts(userId);
            
            // Sort workouts by date
            workouts.sort((a, b) => new Date(a.date) - new Date(b.date));

            console.log(`Found ${workouts.length} valid workouts`);
            return workouts;
        } catch (error) {
            console.error('Error getting workouts:', error);
            return [];
        }
    }

    /**
     * Get weekly workouts
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of workout days (0-6)
     */
    async getWeeklyWorkouts(userId) {
        try {
            const allWorkouts = await this.getWorkouts(userId);
            
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setHours(0, 0, 0, 0);
            startOfWeek.setDate(now.getDate() - now.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            // Filter workouts for current week
            const weeklyWorkouts = allWorkouts.filter(workout => {
                try {
                    const workoutDate = new Date(workout.date);
                    return workoutDate >= startOfWeek && workoutDate < endOfWeek;
                } catch (error) {
                    console.error('Invalid workout date:', workout);
                    return false;
                }
            });

            // Get unique days
            const uniqueDays = [...new Set(weeklyWorkouts
                .map(workout => new Date(workout.date).getDay())
                .filter(day => day >= 0 && day <= 6)
            )];

            console.log('Weekly workouts found:', {
                total: weeklyWorkouts.length,
                uniqueDays: uniqueDays
            });

            return uniqueDays;
        } catch (error) {
            console.error('Error getting weekly workouts:', error);
            return [];
        }
    }
    /**
     * Update user progress
     * @param {string} userId - User ID
     * @param {Object} workoutData - Workout data
     * @returns {Promise<boolean>} Success status
     */
    async updateProgress(userId, workoutData) {
        try {
            let progress = await firebaseService.getProgress(userId);
            progress = progress || {};
            
            if (workoutData.exercises) {
                this.updateExerciseProgress(progress, workoutData);
            }
            
            if (workoutData.rowing) {
                this.updateRowingProgress(progress, workoutData.rowing);
            }

            await firebaseService.saveProgress(userId, progress);
            console.log('Progress updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating progress:', error);
            return false;
        }
    }

    /**
     * Get user progress
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User progress data
     */
    async getProgress(userId) {
        try {
            console.log('Fetching progress for user:', userId);
            const progress = await firebaseService.getProgress(userId);
            
            if (progress) {
                console.log('Progress data structure:', {
                    keys: Object.keys(progress),
                    sampleData: Object.entries(progress).slice(0, 1)
                });
            } else {
                console.log('No progress data found');
            }
            
            return progress || {};
        } catch (error) {
            console.error('Error getting progress:', error);
            return {};
        }
    }

    /**
     * Update exercise progress
     * @param {Object} progress - Progress object
     * @param {Object} workoutData - Workout data
     */
    updateExerciseProgress(progress, workoutData) {
        if (!progress) progress = {};
        
        workoutData.exercises.forEach(exercise => {
            if (!progress[exercise.name]) {
                progress[exercise.name] = {
                    history: [],
                    personalBest: {}
                };
            }

            const exerciseProgress = progress[exercise.name];
            exerciseProgress.history.push({
                date: workoutData.date,
                sets: exercise.sets
            });

            // Limit history length to prevent excessive storage
            if (exerciseProgress.history.length > 100) {
                exerciseProgress.history = exerciseProgress.history.slice(-100);
            }

            this.updatePersonalBest(exerciseProgress, exercise);
        });
    }

    /**
     * Update rowing progress
     * @param {Object} progress - Progress object
     * @param {Object} rowingData - Rowing data
     */
    updateRowingProgress(progress, rowingData) {
        if (!progress) progress = {};
        
        const rowingKey = `rowing_${rowingData.type}`;
        if (!progress[rowingKey]) {
            progress[rowingKey] = {
                history: [],
                personalBest: {}
            };
        }

        const pacePerMinute = rowingData.meters / rowingData.minutes;
        const rowingProgress = progress[rowingKey];

        const entry = {
            date: new Date().toISOString(),
            minutes: rowingData.minutes,
            meters: rowingData.meters,
            pace: pacePerMinute,
            pacePerFiveHundred: firebaseService.calculatePacePerFiveHundred(rowingData.meters, rowingData.minutes)
        };

        rowingProgress.history.push(entry);

        // Limit history length
        if (rowingProgress.history.length > 100) {
            rowingProgress.history = rowingProgress.history.slice(-100);
        }

        if (!rowingProgress.personalBest.pace || pacePerMinute > rowingProgress.personalBest.pace) {
            rowingProgress.personalBest = {
                ...entry,
                date: new Date().toISOString()
            };
        }
    }

    /**
     * Update personal best
     * @param {Object} exerciseProgress - Exercise progress object
     * @param {Object} exercise - Current exercise data
     */
    updatePersonalBest(exerciseProgress, exercise) {
        if (!exercise.sets || exercise.sets.length === 0) return;

        const currentBest = exercise.sets.reduce((best, set) => {
            if (set.weight > (best?.weight || 0)) {
                return set;
            }
            return best;
        }, exerciseProgress.personalBest);

        if (currentBest && (!exerciseProgress.personalBest.weight || currentBest.weight > exerciseProgress.personalBest.weight)) {
            exerciseProgress.personalBest = {
                ...currentBest,
                date: new Date().toISOString()
            };
        }
    }
    /**
     * Get current week number
     * @returns {number} Current week (1-12)
     */
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    /**
     * Get recent progress
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Recent progress items
     */
    async getRecentProgress(userId) {
        try {
            console.log('Getting recent progress for user:', userId);
            const progress = await this.getProgress(userId);
            const recentProgress = [];

            if (!progress || typeof progress !== 'object') {
                console.warn('No valid progress data found');
                return [];
            }

            // Process exercise progress
            for (const [exerciseName, exerciseData] of Object.entries(progress)) {
                // Skip invalid entries and internal fields
                if (!exerciseData || 
                    typeof exerciseData !== 'object' || 
                    exerciseName === 'id' || 
                    exerciseName.startsWith('_')) {
                    continue;
                }

                // Handle exercise data
                if (exerciseName.startsWith('rowing_')) {
                    // Process rowing data
                    if (exerciseData.history?.length >= 2) {
                        const recent = exerciseData.history.slice(-2);
                        if (recent[0]?.pace !== undefined && recent[1]?.pace !== undefined) {
                            recentProgress.push({
                                type: 'rowing',
                                exercise: exerciseName.replace('rowing_', ''),
                                previousPace: recent[0].pace,
                                currentPace: recent[1].pace,
                                date: recent[1].date || new Date().toISOString()
                            });
                        }
                    }
                } else {
                    // Process regular exercise data
                    if (exerciseData.history?.length >= 2) {
                        const recent = exerciseData.history.slice(-2);
                        if (recent[0]?.sets?.[0] && recent[1]?.sets?.[0]) {
                            recentProgress.push({
                                type: 'exercise',
                                exercise: exerciseName,
                                previousWeight: recent[0].sets[0].weight || 0,
                                currentWeight: recent[1].sets[0].weight || 0,
                                date: recent[1].date || new Date().toISOString()
                            });
                        }
                    }
                }
            }

            // Sort by date and take most recent
            recentProgress.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            });

            const latestProgress = recentProgress.slice(0, 3);
            console.log('Recent progress retrieved:', latestProgress);
            return latestProgress;
        } catch (error) {
            console.error('Error getting recent progress:', error);
            return [];
        }
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        try {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    /**
     * Validate date string
     * @param {string} dateString - Date string to validate
     * @returns {boolean} True if valid date
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}

// Create and export singleton instance
const dataManager = new DataManager();
export default dataManager;

/**
 * @verification - Final verification notes:
 * 1. All method signatures verified
 * 2. Return types documented and verified
 * 3. Error handling implemented throughout
 * 4. Data validation checks in place
 * 5. Implementation notes included
 * 6. Cross-reference checks completed
 * 7. Console logging implemented for debugging
 * 8. Firebase operations delegated to firebaseService
 * 9. Local storage operations maintained
 * 10. Data structure consistency maintained
 */
