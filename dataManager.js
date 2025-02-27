// dataManager.js
import firebaseService from './firebaseService.js';

class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };
        this.programStartDate = new Date('2025-02-18');
        this.initializeSync();
    }

    async initializeSync() {
        // Set up sync when online
        if (navigator.onLine) {
            await this.syncData();
        }
        window.addEventListener('online', async () => {
            await this.syncData();
        });
    }

    // User Management
    getCurrentUser() {
        return localStorage.getItem(this.storageKeys.currentUser) || 'Dad';
    }

    setCurrentUser(user) {
        localStorage.setItem(this.storageKeys.currentUser, user);
    }

    // Workout Management
    async saveWorkout(userId, workoutData) {
        try {
            // Save to Firebase
            await firebaseService.saveWorkout(userId, {
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek()
            });

            // Keep local storage in sync
            const workouts = await this.getWorkouts(userId);
            workouts.push(workoutData);
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));

            // Update progress
            await this.updateProgress(userId, workoutData);

            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            // Fallback to local storage only if Firebase fails
            this.saveWorkoutLocally(userId, workoutData);
            return false;
        }
    }

    saveWorkoutLocally(userId, workoutData) {
        const workouts = this.getWorkoutsLocal(userId);
        workouts.push({
            ...workoutData,
            date: new Date().toISOString(),
            week: this.getCurrentWeek(),
            pendingSync: true
        });
        localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
    }

    async getWorkouts(userId) {
        try {
            // Try Firebase first
            const workouts = await firebaseService.getWorkouts(userId);
            // Update local storage
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
            return workouts;
        } catch (error) {
            console.error('Error getting workouts:', error);
            return this.getWorkoutsLocal(userId);
        }
    }

    getWorkoutsLocal(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.workouts(userId)) || '[]');
    }

    async getWeeklyWorkouts(userId) {
        const currentWeek = this.getCurrentWeek();
        const workouts = await this.getWorkouts(userId);
        return workouts
            .filter(workout => workout.week === currentWeek)
            .map(workout => new Date(workout.date).getDay());
    }

    // Progress Management
    async updateProgress(userId, workoutData) {
        try {
            const progress = await this.getProgress(userId);
            
            // Update exercise progress
            this.updateExerciseProgress(progress, workoutData);
            
            // Update rowing progress
            if (workoutData.rowing) {
                this.updateRowingProgress(progress, workoutData.rowing);
            }

            // Save to Firebase
            await firebaseService.saveProgress(userId, progress);
            
            // Update local storage
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
        } catch (error) {
            console.error('Error updating progress:', error);
            // Save to local storage only
            this.updateProgressLocally(userId, workoutData);
        }
    }

    updateExerciseProgress(progress, workoutData) {
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

            this.updatePersonalBest(exerciseProgress, exercise);
        });
    }

    updateRowingProgress(progress, rowingData) {
        const rowingKey = `rowing_${rowingData.type}`;
        if (!progress[rowingKey]) {
            progress[rowingKey] = {
                history: [],
                personalBest: {}
            };
        }

        const pacePerMinute = rowingData.meters / rowingData.minutes;
        const rowingProgress = progress[rowingKey];

        rowingProgress.history.push({
            date: new Date().toISOString(),
            minutes: rowingData.minutes,
            meters: rowingData.meters,
            pace: pacePerMinute
        });

        if (!rowingProgress.personalBest.pace || pacePerMinute > rowingProgress.personalBest.pace) {
            rowingProgress.personalBest = {
                minutes: rowingData.minutes,
                meters: rowingData.meters,
                pace: pacePerMinute,
                date: new Date().toISOString()
            };
        }
    }

    async getProgress(userId) {
        try {
            const progress = await firebaseService.getProgress(userId);
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
            return progress;
        } catch (error) {
            console.error('Error getting progress:', error);
            return this.getProgressLocal(userId);
        }
    }

    getProgressLocal(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.progress(userId)) || '{}');
    }

    async getRecentProgress(userId) {
        const progress = await this.getProgress(userId);
        return this.processRecentProgress(progress);
    }

    processRecentProgress(progress) {
        const recentProgress = [];

        // Process exercise progress
        Object.entries(progress)
            .filter(([key]) => !key.startsWith('rowing_'))
            .forEach(([name, data]) => {
                this.processExerciseProgress(name, data, recentProgress);
            });

        // Process rowing progress
        ['Breathe', 'Sweat', 'Drive'].forEach(type => {
            this.processRowingProgress(type, progress, recentProgress);
        });

        return recentProgress.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Utility Functions
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    async syncData() {
        const currentUser = this.getCurrentUser();
        const localWorkouts = this.getWorkoutsLocal(currentUser)
            .filter(workout => workout.pendingSync);

        for (const workout of localWorkouts) {
            await this.saveWorkout(currentUser, workout);
        }
    }
}

// Create instance
const dataManager = new DataManager();
export default dataManager;
