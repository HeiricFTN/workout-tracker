// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCt-35h-UfdO3WQeL7X7p43tatItPQ3cGw",
    authDomain: "workout-tracker-74d9c.firebaseapp.com",
    projectId: "workout-tracker-74d9c",
    storageBucket: "workout-tracker-74d9c.firebasestorage.app",
    messagingSenderId: "************",
    appId: "1:332414268122:web:514002fffe27da80e1ebe3",
    measurementId: "G-RWFV5YVDQ1"
};

// Initialize Firebase immediately
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Offline fallback setup
function getOfflineFallback() {
    return {
        db: {
            collection: () => ({
                add: async () => ({}),
                get: async () => ({ docs: [] })
            }),
            doc: () => ({
                set: async () => ({}),
                get: async () => ({ exists: false, data: () => ({}) })
            })
        },
        auth: {
            currentUser: null,
            onAuthStateChanged: (callback) => callback(null)
        }
    };
}

// Helper functions
const FirebaseHelper = {
    isInitialized() {
        return !!app && !!db && !!auth;
    },

    async isOnline() {
        try {
            const testRef = db.collection('_test').doc('connection');
            await Promise.race([
                testRef.get(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 5000)
                )
            ]);
            return true;
        } catch (error) {
            consoleole.warn('Firebase connection check failed:', error);
            return false;
        }
    },

    getErrorMessage(error) {
        return error.message || 'An unknown error occurred';
    }
};

// Export initialized instances
export { db, auth, FirebaseHelper };
