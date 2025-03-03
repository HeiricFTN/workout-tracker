// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    setDoc, 
    query, 
    where, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCt-35h-UfdO3WQeL7X7p43tatItPQ3cGw",
    authDomain: "workout-tracker-74d9c.firebaseapp.com",
    projectId: "workout-tracker-74d9c",
    storageBucket: "workout-tracker-74d9c.firebasestorage.app",
    messagingSenderId: "332414268122",
    appId: "1:332414268122:web:514002fffe27da80e1ebe3",
    measurementId: "G-RWFV5YVDQ1"
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication state
let isAuthenticated = true;

// Helper functions for data operations
const FirebaseHelper = {
    async saveWorkout(userId, workoutData) {
        try {
            const workoutRef = collection(db, 'workouts');
            await addDoc(workoutRef, {
                userId,
                ...workoutData,
                timestamp: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            return false;
        }
    },

    async getWorkouts(userId) {
        try {
            const q = query(
                collection(db, 'workouts'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting workouts:', error);
            return [];
        }
    },

    async saveProgress(userId, progressData) {
        try {
            const progressRef = doc(db, 'progress', userId);
            await setDoc(progressRef, progressData, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    },
const FirebaseHelper = {
    calculatePacePerFiveHundred(meters, minutes) {
        if (!meters || !minutes) return "0:00";
        
        // Calculate minutes per 500m
        const minutesPer500 = (minutes * 500) / meters;
        
        // Convert to minutes and seconds
        const mins = Math.floor(minutesPer500);
        const secs = Math.round((minutesPer500 - mins) * 60);
        
        // Format as M:SS
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

   async getProgress(userId) {
        try {
            const progressRef = doc(db, 'progress', userId);
            const docSnap = await getDoc(progressRef);
            return docSnap.exists() ? docSnap.data() : {};
        } catch (error) {
            console.error('Error getting progress:', error);
            return {};
        }
    },

    async getWorkoutProgress(userId, workoutName) {
        try {
            const progressRef = doc(db, 'workoutProgress', `${userId}_${workoutName}`);
            const docSnap = await getDoc(progressRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Error getting workout progress:', error);
            return null;
        }
    },

    async saveWorkoutProgress(userId, progressData) {
        try {
            const progressRef = doc(db, 'workoutProgress', `${userId}_${progressData.name}`);
            await setDoc(progressRef, {
                ...progressData,
                lastUpdated: new Date()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving workout progress:', error);
            return false;
        }
    },

    async isOnline() {
        try {
            const testRef = doc(db, '_health', 'online');
            await Promise.race([
                getDoc(testRef),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 5000)
                )
            ]);
            return true;
        } catch (error) {
            console.warn('Firebase connection check failed:', error);
            return false;
        }
    }
};

// Export initialized instances and helper
export { db, auth, FirebaseHelper };

console.log('Firebase config loaded successfully');
