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
                },
                {
                    name: "DB Incline Fly",
                    description: "Wide arm movement on incline bench",
                    setup: "Bench at 30° incline, dumbbells held above chest",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "TRX Face Pull",
                    description: "Pull towards face, elbows high",
                    setup: "Straps at mid-length, lean back slightly",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Single-Arm Row",
                    description: "One-arm row with opposite leg forward",
                    setup: "Staggered stance, back flat, kettlebell hanging",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12 each arm"
                },
                {
                    name: "DB Pullover",
                    description: "Lying on bench, arc dumbbells overhead",
                    setup: "Lie across bench, hips off, one dumbbell overhead",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "TRX Chest Press",
                    description: "Push-up position, lower chest between handles",
                    setup: "Straps at mid-length, feet back for more difficulty",
                    type: "suspension",
                    sets: 3,
                    targetReps: "10-15"
                },
                {
                    name: "KB Chest-Loaded Swing",
                    description: "Two-hand swing, starting from chest",
                    setup: "Feet shoulder-width, kettlebell held at chest",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "15-20"
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
                },
                {
                    name: "DB Around the World",
                    description: "Circular motion around torso",
                    setup: "Standing, one dumbbell, start at waist level",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "8-10 each direction"
                },
                {
                    name: "TRX Y-Fly",
                    description: "Arms in Y position, pull while squeezing back",
                    setup: "Straps long, lean back, arms extended in Y",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB High Pull",
                    description: "Explosive pull from ground to shoulder height",
                    setup: "Kettlebell between feet, hinge at hips",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "DB Squeeze Press",
                    description: "Press while squeezing dumbbells together",
                    setup: "Lie on bench, dumbbells touching over chest",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-15"
                },
                {
                    name: "TRX Power Pull",
                    description: "One-arm row with rotation",
                    setup: "One hand on strap, other on handle, rotate as you pull",
                    type: "suspension",
                    sets: 3,
                    targetReps: "8-10 each side"
                },
                {
                    name: "KB Figure 8",
                    description: "Pass kettlebell in figure 8 around legs",
                    setup: "Wide stance, kettlebell between legs",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each direction"
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
                },
                {
                    name: "DB Lateral Raise",
                    description: "Raise arms to side to shoulder level",
                    setup: "Standing, dumbbells at sides, slight bend in elbows",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "TRX Tricep Pushdown",
                    description: "Push hands down, extending arms",
                    setup: "Face anchor point, handles at chest height",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Alternating Curl",
                    description: "Alternating bicep curls with kettlebells",
                    setup: "Standing, kettlebells hanging at sides",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12 each arm"
                },
                {
                    name: "DB Front Raise",
                    description: "Raise dumbbells to front at shoulder height",
                    setup: "Standing, dumbbells in front of thighs",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "TRX Skull Crusher",
                    description: "Tricep extension lying on back",
                    setup: "Lying under anchor, hold handles above forehead",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Upright Row",
                    description: "Pull kettlebell up to chin level",
                    setup: "Standing, kettlebell hanging in front of thighs",
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
                },
                {
                    name: "DB Hammer Curl",
                    description: "Bicep curl with neutral grip",
                    setup: "Standing, palms facing each other",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "TRX Reverse Fly",
                    description: "Rear delt fly movement",
                    setup: "Facing anchor, arms extended, slight bend in elbows",
                    type: "suspension",
                    sets: 3,
                    targetReps: "12-15"
                },
                {
                    name: "KB Bottoms-Up Press",
                    description: "Press kettlebell overhead, bottom up",
                    setup: "Hold kettlebell by handle, bottom facing ceiling",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each arm"
                },
                {
                    name: "DB Zottman Curl",
                    description: "Curl up, rotate, lower with reverse grip",
                    setup: "Standing, palms up to start",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "TRX Pike Pushup",
                    description: "Pushup with hips raised",
                    setup: "Feet in straps, hands on ground, hips high",
                    type: "suspension",
                    sets: 3,
                    targetReps: "8-12"
                },
                {
                    name: "KB Alternating Press",
                    description: "Alternate overhead press",
                    setup: "Rack two kettlebells at shoulders",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12 total"
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
                },
                {
                    name: "DB Lunge",
                    description: "Forward lunge with dumbbells",
                    setup: "Standing, dumbbells at sides",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12 each leg"
                },
                {
                    name: "TRX Mountain Climber",
                    description: "Alternate bringing knees to chest",
                    setup: "Hands on ground, feet in straps, plank position",
                    type: "suspension",
                    sets: 3,
                    targetReps: "20-30 total"
                },
                {
                    name: "KB Deadlift",
                    description: "Hinge at hips, lift kettlebell from ground",
                    setup: "Feet hip-width, KB between feet",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "DB Step-Up",
                    description: "Step up onto elevated platform",
                    setup: "Dumbbells at sides, platform in front",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12 each leg"
                },
                {
                    name: "TRX Plank",
                    description: "Hold plank position with feet in straps",
                    setup: "Forearms on ground, feet in straps",
                    type: "suspension",
                    sets: 3,
                    targetReps: "30-45 seconds"
                },
                {
                    name: "KB Side Bend",
                    description: "Standing side bend with kettlebell",
                    setup: "Stand with feet shoulder-width, KB in one hand",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "12-15 each side"
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
                    sets: 3: 3,
                    targetReps: "10-15"
                },
                {
                    name: "KB Windmill",
                    description: "Side bend with KB overhead",
                    setup: "KB overhead, opposite leg forward",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "8-10 each side"
                },
                {
                    name: "DB Calf Raise",
                    description: "Rise onto toes with dumbbells",
                    setup: "Stand on edge of step, dumbbells at sides",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "15-20"
                },
                {
                    name: "TRX Side Plank",
                    description: "Side plank with feet in straps",
                    setup: "Side elbow on ground, feet in straps",
                    type: "suspension",
                    sets: 3,
                    targetReps: "20-30 seconds each side"
                },
                {
                    name: "KB Goblet Reverse Lunge",
                    description: "Reverse lunge holding kettlebell",
                    setup: "Hold KB at chest, step backward",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "10-12 each leg"
                },
                {
                    name: "DB Bulgarian Split Squat",
                    description: "Split squat with rear foot elevated",
                    setup: "Rear foot on bench, dumbbells at sides",
                    type: "dumbbell",
                    sets: 3,
                    targetReps: "10-12 each leg"
                },
                {
                    name: "TRX Body Saw",
                    description: "Plank position, slide forward and back",
                    setup: "Forearms on ground, feet in straps",
                    type: "suspension",
                    sets: 3,
                    targetReps: "10-12"
                },
                {
                    name: "KB Turkish Get-Up",
                    description: "Floor to stand with KB overhead",
                    setup: "Start lying down, KB in one hand",
                    type: "kettlebell",
                    sets: 3,
                    targetReps: "3-5 each side"
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
