// dataManager.js
import { FirebaseHelper } from './firebase-config.js';

console.log('Loading DataManager...');

class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };
        this.programStartDate = new Date('2025-03-03');
        this.initializeSync();
    }

    async initializeSync() {
        try {
            // Set up sync when online
            if (navigator.onLine) {
                await this.syncData();
            }
            window.addEventListener('online', async () => {
                await this.syncData();
            });
            console.log('Data sync initialized');
        } catch (error) {
            console.error('Error initializing sync:', error);
        }
    }

    // User Management
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

    // Workout Management
    async saveWorkout(userId, workoutData) {
        try {
            const workoutWithMeta = {
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek()
            };

            // Save to Firebase
            await FirebaseHelper.saveWorkout(userId, workoutWithMeta);

            // Keep local storage in sync
            const workouts = await this.getWorkouts(userId);
            workouts.push(workoutWithMeta);
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));

            // Update progress
            await this.updateProgress(userId, workoutWithMeta);

            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            // Fallback to local storage only if Firebase fails
            this.saveWorkoutLocally(userId, workoutData);
            return false;
        }
    }

    saveWorkoutLocally(userId, workoutData) {
        try {
            const workouts = this.getWorkoutsLocal(userId);
            workouts.push({
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek(),
                pendingSync: true
            });
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
            console.log('Workout saved locally');
        } catch (error) {
            console.error('Error saving workout locally:', error);
        }
    }

    async getWorkouts(userId) {
        try {
            // Try Firebase first
            const workouts = await FirebaseHelper.getWorkouts(userId);
            // Update local storage
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
            return workouts;
        } catch (error) {
            console.error('Error getting workouts:', error);
            return this.getWorkoutsLocal(userId);
        }
    }

    getWorkoutsLocal(userId) {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.workouts(userId)) || '[]');
        } catch (error) {
            console.error('Error getting local workouts:', error);
            return [];
        }
    }
    // Weekly Progress
async getWeeklyWorkouts(userId) {
    try {
        const currentWeek = this.getCurrentWeek();
        const workouts = await this.getWorkouts(userId);
        const workoutDays = workouts
            .filter(workout => workout.week === currentWeek)
            .map(workout => new Date(workout.date).getDay());
        
        console.log('Weekly workouts:', workoutDays);
        return workoutDays;
    } catch (error) {
        console.error('Error getting weekly workouts:', error);
        return []; // Return empty array instead of test data [1, 3, 5]
    }
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
            await FirebaseHelper.saveProgress(userId, progress);
            
            // Update local storage
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
            
            return true;
        } catch (error) {
            console.error('Error updating progress:', error);
            // Save to local storage only
            this.updateProgressLocally(userId, workoutData);
            return false;
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
        pace: pacePerMinute,
        pacePerFiveHundred: this.calculatePacePerFiveHundred(rowingData.meters, rowingData.minutes)
    });

    if (!rowingProgress.personalBest.pace || pacePerMinute > rowingProgress.personalBest.pace) {
        rowingProgress.personalBest = {
            minutes: rowingData.minutes,
            meters: rowingData.meters,
            pace: pacePerMinute,
            pacePerFiveHundred: this.calculatePacePerFiveHundred(rowingData.meters, rowingData.minutes),
            date: new Date().toISOString()
        };
    }
}

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

    async getProgress(userId) {
        try {
            const progress = await FirebaseHelper.getProgress(userId);
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
            return progress;
        } catch (error) {
            console.error('Error getting progress:', error);
            return this.getProgressLocal(userId);
        }
    }

    getProgressLocal(userId) {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.progress(userId)) || '{}');
        } catch (error) {
            console.error('Error getting local progress:', error);
            return {};
        }
    }

async getRecentProgress(userId) {
    try {
        const progress = await this.getProgress(userId);
        if (!progress || typeof progress !== 'object') {
            console.warn('No valid progress data available for user:', userId);
            return [];
        }
        return this.processRecentProgress(progress);
    } catch (error) {
        console.error('Error getting recent progress:', error);
        return [];
    }
}

processRecentProgress(progress) {
    if (!progress || typeof progress !== 'object') {
        console.warn('Invalid progress data received in processRecentProgress');
        return [];
    }

    const recentProgress = [];

    // Process exercise progress
    Object.entries(progress)
        .filter(([key, value]) => key && value && !key.startsWith('rowing_') && Array.isArray(value.history))
        .forEach(([name, data]) => {
            if (data.history && data.history.length > 1) {
                const recent = data.history[data.history.length - 1];
                const previous = data.history[data.history.length - 2];
                
                if (recent && previous) {
                    recentProgress.push({
                        type: 'exercise',
                        exercise: name,
                        previousWeight: previous.weight || 0,
                        currentWeight: recent.weight || 0,
                        date: recent.date || new Date().toISOString()
                    });
                }
            }
        });

    // Process rowing progress
    ['Breathe', 'Sweat', 'Drive'].forEach(type => {
        const rowingKey = `rowing_${type}`;
        const rowingData = progress[rowingKey];
        
        if (rowingData && rowingData.history && rowingData.history.length > 1) {
            const recent = rowingData.history[rowingData.history.length - 1];
            const previous = rowingData.history[rowingData.history.length - 2];
            
            if (recent && previous) {
                recentProgress.push({
                    type: 'rowing',
                    exercise: type,
                    previousPace: Math.round(previous.pace || 0),
                    currentPace: Math.round(recent.pace || 0),
                    date: recent.date || new Date().toISOString()
                });
            }
        }
    });

    return recentProgress.sort((a, b) => new Date(b.date) - new Date(a.date));
}

calculatePacePerFiveHundred(meters, minutes) {
    if (!meters || !minutes) return "0:00";
    
    // Calculate minutes per 500m
    const minutesPer500 = (minutes * 500) / meters;
    
    // Convert to minutes and seconds
    const mins = Math.floor(minutesPer500);
    const secs = Math.round((minutesPer500 - mins) * 60);
    
    // Format as M:SS
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
    // Utility Functions
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    async syncData() {
        try {
            const currentUser = await this.getCurrentUser();
            const localWorkouts = this.getWorkoutsLocal(currentUser)
                .filter(workout => workout.pendingSync);

            for (const workout of localWorkouts) {
                await this.saveWorkout(currentUser, workout);
            }
            console.log('Data sync completed');
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    }
}

// Create instance
const dataManager = new DataManager();
export default dataManager;
