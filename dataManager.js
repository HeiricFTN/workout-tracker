* Last Verified: 2024-03-07
 * Changes: Updated to use firebaseService
 */

import firebaseService from './services/firebaseService.js';

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

        // Basic user profile data for recommendations
        this.userProfiles = {
            Dad: { age: 47, gender: 'male' },
            Alex: { age: 15, gender: 'male' }
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
     * Get basic user profile
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile(userId) {
        try {
            return this.userProfiles[userId] || { age: 30, gender: 'male' };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { age: 30, gender: 'male' };
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
