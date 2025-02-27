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

let app;
let db;
let auth;

async function initializeFirebase() {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized');

        // Initialize Firestore
        db = getFirestore(app);
        console.log('Firestore initialized');

        // Initialize Authentication
        auth = getAuth(app);
        console.log('Auth initialized');

        // No need to check connection immediately
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        setupOfflineFallback();
        return false;
    }
}

function setupOfflineFallback() {
    console.log('Setting up offline fallback');
    db = {
        collection: () => ({
            add: async () => ({}),
            get: async () => ({ docs: [] })
        }),
        doc: () => ({
            set: async () => ({}),
            get: async () => ({ exists: false, data: () => ({}) })
        })
    };
    
    auth = {
        currentUser: null,
        onAuthStateChanged: (callback) => callback(null)
    };
}

async function checkFirebaseConnection() {
    if (!db) return false;
    
    try {
        // Simple test query instead of healthcheck
        const testRef = db.collection('_test').doc('connection');
        await Promise.race([
            testRef.get(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            )
        ]);
        return true;
    } catch (error) {
        console.warn('Firebase connection check failed:', error);
        return false;
    }
}

const FirebaseHelper = {
    isInitialized() {
        return !!app && !!db && !!auth;
    },

    async isOnline() {
        return await checkFirebaseConnection();
    },

    getErrorMessage(error) {
        return error.message || 'An unknown error occurred';
    }
};

// Initialize Firebase immediately but don't wait for connection check
await initializeFirebase();

// Export the initialized instances
export { db, auth, FirebaseHelper };
