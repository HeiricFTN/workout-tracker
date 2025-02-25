// dataManager.js
import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };
        this.programStartDate = new Date('2025-02-18');
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
            const workoutRef = doc(collection(db, 'workouts'));
            const workoutWithMeta = {
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek(),
                userId: userId
            };

            await setDoc(workoutRef, workoutWithMeta);

            // Update progress
            await this.updateProgress(userId, workoutData);

            // Keep local storage for backup
            const workouts = await this.getWorkouts(userId);
            workouts.push(workoutWithMeta);
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));

            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            // Fallback to local storage if Firebase fails
            const workouts = this.getWorkoutsLocal(userId);
            workouts.push({
                ...workoutData,
                date: new Date().toISOString(),
                week: this.getCurrentWeek()
            });
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
            return false;
        }
    }

    async getWorkouts(userId) {
        try {
            // Try Firebase first
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

            // Update local storage for backup
            localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
            return workouts;
        } catch (error) {
            console.error('Error getting workouts:', error);
            // Fallback to local storage
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
            const progressRef = doc(db, 'progress', userId);
            const progressDoc = await getDoc(progressRef);
            let progress = progressDoc.exists() ? progressDoc.data() : {};

            // Update exercise progress
            workoutData.exercises.forEach(exercise => {
                if (!progress[exercise.name]) {
                    progress[exercise.name] = {
                        history: [],
                        personalBest: {}
                    };
                }

                // Add to history
                progress[exercise.name].history.push({
                    date: workoutData.date,
                    reps: exercise.reps,
                    weight: exercise.weight
                });

                // Update personal bests
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

                // Add to history
                progress[rowingKey].history.push({
                    date: workoutData.date,
                    minutes: workoutData.rowing.minutes,
                    meters: workoutData.rowing.meters,
                    pace: pacePerMinute
                });

                // Update personal bests
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

            // Save to Firebase
            await setDoc(progressRef, progress);

            // Update local storage for backup
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
        } catch (error) {
            console.error('Error updating progress:', error);
            // Fallback to local storage
            const progress = this.getProgressLocal(userId);
            // ... same progress update logic ...
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
        }
    }

    async getProgress(userId) {
        try {
            const progressRef = doc(db, 'progress', userId);
            const progressDoc = await getDoc(progressRef);
            const progress = progressDoc.exists() ? progressDoc.data() : {};
            
            // Update local storage for backup
            localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
            return progress;
        } catch (error) {
            console.error('Error getting progress:', error);
            // Fallback to local storage
            return this.getProgressLocal(userId);
        }
    }

    getProgressLocal(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.progress(userId)) || '{}');
    }

    // ... rest of the methods remain the same ...

    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }
}

// Create and export instance
const dataManager = new DataManager();
export default dataManager;
