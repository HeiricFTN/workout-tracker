// workoutLibrary.js
const workoutLibrary = {
    // Chest & Triceps Workout
    chestTriceps: {
        name: "Chest & Triceps",
        supersets: [
            {
                exercises: [
                    "Bench Press",
                    "Tricep Pushdown"
                ]
            },
            {
                exercises: [
                    "Incline Dumbbell Press",
                    "Overhead Tricep Extension"
                ]
            },
            {
                exercises: [
                    "Machine Chest Fly",
                    "Rope Tricep Extension"
                ]
            },
            {
                exercises: [
                    "Decline Push-Ups",
                    "Diamond Push-Ups"
                ]
            }
        ]
    },

    // Shoulders Workout
    shoulders: {
        name: "Shoulders",
        supersets: [
            {
                exercises: [
                    "Seated Dumbbell Press",
                    "Lateral Raises"
                ]
            },
            {
                exercises: [
                    "Front Raises",
                    "Rear Delt Fly"
                ]
            },
            {
                exercises: [
                    "Military Press",
                    "Upright Row"
                ]
            },
            {
                exercises: [
                    "Face Pulls",
                    "Shrugs"
                ]
            }
        ]
    },

    // Back & Biceps Workout
    backBiceps: {
        name: "Back & Biceps",
        supersets: [
            {
                exercises: [
                    "Lat Pulldown",
                    "Barbell Curl"
                ]
            },
            {
                exercises: [
                    "Seated Cable Row",
                    "Hammer Curl"
                ]
            },
            {
                exercises: [
                    "One-Arm Dumbbell Row",
                    "Incline Dumbbell Curl"
                ]
            },
            {
                exercises: [
                    "Face Pulls",
                    "Cable Curl"
                ]
            }
        ]
    }
};

// Utility functions for workout library
const WorkoutLibrary = {
    // Get workout by type
    getWorkout(type) {
        return workoutLibrary[type] || null;
    },

    // Get all workout types
    getWorkoutTypes() {
        return Object.keys(workoutLibrary);
    },

    // Get workout names
    getWorkoutNames() {
        return Object.values(workoutLibrary).map(workout => workout.name);
    },

    // Get exercises for a specific workout
    getExercises(workoutType) {
        const workout = workoutLibrary[workoutType];
        if (!workout) return [];
        
        return workout.supersets.reduce((exercises, superset) => {
            return exercises.concat(superset.exercises);
        }, []);
    },

    // Validate workout structure
    validateWorkout(workout) {
        if (!workout || typeof workout !== 'object') return false;
        if (!workout.name || !Array.isArray(workout.supersets)) return false;
        
        return workout.supersets.every(superset => 
            Array.isArray(superset.exercises) && 
            superset.exercises.every(exercise => typeof exercise === 'string')
        );
    }
};

// Freeze the objects to prevent modifications
Object.freeze(workoutLibrary);
Object.freeze(WorkoutLibrary);

// Export both the library and utility functions
export { workoutLibrary as default, WorkoutLibrary };
