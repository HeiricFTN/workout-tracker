/**
 * workoutLibrary.js
 * Manages workout definitions and exercise data
 * Version: 1.1.0
 * Last Updated: March 2025
 */

class WorkoutLibrary {
    constructor() {
        console.log('WorkoutLibrary initialized');
    }

    getWorkout(type) {
        const workouts = {
            chestBack: this.defineChestBackWorkout(),
            shoulderArms: this.defineShoulderArmsWorkout(),
            legsCore: this.defineLegsCoreworkout()
        };
        return workouts[type] || null;
    }

    defineChestBackWorkout() {
        const allExercises = this.getChestBackExercises();
        return {
            name: "Chest/Back",
            rowing: this.defineRowingSection(),
            supersets: this.createSupersets(allExercises)
        };
    }

    defineShoulderArmsWorkout() {
        const allExercises = this.getShoulderArmsExercises();
        return {
            name: "Shoulder/Arms",
            rowing: this.defineRowingSection(),
            supersets: this.createSupersets(allExercises)
        };
    }

    defineLegsCoreworkout() {
        const allExercises = this.getLegsCorexercises();
        return {
            name: "Legs/Core",
            rowing: this.defineRowingSection(),
            supersets: this.createSupersets(allExercises)
        };
    }

    getChestBackExercises() {
        return [
            // Round 1
            [
                {
                    name: "DB Floor Press",
                    description: "Lying on floor, press dumbbells",
                    setup: "Flat on back, dumbbells at chest height, elbows at 45°",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "8-12"
                },
                {
                    name: "TRX Low Row",
                    description: "Body at 45° angle, pull to chest",
                    setup: "Straps at mid-length, handles parallel, body angled back",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Halo",
                    description: "Circular movement around head",
                    setup: "Hold kettlebell by horns at chest level",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each direction"
                }
            ],
            // Round 2
            [
                {
                    name: "DB Bench Press",
                    description: "Standard bench press with dumbbells",
                    setup: "Lie on bench, dumbbells at chest level",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "8-12"
                },
                {
                    name: "TRX Inverted Row",
                    description: "Body horizontal, pull chest to handles",
                    setup: "Straps shortened, heels on ground, body straight",
                    type: "suspension",
                    sets: 3,
                    targetReps: "10-15"
                },
                {
                    name: "KB Farmer's Carry",
                    description: "Walk while holding kettlebells",
                    setup: "One kettlebell in each hand, walk 40-50 feet",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "40-50 feet each set"
                }
            ]
        ];
    }
    getShoulderArmsExercises() {
        return [
            // Round 1
            [
                {
                    name: "DB Shoulder Press",
                    description: "Press dumbbells overhead",
                    setup: "Standing or seated, dumbbells at shoulder level",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "8-12"
                },
                {
                    name: "TRX Bicep Curl",
                    description: "Curl body up, keeping elbows high",
                    setup: "Straps at mid-length, lean back, palms facing up",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Overhead Tricep Extension",
                    description: "Two-handed tricep extension behind head",
                    setup: "Hold kettlebell with both hands behind head",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12"
                }
            ],
            // Round 2
            [
                {
                    name: "DB Arnold Press",
                    description: "Press with rotation from front to overhead",
                    setup: "Seated or standing, start with palms facing you",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "8-12"
                },
                {
                    name: "TRX Rotational Curl",
                    description: "Curl with body rotation",
                    setup: "Side to anchor, both hands on farther strap",
                    type: "suspension",
                    sets: 3,
                    targetReps: "10-12 each side"
                },
                {
                    name: "KB Single-Arm Press",
                    description: "Overhead press with single kettlebell",
                    setup: "Rack kettlebell at shoulder, press vertically",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each arm"
                }
            ]
        ];
    }
    getLegsCorexercises() {
        return [
            // Round 1
            [
                {
                    name: "DB Goblet Squat",
                    description: "Squat holding dumbbell at chest",
                    setup: "Feet shoulder-width, hold dumbbell vertically at chest",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "TRX Hamstring Curl",
                    description: "Curl feet towards buttocks",
                    setup: "Lying on back, heels in straps",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Russian Twist",
                    description: "Seated twist with kettlebell",
                    setup: "Seated, knees bent, feet off ground, hold KB at chest",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "20-30 total twists"
                }
            ],
            // Round 2
            [
                {
                    name: "DB Romanian Deadlift",
                    description: "Hinge at hips, maintain straight legs",
                    setup: "Stand with feet hip-width, dumbbells in front",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "TRX Pike",
                    description: "Pike position with feet in straps",
                    setup: "Hands on ground, feet in straps, hips raised",
                    type: "suspension",
                    sets: 3,
                    targetReps: "10-15"
                },
                {
                    name: "KB Windmill",
                    description: "Side bend with KB overhead",
                    setup: "KB overhead, opposite leg forward",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each side"
                }
            ]
        ];
    }
    createSupersets(exercises) {
        const supersets = [];
        exercises.forEach(round => {
            for (let i = 0; i < round.length; i += 3) {
                supersets.push({
                    exercises: round.slice(i, i + 3)
                });
            }
        });
        return supersets;
    }

    defineRowingSection() {
        return {
            name: "Hydrow Rowing",
            description: "Complete before strength training",
            types: ["Breathe", "Sweat", "Drive"]
        };
    }
}

const workoutLibrary = new WorkoutLibrary();
export default workoutLibrary;
