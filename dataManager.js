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
    const user = localStorage.getItem(this.storageKeys.currentUser);
    console.log('Getting current user from storage:', user); // Debug log
    return user || 'Dad'; // Default to 'Dad' if null
}

async setCurrentUser(user) {
    console.log('Setting user to:', user); // Debug log
    if (user === 'Dad' || user === 'Alex') {
        localStorage.setItem(this.storageKeys.currentUser, user);
        console.log('User set successfully to:', user); // Debug log
    } else {
        console.error('Invalid user:', user);
    }
}

    // Weekly Progress
    async getWeeklyWorkouts(userId) {
            try {
                console.log('Getting weekly workouts for:', userId);
                // Return test data - array of completed workout days (0 = Sunday, 1 = Monday, etc.)
                return [1, 3, 5]; // This will show completed workouts for Monday, Wednesday, Friday
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
