// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

// Initialize Firebase with retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function initializeFirebaseWithRetry(retries = MAX_RETRIES) {
    try {
        console.log('Attempting Firebase initialization...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        console.log('Firebase initialized successfully');
        return { app, db, auth };
    } catch (error) {
        console.error('Firebase initialization error:', error);
        
        if (retries > 0) {
            console.log(`Retrying initialization... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return initializeFirebaseWithRetry(retries - 1);
        }
        
        console.error('Firebase initialization failed after all retries');
        return setupOfflineFallback();
    }
}

// Offline fallback setup
function setupOfflineFallback() {
    console.log('Setting up offline fallback');
    return {
        app: null,
        db: {
            collection: () => ({
                add: async () => ({}),
                get: async () => ({ docs: [] }),
                where: () => ({
                    get: async () => ({ docs: [] })
                })
            }),
            doc: () => ({
                set: async () => ({}),
                get: async () => ({ exists: false, data: () => ({}) }),
                update: async () => ({})
            })
        },
        auth: {
            currentUser: null,
            onAuthStateChanged: (callback) => callback(null)
        }
    };
}

// Initialize Firebase
let { app, db, auth } = await initializeFirebaseWithRetry();

// Helper functions
const FirebaseHelper = {
    isInitialized() {
        return !!app && !!db && !!auth;
    },

    async isOnline() {
        if (!db) return false;
        
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
            console.warn('Firebase connection check failed:', error);
            return false;
        }
    },

    getErrorMessage(error) {
        return error?.message || 'An unknown error occurred';
    },

    async reconnect() {
        try {
            const result = await initializeFirebaseWithRetry();
            app = result.app;
            db = result.db;
            auth = result.auth;
            return this.isInitialized();
        } catch (error) {
            console.error('Reconnection failed:', error);
            return false;
        }
    }
};

// Listen for online/offline status
if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
        console.log('Connection restored, attempting reconnection...');
        await FirebaseHelper.reconnect();
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost, switching to offline mode...');
        const fallback = setupOfflineFallback();
        db = fallback.db;
        auth = fallback.auth;
    });
}

// Export initialized instances and helper
export { db, auth, FirebaseHelper };
