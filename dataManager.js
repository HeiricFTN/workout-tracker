// dataManager.js
import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`,
            lastSyncTime: 'lastSyncTime'
        };
        this.programStartDate = new Date('2025-02-18');
        this.isOnline = navigator.onLine;
        this.setupOnlineListener();
    }

    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncWithFirebase();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async syncWithFirebase() {
        const lastSyncTime = localStorage.getItem(this.storageKeys.lastSyncTime) || 0;
        const currentUser = this.getCurrentUser();

        // Sync workouts
        const workouts = await this.getWorkoutsLocal(currentUser);
        for (const workout of workouts) {
            if (new Date(workout.date).getTime() > lastSyncTime) {
                await this.saveWorkoutToFirebase(currentUser, workout);
            }
        }

        // Sync progress
        const progress = this.getProgressLocal(currentUser);
        await this.updateProgressInFirebase(currentUser, progress);

        localStorage.setItem(this.storageKeys.lastSyncTime, Date.now().toString());
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
            if (this.isOnline) {
                await this.saveWorkoutToFirebase(userId, workoutData);
            }
            await this.saveWorkoutLocally(userId, workoutData);
            await this.updateProgress(userId, workoutData);
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            return false;
        }
    }

    async saveWorkoutToFirebase(userId, workoutData) {
        const workoutRef = doc(collection(db, 'workouts'));
        const workoutWithMeta = {
            ...workoutData,
            date: new Date().toISOString(),
            week: this.getCurrentWeek(),
            userId: userId
        };
        await setDoc(workoutRef, workoutWithMeta);
    }

    async saveWorkoutLocally(userId, workoutData) {
        const workouts = this.getWorkoutsLocal(userId);
        const workoutWithMeta = {
            ...workoutData,
            date: new Date().toISOString(),
            week: this.getCurrentWeek()
        };
        workouts.push(workoutWithMeta);
        localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
    }

    async getWorkouts(userId) {
        try {
            if (this.isOnline) {
                const q = query(
                    collection(db, 'workouts'),
                    where('userId', '==', userId),
                    orderBy('date', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const workouts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
                return workouts;
            } else {
                return this.getWorkoutsLocal(userId);
            }
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
            let progress = await this.getProgress(userId);

            // Update exercise progress
            workoutData.exercises.forEach(exercise => {
                if (!progress[exercise.name]) {
                    progress[exercise.name] = {
                        history: [],
                        personalBest: {}
                    };
                }

                progress[exercise.name].history.push({
                    date: workoutData.date,
                    reps: exercise.reps,
                    weight: exercise.weight
                });

                if (exercise.type === 'dumbbell') {
                    if (!progress[exercise.name].personalBest.weight || 
                        exercise.weight > progress[exercise.name].personalBest.weight) {
                        progress[exercise.name].personalBest = {
                            weight: exercise.weight,
                            reps: exercise.reps,
                            date: workoutData.date
                        };
                    }
                } else if (exercise.reps > (progress[exercise.name].personalBest.reps || 0)) {
                    progress[exercise.name].personalBest = {
                        reps: exercise.reps,
                        date: workoutData.date
                    };
                }
            });

            // Update rowing progress
            if (workoutData.rowing) {
                const rowingKey = `rowing_${workoutData.rowing.type}`;
                if (!progress[rowingKey]) {
                    progress[rowingKey] = {
                        history: [],
                        personalBest: {}
                    };
                }

                const pacePerMinute = workoutData.rowing.meters / workoutData.rowing.minutes;

                progress[rowingKey].history.push({
                    date: workoutData.date,
                    minutes: workoutData.rowing.minutes,
                    meters: workoutData.rowing.meters,
                    pace: pacePerMinute
                });

                if (!progress[rowingKey].personalBest.pace || 
                    pacePerMinute > progress[rowingKey].personalBest.pace) {
                    progress[rowingKey].personalBest = {
                        minutes: workoutData.rowing.minutes,
                        meters: workoutData.rowing.meters,
                        pace: pacePerMinute,
                        date: workoutData.date
                    };
                }
            }

            if (this.isOnline) {
                await this.updateProgressInFirebase(userId, progress);
            }
            this.updateProgressLocally(userId, progress);
        } catch (error) {
            console.error('Error updating progress:', error);
            this.updateProgressLocally(userId, this.getProgressLocal(userId));
        }
    }

    async updateProgressInFirebase(userId, progress) {
        const progressRef = doc(db, 'progress', userId);
        await setDoc(progressRef, progress);
    }

    updateProgressLocally(userId, progress) {
        localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
    }

    async getProgress(userId) {
        try {
            if (this.isOnline) {
                const progressRef = doc(db, 'progress', userId);
                const progressDoc = await getDoc(progressRef);
                const progress = progressDoc.exists() ? progressDoc.data() : {};
                this.updateProgressLocally(userId, progress);
                return progress;
            } else {
                return this.getProgressLocal(userId);
            }
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
        const recentProgress = [];

        Object.entries(progress).forEach(([name, data]) => {
            if (data.history && data.history.length >= 2) {
                const recent = data.history.slice(-2);
                const current = recent[1];
                const previous = recent[0];

                if (name.startsWith('rowing_')) {
                    recentProgress.push({
                        exercise: name.replace('rowing_', ''),
                        type: 'rowing',
                        previousPace: Math.round(previous.pace),
                        currentPace: Math.round(current.pace),
                        date: current.date
                    });
                } else if (data.personalBest.weight !== undefined) {
                    recentProgress.push({
                        exercise: name,
                        type: 'dumbbell',
                        previousWeight: previous.weight,
                        currentWeight: current.weight,
                        date: current.date
                    });
                } else {
                    recentProgress.push({
                        exercise: name,
                        type: 'trx',
                        previousReps: previous.reps,
                        currentReps: current.reps,
                        date: current.date
                    });
                }
            }
        });

        return recentProgress.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }
}

// Create and export instance
const dataManager = new DataManager();
export default dataManager;
