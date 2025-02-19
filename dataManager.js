// dataManager.js - Handles all data storage, retrieval, and synchronization

const currentUser = localStorage.getItem('currentUser') || 'Dad';
console.log('Current User:', currentUser);
const DataManager = {
    storageKeys: {
        currentUser: 'currentUser',
        workouts: userId => `workouts_${userId}`,
        progress: userId => `progress_${userId}`,
        goals: userId => `goals_${userId}`,
        settings: userId => `settings_${userId}`,
        phase: 'currentPhase',
        exercises: 'exerciseHistory'
    },

    init() {
        this.validateStorage();
        this.setupEventListesteners();
        return this.migrateDataIfNeeded();
    },

    validateStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            console.error('LocalStorage not available:', e);
            throw new Error('Local storage is not available');
        }
    },

    setupEventListeners() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('workouts_')) {
                this.notifyDataChange('workouts', e.key.split('_')[1]);
            }
        });
    },

    // User Management
    async getCurrentUser() {
        return localStorage.getItem(this.storageKeys.currentUser) || 'Dad';
    },

    async setCurrentUser(user) {
    await this.setItem(this.storageKeys.currentUser, user);
    console.log('User set in DataManager:', user);
    this.notifyDataChange('user', user);
    },

    // Workout Management
    async saveWorkout(userId, workout) {
        try {
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

    filterWorkoutsByDate(workouts, { startDate, endDate }) {
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
            const key = this.storageKeys.progress(userId);
            const progress = await this.getItem(key, {});
            
            // Update exercise records
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
                    progress[exercise].personalBest.weight = maxWeight;
                    progress[exercise].personalBest.date = workout.timestamp;
                }

                if (!progress[exercise].personalBest.reps || maxReps > progress[exercise].personalBest.reps) {
                    progress[exercise].personalBest.reps = maxReps;
                    progress[exercise].personalBest.date = workout.timestamp;
                }
            });

            await this.setItem(key, progress);
            this.notifyDataChange('progress', userId);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    },

    async getProgress(userId, exercise = null) {
        const key = this.storageKeys.progress(userId);
        const progress = await this.getItem(key, {});
        return exercise ? progress[exercise] : progress;
    },

    // Goals Management
    async saveGoal(userId, goal) {
        const key = this.storageKeys.goals(userId);
        const goals = await this.getItem(key, []);
        goals.push({
            ...goal,
            id: Date.now(),
            created: new Date().toISOString()
        });
        await this.setItem(key, goals);
        this.notifyDataChange('goals', userId);
    },

    async getGoals(userId) {
        const key = this.storageKeys.goals(userId);
        return await this.getItem(key, []);
    },

    async updateGoal(userId, goalId, updates) {
        const key = this.storageKeys.goals(userId);
        const goals = await this.getItem(key, []);
        const index = goals.findIndex(g => g.id === goalId);
        
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates };
            await this.setItem(key, goals);
            this.notifyDataChange('goals', userId);
        }
    },

    // Settings Management
    async saveSettings(userId, settings) {
        const key = this.storageKeys.settings(userId);
        await this.setItem(key, settings);
        this.notifyDataChange('settings', userId);
    },

    async getSettings(userId) {
        const key = this.storageKeys.settings(userId);
        return await this.getItem(key, {});
    },

    // Data Export/Import
    async exportUserData(userId) {
        try {
            const data = {
                workouts: await this.getWorkouts(userId),
                progress: await this.getProgress(userId),
                goals: await this.getGoals(userId),
                settings: await this.getSettings(userId),
                exported: new Date().toISOString()
            };
            
            return JSON.stringify(data);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },

    async importUserData(userId, jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data structure');
            }

            // Import each data type
            await this.setItem(this.storageKeys.workouts(userId), data.workouts);
            await this.setItem(this.storageKeys.progress(userId), data.progress);
            await this.setItem(this.storageKeys.goals(userId), data.goals);
            await this.setItem(this.storageKeys.settings(userId), data.settings);

            this.notifyDataChange('import', userId);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    validateImportData(data) {
        return data && 
               Array.isArray(data.workouts) &&
               typeof data.progress === 'object' &&
               Array.isArray(data.goals) &&
               typeof data.settings === 'object';
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

    // Data Migration
    async migrateDataIfNeeded() {
        const currentVersion = 1; // Update this when data structure changes
        const storedVersion = await this.getItem('dataVersion', 0);
        
        if (storedVersion < currentVersion) {
            await this.performMigration(storedVersion, currentVersion);
            await this.setItem('dataVersion', currentVersion);
        }
    },

    async performMigration(fromVersion, toVersion) {
        // Add migration logic here when needed
        console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);
    },

    // Event Notifications
    notifyDataChange(type, userId) {
        window.dispatchEvent(new CustomEvent('dataChanged', {
            detail: { type, userId }
        }));
    },

    // Error Handling
    handleError(error, operation) {
        console.error(`Error during ${operation}:`, error);
        // Implement error reporting or user notification here
    }
};

// Initialize the data manager
DataManager.init().catch(error => {
    console.error('Failed to initialize DataManager:', error);
});

export default DataManager;
