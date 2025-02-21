// dataManager.js
class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };
        this.programStartDate = new Date('2025-02-18');
    }

    // User Management
    getCurrentUser() {
        return localStorage.getItem(this.storageKeys.currentUser) || 'Dad';
    }

    setCurrentUser(user) {
        localStorage.setItem(this.storageKeys.currentUser, user);
    }

    // Workout Management
    saveWorkout(userId, workoutData) {
        const workouts = this.getWorkouts(userId);
        workouts.push({
            ...workoutData,
            date: new Date().toISOString(),
            week: this.getCurrentWeek()
        });
        localStorage.setItem(this.storageKeys.workouts(userId), JSON.stringify(workouts));
        this.updateProgress(userId, workoutData);
    }

    getWorkouts(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.workouts(userId)) || '[]');
    }

    getWeeklyWorkouts(userId) {
        const currentWeek = this.getCurrentWeek();
        const workouts = this.getWorkouts(userId);
        return workouts
            .filter(workout => workout.week === currentWeek)
            .map(workout => new Date(workout.date).getDay());
    }

    // Progress Management
    updateProgress(userId, workoutData) {
        const progress = this.getProgress(userId);
        
        // Update exercise progress
        workoutData.exercises.forEach(exercise => {
            if (!progress[exercise.name]) {
                progress[exercise.name] = {
                    history: [],
                    personalBest: {}
                };
            }

            // Add to history
            progress[exercise.name].history.push({
                date: workoutData.date,
                reps: exercise.reps,
                weight: exercise.weight
            });

            // Update personal bests
            if (exercise.type === 'dumbbell') {
                if (!progress[exercise.name].personalBest.weight || 
                    exercise.weight > progress[exercise.name].personalBest.weight) {
                    progress[exercise.name].personalBest = {
                        weight: exercise.weight,
                        reps: exercise.reps,
                        date: workoutData.date
                    };
                }
            } else if (exercise.reps > (progress[exercise.name].personalBest.reps || 0)) {
                progress[exercise.name].personalBest = {
                    reps: exercise.reps,
                    date: workoutData.date
                };
            }
        });

        // Update rowing progress
        if (workoutData.rowing) {
            const rowingKey = `rowing_${workoutData.rowing.type}`;
            if (!progress[rowingKey]) {
                progress[rowingKey] = {
                    history: [],
                    personalBest: {}
                };
            }

            const pacePerMinute = workoutData.rowing.meters / workoutData.rowing.minutes;

            // Add to history
            progress[rowingKey].history.push({
                date: workoutData.date,
                minutes: workoutData.rowing.minutes,
                meters: workoutData.rowing.meters,
                pace: pacePerMinute
            });

            // Update personal bests
            if (!progress[rowingKey].personalBest.pace || 
                pacePerMinute > progress[rowingKey].personalBest.pace) {
                progress[rowingKey].personalBest = {
                    minutes: workoutData.rowing.minutes,
                    meters: workoutData.rowing.meters,
                    pace: pacePerMinute,
                    date: workoutData.date
                };
            }
        }

        localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
    }

    getProgress(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.progress(userId)) || '{}');
    }

    getRecentProgress(userId) {
        const progress = this.getProgress(userId);
        const recentProgress = [];

        // Process exercise progress
        Object.entries(progress).forEach(([name, data]) => {
            if (!name.startsWith('rowing_') && data.history.length >= 2) {
                const recent = data.history.slice(-2);
                const current = recent[1];
                const previous = recent[0];

                if (data.personalBest.weight !== undefined) {
                    // Dumbbell exercise
                    if (current.weight !== previous.weight) {
                        recentProgress.push({
                            exercise: name,
                            type: 'dumbbell',
                            previousWeight: previous.weight,
                            currentWeight: current.weight,
                            date: current.date
                        });
                    }
                } else {
                    // TRX exercise
                    if (current.reps !== previous.reps) {
                        recentProgress.push({
                            exercise: name,
                            type: 'trx',
                            previousReps: previous.reps,
                            currentReps: current.reps,
                            date: current.date
                        });
                    }
                }
            }
        });

        // Process rowing progress
        ['Breathe', 'Sweat', 'Drive'].forEach(type => {
            const rowingKey = `rowing_${type}`;
            if (progress[rowingKey] && progress[rowingKey].history.length >= 2) {
                const recent = progress[rowingKey].history.slice(-2);
                const current = recent[1];
                const previous = recent[0];

                if (current.pace !== previous.pace) {
                    recentProgress.push({
                        exercise: `${type} Row`,
                        type: 'rowing',
                        previousPace: Math.round(previous.pace),
                        currentPace: Math.round(current.pace),
                        date: current.date
                    });
                }
            }
        });

        // Sort by date, most recent first
        return recentProgress.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    }

    // Utility Functions
    getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - this.programStartDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }
}

// Create instance
const dataManager = new DataManager();
