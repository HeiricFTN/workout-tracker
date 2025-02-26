// services/firebaseService.js
import { db, auth, FirebaseHelper } from '../firebase-config.js';

class FirebaseService {
    constructor() {
        this.db = db;
        this.auth = auth;
        this.isOnline = false;
        this.initializeConnectionListener();
    }

    async initializeConnectionListener() {
        this.isOnline = await FirebaseHelper.isOnline();
        // Add offline/online detection
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    }

    async handleConnectionChange(isOnline) {
        this.isOnline = isOnline;
        if (isOnline) {
            await this.syncOfflineData();
        }
    }

    // Workout Methods
    async saveWorkout(userId, workoutData) {
        try {
            const workoutRef = db.collection('workouts').doc();
            const timestamp = new Date().toISOString();
            
            const enrichedWorkoutData = {
                ...workoutData,
                userId,
                timestamp,
                syncedAt: this.isOnline ? timestamp : null
            };

            if (this.isOnline) {
                await workoutRef.set(enrichedWorkoutData);
            } else {
                // Save to local storage for later sync
                this.saveToOfflineStorage('pendingWorkouts', enrichedWorkoutData);
            }

            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            throw error;
        }
    }

    // Progress Methods
    async getProgress(userId) {
        try {
            if (!this.isOnline) {
                return this.getOfflineProgress(userId);
            }

            const progressRef = db.collection('progress').doc(userId);
            const doc = await progressRef.get();
            return doc.exists ? doc.data() : {};
        } catch (error) {
            console.error('Error getting progress:', error);
            return this.getOfflineProgress(userId);
        }
    }

    // Offline Support Methods
    saveToOfflineStorage(key, data) {
        const offlineData = JSON.parse(localStorage.getItem(key) || '[]');
        offlineData.push(data);
        localStorage.setItem(key, JSON.stringify(offlineData));
    }

    async syncOfflineData() {
        const pendingWorkouts = JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
        
        for (const workout of pendingWorkouts) {
            try {
                await this.saveWorkout(workout.userId, workout);
            } catch (error) {
                console.error('Error syncing workout:', error);
            }
        }

        localStorage.removeItem('pendingWorkouts');
    }

    // Error Handling
    handleError(error, operation) {
        console.error(`Error during ${operation}:`, error);
        // Implement error reporting here
        throw error;
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
