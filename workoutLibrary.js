// workoutLibrary.js
const workoutLibrary = {
    // Push Day (Chest & Shoulders)
    chestTriceps: {
        name: "Push Day",
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
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Row",
                        description: "Face anchor, pull chest to hands, squeeze shoulder blades",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Shoulder Press",
                        description: "Seated or standing, press dumbbells overhead",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Face Pull",
                        description: "Face anchor, pull to face height, high elbows, external rotation",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Incline Press",
                        description: "Bench at 30°, press dumbbells up",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Y-Raise",
                        description: "Face anchor, raise arms to Y position, focus on upper back",
                        type: "trx"
                    }
                ]
            }
        ]
    },

    // Pull Day (Back & Shoulders)
    shoulders: {
        name: "Pull Day",
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
                        description: "Bent over, pull dumbbells to ribs, squeeze lats",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Push-Up",
                        description: "Face away from anchor, perform push-up with handles",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Rear Delt Raise",
                        description: "Bent over, raise dumbbells to sides, focus on rear delts",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Chest Press",
                        description: "Face away from anchor, lean forward, press body up",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Shrug",
                        description: "Standing, shrug shoulders up, hold briefly",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Pike",
                        description: "Face down, feet in straps, pike hips up",
                        type: "trx"
                    }
                ]
            }
        ]
    },

    // Arms & Core
    backBiceps: {
        name: "Arms & Core",
        rowing: {
            name: "Hydrow Rowing",
            description: "Complete before strength training",
            types: ["Breathe", "Sweat", "Drive"]
        },
        supersets: [
            {
                exercises: [
                    {
                        name: "DB Bicep Curl",
                        description: "Standing, curl dumbbells, keep elbows still",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Tricep Extension",
                        description: "Face away from anchor, extend arms down",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Hammer Curl",
                        description: "Standing, curl with palms facing each other",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Fallout",
                        description: "Face down, extend arms forward, maintain plank",
                        type: "trx"
                    }
                ]
            },
            {
                exercises: [
                    {
                        name: "DB Concentration Curl",
                        description: "Seated, one arm at a time, elbow on inner thigh",
                        type: "dumbbell"
                    },
                    {
                        name: "TRX Power Pull",
                        description: "Side to anchor, single-arm row with rotation",
                        type: "trx"
                    }
                ]
            }
        ]
    }
};

// Utility functions (unchanged)
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

    getRowingTypes() {
        return ["Breathe", "Sweat", "Drive"];
    },

    calculateRowingPace(meters, minutes) {
        if (!minutes || minutes === 0) return 0;
        return Math.round(meters / minutes);
    }
};
