// workoutLibrary.js
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

// Utility functions
const WorkoutLibrary = {
    getWorkout(type) {
        return workoutLibrary[type] || null;
    },

    getExerciseType(exercise) {
        return exercise.type || 'dumbbell';
    },

    needsWeight(exercise) {
        return exercise.type === 'dumbbell';
    },

    // New rowing utility functions
    getRowingTypes() {
        return ["Breathe", "Sweat", "Drive"];
    },

    calculateRowingPace(meters, minutes) {
        if (!minutes || minutes === 0) return 0;
        return Math.round(meters / minutes);
    }
};
