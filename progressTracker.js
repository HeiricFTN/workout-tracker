// progressTracker.js
import dataManager from './dataManager.js';
export class ProgressTracker {
    constructor() {
        this.storageKey = 'workoutProgress';
        this.startDate = new Date('2025-02-18'); // Program start date
    }

    // Get workout data from storage
    getStoredData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {
            Dad: { workouts: [], personalBests: {} },
            Alex: { workouts: [], personalBests: {} }
        };
    }

    // Save workout data to storage
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Add a completed workout
    addWorkout(workoutData) {
        const data = this.getStoredData();
        const user = workoutData.user;
        
        if (!data[user]) {
            data[user] = { workouts: [], personalBests: {} };
        }

        data[user].workouts.push({
            ...workoutData,
            week: this.getCurrentWeek()
        });

        // Update personal bests
        workoutData.supersets.forEach(superset => {
            superset.exercises.forEach(exercise => {
                this.updatePersonalBest(data[user].personalBests, exercise);
            });
        });

        this.saveData(data);
    }

    // Update personal best for an exercise
    updatePersonalBest(personalBests, exercise) {
        if (!personalBests[exercise.name]) {
            personalBests[exercise.name] = {
                weight: exercise.type === 'dumbbell' ? exercise.weight : null,
                reps: exercise.reps,
                date: new Date().toISOString()
            };
            return;
        }

        const current = personalBests[exercise.name];
        if (exercise.type === 'dumbbell') {
            // For dumbbell exercises, compare weight and reps
            if (exercise.weight > current.weight || 
                (exercise.weight === current.weight && exercise.reps > current.reps)) {
                personalBests[exercise.name] = {
                    weight: exercise.weight,
                    reps: exercise.reps,
                    date: new Date().toISOString()
                };
            }
        } else {
            // For TRX exercises, compare only reps
            if (exercise.reps > current.reps) {
                personalBests[exercise.name] = {
                    reps: exercise.reps,
                    date: new Date().toISOString()
                };
            }
        }
    }

    // Get progress data for a specific week
    getProgressForWeek(user, week) {
        const data = this.getStoredData();
        const userData = data[user] || { workouts: [], personalBests: {} };
        
        // Filter workouts for the specified week
        const weekWorkouts = userData.workouts.filter(w => w.week === week);
        const lastWeekWorkouts = userData.workouts.filter(w => w.week === week - 1);

        const progress = {};

        // Organize by workout type
        weekWorkouts.forEach(workout => {
            if (!progress[workout.workoutName]) {
                progress[workout.workoutName] = [];
            }

            workout.supersets.forEach(superset => {
                superset.exercises.forEach(exercise => {
                    progress[workout.workoutName].push({
                        name: exercise.name,
                        type: exercise.type,
                        bestSet: this.getBestSet(userData.personalBests[exercise.name]),
                        lastWeek: this.getLastWeekPerformance(exercise.name, lastWeekWorkouts),
                        suggestion: this.getSuggestion(exercise, userData.personalBests[exercise.name])
                    });
                });
            });
        });

        return progress;
    }

    // Get best set for an exercise
    getBestSet(personalBest) {
        if (!personalBest) return { reps: 0 };
        return {
            weight: personalBest.weight,
            reps: personalBest.reps
        };
    }

    // Get last week's performance
    getLastWeekPerformance(exerciseName, lastWeekWorkouts) {
        let bestPerformance = { reps: 0 };

        lastWeekWorkouts.forEach(workout => {
            workout.supersets.forEach(superset => {
                superset.exercises.forEach(exercise => {
                    if (exercise.name === exerciseName) {
                        if (exercise.type === 'dumbbell') {
                            if (!bestPerformance.weight || exercise.weight > bestPerformance.weight) {
                                bestPerformance = {
                                    weight: exercise.weight,
                                    reps: exercise.reps
                                };
                            }
                        } else if (exercise.reps > bestPerformance.reps) {
                            bestPerformance = { reps: exercise.reps };
                        }
                    }
                });
            });
        });

        return bestPerformance;
    }

    // Get suggestion for improvement
    getSuggestion(exercise, personalBest) {
        if (!personalBest) return "First time performing this exercise";

        if (exercise.type === 'dumbbell') {
            if (exercise.weight >= personalBest.weight) {
                if (exercise.reps >= personalBest.reps) {
                    return "Try increasing weight next time";
                }
                return "Try to increase reps at current weight";
            }
        } else {
            if (exercise.reps >= personalBest.reps) {
                return "Great job! Try to increase reps next time";
            }
        }

        return null;
    }

    // Get current week of the program
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.startDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12); // Ensure it's between 1 and 12
    }

    // Get personal bests for a user
    getPersonalBests(user) {
        const data = this.getStoredData();
        return data[user]?.personalBests || {};
    }

    // Get all workouts for a user
    getUserWorkouts(user) {
        const data = this.getStoredData();
        return data[user]?.workouts || [];
    }
}
