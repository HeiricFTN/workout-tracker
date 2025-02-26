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

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore
    db = getFirestore(app);
    if (!db) {
        throw new Error('Firestore initialization failed');
    }

    // Initialize Authentication
    auth = getAuth(app);
    if (!auth) {
        throw new Error('Authentication initialization failed');
    }

    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Fallback initialization for offline functionality
    db = {
        collection: () => ({
            add: async () => {},
            get: async () => ({ docs: [] })
        }),
        doc: () => ({
            set: async () => {},
            get: async () => ({ exists: false, data: () => ({}) })
        })
    };
    
    auth = {
        currentUser: null,
        onAuthStateChanged: (callback) => callback(null)
    };
}

// Verify connection status
async function checkFirebaseConnection() {
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        const connectionPromise = db.collection('_healthcheck').doc('online').get();
        
        await Promise.race([timeoutPromise, connectionPromise]);
        return true;
    } catch (error) {
        console.warn('Firebase connection check failed:', error);
        return false;
    }
}

// Helper functions for other files
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

export { db, auth, FirebaseHelper };
