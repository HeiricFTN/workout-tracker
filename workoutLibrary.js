// workoutLibrary.js
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const workoutLibrary = {
    // Chest & Triceps Workout
    chestTriceps: {
        name: "Chest & Triceps",
        rowing: {
            name: "Hydrow Rowing",
            description: "Complete before strength training",
            types: ["Breathe", "Sweat", "Drive"]
        },
        supersets: [
            {
                exercises: [
                    {
                        name: "DB Bench Press",
                        description: "Lying on bench, press dumbbells up",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Row",
                        description: "Face anchor, pull chest to hands, squeeze shoulder blades",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Incline Press",
                        description: "Bench at 30°, press dumbbells up",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Face Pull",
                        description: "Face anchor, pull to face height, high elbows, external rotation",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Chest Fly",
                        description: "Lying on bench, wide arm circles",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Power Pull",
                        description: "Side to anchor, single-arm row with rotation",
                        type: "trx",
                        sets: 3
                    }
                ]
            }
        ]
    },

    // Shoulders Workout
    shoulders: {
        name: "Shoulders",
        rowing: {
            name: "Hydrow Rowing",
            description: "Complete before strength training",
            types: ["Breathe", "Sweat", "Drive"]
        },
        supersets: [
            {
                exercises: [
                    {
                        name: "DB Shoulder Press",
                        description: "Seated or standing, press dumbbells overhead",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Y-Raise",
                        description: "Face anchor, raise arms to Y position, focus on upper back",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Lateral Raise",
                        description: "Standing, raise arms to sides",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Row",
                        description: "Face anchor, pull chest to hands, elbows wide",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Front Raise",
                        description: "Standing, raise arms to front",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Reverse Fly",
                        description: "Face anchor, pull arms apart horizontally",
                        type: "trx",
                        sets: 3
                    }
                ]
            }
        ]
    },

    // Back & Biceps Workout
    backBiceps: {
        name: "Back & Biceps",
        rowing: {
            name: "Hydrow Rowing",
            description: "Complete before strength training",
            types: ["Breathe", "Sweat", "Drive"]
        },
        supersets: [
            {
                exercises: [
                    {
                        name: "DB Row",
                        description: "Bent over, pull dumbbells to ribs",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Tricep Extension",
                        description: "Face away from anchor, extend arms down",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Bicep Curl",
                        description: "Standing, curl dumbbells to shoulders",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Push-Up",
                        description: "Face away from anchor, perform push-up with handles",
                        type: "trx",
                        sets: 3
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Hammer Curl",
                        description: "Standing, curl with palms facing each other",
                        type: "dumbbell",
                        sets: 3
                    },
                    {
                        name: "TRX Chest Press",
                        description: "Face away from anchor, lean forward, press body up",
                        type: "trx",
                        sets: 3
                    }
                ]
            }
        ]
    }
};

// Enhanced Utility functions
const WorkoutLibrary = {
    // Original utility functions
    getWorkout(type) {
        return workoutLibrary[type] || null;
    },

    getExerciseType(exercise) {
        return exercise.type || 'dumbbell';
    },

    needsWeight(exercise) {
        return exercise.type === 'dumbbell';
    },

    getRowingTypes() {
        return ["Breathe", "Sweat", "Drive"];
    },

    calculateRowingPace(meters, minutes) {
        if (!minutes || minutes === 0) return 0;
        return Math.round(meters / minutes);
    },

    // Existing validation and formatting functions
    formatWorkoutForSave(workout) {
        return {
            ...workout,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
    },

    validateWorkout(workout) {
        if (!workout || !workout.name || !workout.supersets) {
            return false;
        }

        return workout.supersets.every(superset => 
            superset.exercises && 
            Array.isArray(superset.exercises) && 
            superset.exercises.every(exercise => 
                exercise.name && 
                exercise.description && 
                exercise.type && 
                exercise.sets
            )
        );
    },

    getExercisesByType(type) {
        const exercises = new Set();
        Object.values(workoutLibrary).forEach(workout => {
            workout.supersets.forEach(superset => {
                superset.exercises.forEach(exercise => {
                    if (exercise.type === type) {
                        exercises.add(exercise.name);
                    }
                });
            });
        });
        return Array.from(exercises);
    },

    getAllExercises() {
        return {
            dumbbell: this.getExercisesByType('dumbbell'),
            trx: this.getExercisesByType('trx')
        };
    },

    // New Firebase integration functions
    async getWorkoutFromFirebase(userId, workoutType) {
        try {
            const workoutRef = doc(db, 'workouts', `${userId}_${workoutType}`);
            const workoutDoc = await getDoc(workoutRef);
            
            if (workoutDoc.exists()) {
                return workoutDoc.data();
            }
            return this.getWorkout(workoutType);
        } catch (error) {
            console.error('Error getting workout from Firebase:', error);
            return this.getWorkout(workoutType);
        }
    },

    async saveWorkoutToFirebase(userId, workoutType, workoutData) {
        try {
            const workoutRef = doc(db, 'workouts', `${userId}_${workoutType}`);
            await setDoc(workoutRef, {
                ...workoutData,
                lastUpdated: new Date().toISOString(),
                userId: userId
            });
            return true;
        } catch (error) {
            console.error('Error saving workout to Firebase:', error);
            return false;
        }
    },

    async getUserWorkoutHistory(userId, workoutType) {
        try {
            const q = query(
                collection(db, 'workoutHistory'),
                where('userId', '==', userId),
                where('workoutType', '==', workoutType)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting workout history:', error);
            return [];
        }
    }
};

// Freeze objects to prevent modifications
Object.freeze(workoutLibrary);
Object.freeze(WorkoutLibrary);

// Export both the library and utility functions
export { workoutLibrary as default, WorkoutLibrary };
