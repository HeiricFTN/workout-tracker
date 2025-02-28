// dataManager.js
console.log('Loading DataManager...');

class DataManager {
    constructor() {
        this.storageKeys = {
            currentUser: 'currentUser',
            workouts: userId => `workouts_${userId}`,
            progress: userId => `progress_${userId}`
        };
    }

    // User Management
    async getCurrentUser() {
        return localStorage.getItem(this.storageKeys.currentUser) || 'Dad';
    }

    async setCurrentUser(user) {
        localStorage.setItem(this.storageKeys.currentUser, user);
    }

    // Weekly Progress
    async getWeeklyWorkouts(userId) {
        try {
            console.log('Getting weekly workouts for:', userId);
            // For now, return empty array until we implement Firebase
            return [];
        } catch (error) {
            console.error('Error getting weekly workouts:', error);
            return [];
        }
    }

    // Progress Management
    async getProgress(userId) {
        try {
            console.log('Getting progress for:', userId);
            // For now, return empty object until we implement Firebase
            return {};
        } catch (error) {
            console.error('Error getting progress:', error);
            return {};
        }
    }

    async getRecentProgress(userId) {
        try {
            console.log('Getting recent progress for:', userId);
            // For now, return empty array until we implement Firebase
            return [];
        } catch (error) {
            console.error('Error getting recent progress:', error);
            return [];
        }
    }
}

// Create and export instance
const dataManager = new DataManager();
export default dataManager;
