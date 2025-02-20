// dataManager.js
export class DataManager {
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
        workoutData.exercises.forEach(exercise => {
            if (!progress[exercise.name]) {
                progress[exercise.name] = [];
            }
            progress[exercise.name].push({
                date: new Date().toISOString(),
                weight: exercise.weight,
                reps: exercise.reps
            });
        });
        localStorage.setItem(this.storageKeys.progress(userId), JSON.stringify(progress));
    }

    getProgress(userId) {
        return JSON.parse(localStorage.getItem(this.storageKeys.progress(userId)) || '{}');
    }

    getRecentProgress(userId) {
        const progress = this.getProgress(userId);
        const recentProgress = [];

        Object.entries(progress).forEach(([exercise, data]) => {
            if (data.length < 2) return;

            const current = data[data.length - 1];
            const previous = data[data.length - 2];

            if (current.weight !== undefined) {
                // Dumbbell exercise
                if (current.weight !== previous.weight) {
                    recentProgress.push({
                        exercise,
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
                        exercise,
                        type: 'trx',
                        previousReps: previous.reps,
                        currentReps: current.reps,
                        date: current.date
                    });
                }
            }
        });

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

// Create and export a default instance
const dataManager = new DataManager();
export default dataManager;
