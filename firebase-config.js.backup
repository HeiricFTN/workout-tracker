// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Verify module loading
console.log('Loading firebase-config.js');

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Verify initialization
console.log('Firebase initialized:', !!app && !!db && !!auth);

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

    getOfflineFallback() {
        return {
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
};

// Handle offline/online status
if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
        console.log('Connection restored');
        try {
            await FirebaseHelper.isOnline();
            console.log('Firebase reconnected');
        } catch (error) {
            console.error('Firebase reconnection failed:', error);
        }
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost - switching to offline mode');
    });
}

// Export initialized instances and helper
export { db, auth, FirebaseHelper };

// Verify export
console.log('firebase-config.js loaded successfully');
