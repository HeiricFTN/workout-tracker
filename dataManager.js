const DataManager = {
    storageKeys: {
        currentUser: 'currentUser',
        workouts: userId => `workouts_${userId}`,
        progress: userId => `progress_${userId}`,
        goals: userId => `goals_${userId}`,
        settings: userId => `settings_${userId}`,
        phase: 'currentPhase'
    },

    init() {
        console.log('DataManager initializing...');
        try {
            this.validateStorage();
            this.setupEventListeners();
            console.log('DataManager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize DataManager:', error);
            return false;
        }
    },

    validateStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('LocalStorage validated');
        } catch (e) {
            console.error('LocalStorage not available:', e);
            throw new Error('Local storage is not available');
        }
    },

    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            console.log('Storage event detected:', e.key);
            if (e.key && e.key.startsWith('workouts_')) {
                this.notifyDataChange('workouts', e.key.split('_')[1]);
            }
        });
    },

    // User Management
    async getCurrentUser() {
        const user = localStorage.getItem(this.storageKeys.currentUser) || 'Dad';
        console.log('Current user retrieved:', user);
        return user;
    },

    async setCurrentUser(user) {
        console.log('Setting current user:', user);
        localStorage.setItem(this.storageKeys.currentUser, user);
        this.notifyDataChange('user', user);
        return true;
    },

    // Workout Management
    async saveWorkout(userId, workout) {
        try {
            console.log('Saving workout for user:', userId);
            const key = this.storageKeys.workouts(userId);
            const workouts = await this.getWorkouts(userId);
            workouts.push({
                ...workout,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            
            await this.setItem(key, workouts);
            await this.updateProgress(userId, workout);
            this.notifyDataChange('workouts', userId);
            console.log('Workout saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            return false;
        }
    },

    async getWorkouts(userId, options = {}) {
        const key = this.storageKeys.workouts(userId);
        const workouts = await this.getItem(key, []);
        
        if (options.startDate || options.endDate) {
            return this.filterWorkoutsByDate(workouts, options);
        }
        
        return workouts;
    },

    async getWeeklyWorkouts(userId) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        return this.getWorkouts(userId, {
            startDate: startOfWeek,
            endDate: new Date()
        });
    },

    filterWorkoutsByDayDate(workouts, { startDate, endDate }) {
        return workouts.filter(workout => {
            const workoutDate = new Date(workout.timestamp);
            if (startDate && workoutDate < new Date(startDate)) return false;
            if (endDate && workoutDate > new Date(endDate)) return false;
            return true;
        });
    },

    // Progress Management
    async updateProgress(userId, workout) {
        try {
            console.log('Updating progress for user:', userId);
            const key = this.storageKeys.progress(userId);
            const progress = await this.getItem(key, {});
            
            Object.entries(workout.exercises).forEach(([exercise, data]) => {
                if (!progress[exercise]) {
                    progress[exercise] = {
                        history: [],
                        personalBest: {}
                    };
                }

                // Add to history
                progress[exercise].history.push({
                    date: workout.timestamp,
                    sets: data.sets
                });

                // Update personal bests
                const maxWeight = Math.max(...data.sets.map(set => set.weight || 0));
                const maxReps = Math.max(...data.sets.map(set => set.reps));

                if (!progress[exercise].personalBest.weight || maxWeight > progress[exercise].personalBest.weight) {
                    progress[exercise].personalBest = {
                        weight: maxWeight,
                        reps: maxReps,
                        date: workout.timestamp
                    };
                }
            });

            await this.setItem(key, progress);
            this.notifyDataChange('progress', userId);
            console.log('Progress updated successfully');
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    },

    async getProgress(userId, exercise = null) {
        const key = this.storageKeys.progress(userId);
        const progress = await this.getItem(key, {});
        return exercise ? progress[exercise] : progress;
    },

    // Storage Utilities
    async getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return defaultValue;
        }
    },

    async setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            return false;
        }
    },

    async removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            return false;
        }
    },

    // Event Notifications
    notifyDataChange(type, data) {
        console.log('Notifying data change:', type, data);
        window.dispatchEvent(new CustomEvent('dataChanged', {
            detail: { type, data }
        }));
    },

    // Error Handling
    handleError(error, operation) {
        console.error(`Error during ${operation}:`, error);
        // Implement error reporting or user notification here
    }
};

// Initialize the data manager
DataManager.init();

export default DataManager;
