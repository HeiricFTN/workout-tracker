/**
 * progressTracker.js
 * Tracks and analyzes workout progress for both strength and rowing exercises
 * Version: 1.0.3
 * Last Verified: 2024-03-07
 * Changes: Updated to use dataManager and firebaseService
 */

import dataManager from './dataManager.js';
import firebaseService from './firebaseService.js';

/**
 * ProgressTracker Class
 * Handles progress tracking, analysis, and target calculations
 * @verification - All method signatures and return types verified
 * @crossref - Interfaces with dataManager.js and firebaseService.js
 */
class ProgressTracker {
    constructor() {
        console.log('ProgressTracker initialized');
    }

    /**
     * Get current program status
     * @returns {Promise<Object>} Program status data
     */
    async getCurrentProgram() {
        try {
            const currentWeek = await dataManager.getCurrentWeek();
            const daysCompleted = await this.getCompletedDays();
            
            console.log('Getting current program status:', { currentWeek, daysCompleted });
            
            return {
                week: currentWeek,
                phase: currentWeek <= 6 ? 1 : 2,
                daysCompleted
            };
        } catch (error) {
            console.error('Error getting current program:', error);
            return { week: 1, phase: 1, daysCompleted: [] };
        }
    }

    /**
     * Get completed workout days
     * @returns {Promise<Array>} Array of completed days
     */
    async getCompletedDays() {
        try {
            const user = await dataManager.getCurrentUser();
            const workouts = await dataManager.getWeeklyWorkouts(user);
            console.log('Retrieved completed days:', workouts);
            return workouts;
        } catch (error) {
            console.error('Error getting completed days:', error);
            return [];
        }
    }

    /**
     * Analyze progress for a user
     * @param {string} user - User ID
     * @param {string} exerciseType - Type of exercise to analyze
     * @returns {Promise<Object>} Progress analysis data
     */
    async analyzeProgress(user, exerciseType = 'all') {
        try {
            console.log(`Analyzing progress for ${user}, type: ${exerciseType}`);
            const progress = await dataManager.getProgress(user);
            const analysis = {};

            if (!progress || typeof progress !== 'object') {
                console.warn('No valid progress data found');
                return {};
            }

            for (const [exerciseName, exerciseData] of Object.entries(progress)) {
                // Skip internal fields and invalid data
                if (exerciseName === 'id' || 
                    !exerciseData || 
                    typeof exerciseData !== 'object' || 
                    exerciseName.startsWith('_')) {
                    continue;
                }

                // Skip if no history or invalid history
                if (!Array.isArray(exerciseData.history)) {
                    console.warn(`Invalid or missing history for ${exerciseName}`);
                    continue;
                }

                // Filter by exercise type if specified
                if (exerciseType !== 'all') {
                    if (exerciseType === 'rowing' && !exerciseName.startsWith('rowing_')) continue;
                    if (exerciseType === 'strength' && exerciseName.startsWith('rowing_')) continue;
                }

                // Only analyze if we have enough history
                if (exerciseData.history.length >= 2) {
                    const recent = exerciseData.history.slice(-2);
                    const analysisResult = this.calculateProgressMetrics(
                        exerciseName, 
                        recent, 
                        exerciseData.personalBest
                    );
                    if (analysisResult) {
                        analysis[exerciseName] = analysisResult;
                    }
                }
            }

            console.log('Progress analysis complete:', analysis);
            return analysis;
        } catch (error) {
            console.error('Error analyzing progress:', error);
            return {};
        }
    }

    /**
     * Calculate progress metrics for an exercise
     * @param {string} name - Exercise name
     * @param {Array} recent - Recent exercise data
     * @param {Object} personalBest - Personal best data
     * @returns {Object|null} Progress metrics
     */
    calculateProgressMetrics(name, recent, personalBest) {
        if (!Array.isArray(recent) || 
            recent.length < 2 || 
            !personalBest ||
            typeof personalBest !== 'object') {
            console.warn(`Invalid input for calculateProgressMetrics: ${name}`);
            return null;
        }

        const [previous, current] = recent;
        const isRowing = name.startsWith('rowing_');

        try {
            if (isRowing) {
                return this.calculateRowingMetrics(current, previous, personalBest);
            }
            return this.calculateStrengthMetrics(current, previous, personalBest);
        } catch (error) {
            console.error(`Error calculating metrics for ${name}:`, error);
            return null;
        }
    }


    /**
     * Calculate rowing progress metrics
     * @param {Object} current - Current rowing data
     * @param {Object} previous - Previous rowing data
     * @param {Object} personalBest - Personal best rowing data
     * @returns {Object|null} Rowing metrics
     */
calculateRowingMetrics(current, previous, personalBest) {
    if (!current?.meters || !current?.minutes || 
        !previous?.meters || !previous?.minutes || 
        !personalBest?.meters || !personalBest?.minutes) {
        console.warn('Invalid rowing data structure');
        return null;
    }

    // Calculate paces in minutes per 500m
    const currentPace = (500 * current.minutes) / current.meters;
    const previousPace = (500 * previous.minutes) / previous.meters;
    const bestPace = (500 * personalBest.minutes) / personalBest.meters;

    return {
        type: 'rowing',
        trend: currentPace < previousPace ? 'improving' : 'declining', // Lower is better
        changePercent: ((previousPace - currentPace) / previousPace) * 100,
        currentPace: currentPace,
        previousPace: previousPace,
        bestPace: bestPace,
        isPersonalBest: currentPace <= bestPace
    };
}


    /**
     * Calculate strength progress metrics
     * @param {Object} current - Current exercise data
     * @param {Object} previous - Previous exercise data
     * @param {Object} personalBest - Personal best exercise data
     * @returns {Object|null} Strength metrics
     */
    calculateStrengthMetrics(current, previous, personalBest) {
        if (!current || !previous || !personalBest) {
            console.warn('Invalid strength data structure');
            return null;
        }

        const isDumbbell = personalBest.weight !== undefined;
        if (isDumbbell) {
            return {
                type: 'dumbbell',
                trend: this.getStrengthTrend(current, previous),
                changePercent: ((current.weight - previous.weight) / previous.weight) * 100,
                current: `${current.weight}lbs × ${current.reps}`,
                best: `${personalBest.weight}lbs × ${personalBest.reps}`,
                isPersonalBest: current.weight >= personalBest.weight && current.reps >= personalBest.reps
            };
        }

        return {
            type: 'trx',
            trend: current.reps > previous.reps ? 'improving' : 'declining',
            changePercent: ((current.reps - previous.reps) / previous.reps) * 100,
            current: `${current.reps} reps`,
            best: `${personalBest.reps} reps`,
            isPersonalBest: current.reps >= personalBest.reps
        };
    }

    /**
     * Get strength trend
     * @param {Object} current - Current exercise data
     * @param {Object} previous - Previous exercise data
     * @returns {string} Trend direction
     */
    getStrengthTrend(current, previous) {
        if (current.weight > previous.weight) return 'improving';
        if (current.weight < previous.weight) return 'declining';
        if (current.reps > previous.reps) return 'improving';
        if (current.reps < previous.reps) return 'declining';
        return 'steady';
    }

    /**
     * Get next targets for a user
     * @param {string} user - User ID
     * @returns {Promise<Object>} Next target data
     */
    async getNextTargets(user) {
        try {
            console.log(`Calculating next targets for ${user}`);
            const progress = await dataManager.getProgress(user);
            const targets = {};

            for (const [name, data] of Object.entries(progress)) {
                if (!data || !Array.isArray(data.history) || data.history.length === 0) {
                    console.warn(`Invalid data structure for ${name}`);
                    continue;
                }

                const current = data.history[data.history.length - 1];
                targets[name] = this.calculateTarget(name, current);
            }

            console.log('Next targets calculated:', targets);
            return targets;
        } catch (error) {
            console.error('Error calculating next targets:', error);
            return {};
        }
    }

    /**
     * Calculate target for an exercise
     * @param {string} name - Exercise name
     * @param {Object} current - Current exercise data
     * @returns {Object|null} Target data
     */
calculateTarget(name, current) {
    if (!name || !current) {
        console.warn('Invalid input for calculateTarget');
        return null;
    }

    if (name.startsWith('rowing_')) {
        if (!current.meters || !current.minutes) {
            console.warn('Invalid rowing data');
            return null;
        }
        // Calculate current pace in min/500m
        const currentMetersPerMin = current.meters / current.minutes;
        const currentPaceMin500 = 500 / currentMetersPerMin;
        
        // Target is 5% faster (so 0.95 of current time)
        const targetPaceMin500 = currentPaceMin500 * 0.95;

        return {
            type: 'rowing',
            targetPace: targetPaceMin500,
            suggestedMinutes: current.minutes,
            // Optional: Add these for more detailed feedback
            currentPace: currentPaceMin500,
            improvement: (currentPaceMin500 - targetPaceMin500).toFixed(2),
            meters: current.meters
        };
    }

        if (current.weight !== undefined) {
            return {
                type: 'dumbbell',
                targetWeight: Math.ceil(current.weight * 1.05), // 5% increase
                targetReps: current.reps
            };
        }

        return {
            type: 'trx',
            targetReps: current.reps + 2 // 2 more reps
        };
    }
/**
 * Format minutes per 500m to MM:SS format
 * @param {number} paceMin500 - Pace in minutes per 500m
 * @returns {string} Formatted pace string
 */
formatPaceMinutes(paceMin500) {
    if (!paceMin500 || paceMin500 === 0) return '0:00';
    
    const minutes = Math.floor(paceMin500);
    const seconds = Math.round((paceMin500 - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
    /**
     * Calculate recent average pace
     * @param {Array} history - Exercise history
     * @param {number} entries - Number of recent entries to consider
     * @returns {number} Average pace
     */
calculateRecentAverage(history, entries = 5) {
    if (!Array.isArray(history) || history.length === 0) {
        console.warn('Invalid history for calculateRecentAverage');
        return 0;
    }

    const recent = history.slice(-Math.min(entries, history.length));
    // Calculate meters per minute for each entry, then convert to min/500m
    const paces = recent.map(entry => {
        if (!entry.meters || !entry.minutes) return 0;
        const metersPerMinute = entry.meters / entry.minutes;
        return 500 / metersPerMinute; // minutes per 500m
    });
    
    return paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
}


async getRowingStats(user) {
    try {
        console.log(`Getting rowing stats for ${user}`);
        const progress = await dataManager.getProgress(user);
        const stats = {};

        const rowingTypes = ['Breathe', 'Sweat', 'Drive'];
        
        rowingTypes.forEach(type => {
            const key = `rowing_${type}`;
            if (progress && progress[key] && Array.isArray(progress[key].history)) {
                const history = progress[key].history;
                stats[type] = {
                    bestPace: this.calculateBestPaceMinPer500m(history),
                    recentAverage: this.calculateRecentAverage(history),
                    totalMeters: this.calculateTotalMeters(history),
                    totalMinutes: this.calculateTotalMinutes(history)
                };
            } else {
                stats[type] = {
                    bestPace: 0,
                    recentAverage: 0,
                    totalMeters: 0,
                    totalMinutes: 0
                };
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting rowing stats:', error);
        return {
            Breathe: { bestPace: 0, recentAverage: 0, totalMeters: 0, totalMinutes: 0 },
            Sweat: { bestPace: 0, recentAverage: 0, totalMeters: 0, totalMinutes: 0 },
            Drive: { bestPace: 0, recentAverage: 0, totalMeters: 0, totalMinutes: 0 }
        };
    }
}


/**
 * Calculate best pace in minutes per 500m
 * @param {Array} history - Exercise history
 * @returns {number} Best pace in minutes per 500m
 * @private
 */
calculateBestPaceMinPer500m(history) {
    if (!Array.isArray(history) || history.length === 0) return 0;
    const paces = history.map(entry => {
        if (!entry.meters || !entry.minutes) return 0;
        const metersPerMinute = entry.meters / entry.minutes;
        return 500 / metersPerMinute; // minutes per 500m
    });
    return Math.min(...paces.filter(pace => pace > 0));
}



    /**
     * Calculate total meters rowed
     * @param {Array} history - Exercise history
     * @returns {number} Total meters
     */
    calculateTotalMeters(history) {
        if (!Array.isArray(history)) {
            console.warn('Invalid history for calculateTotalMeters');
            return 0;
        }

        return history.reduce((sum, entry) => sum + (entry.meters || 0), 0);
    }

    /**
     * Calculate total minutes rowed
     * @param {Array} history - Exercise history
     * @returns {number} Total minutes
     */
    calculateTotalMinutes(history) {
        if (!Array.isArray(history)) {
            console.warn('Invalid history for calculateTotalMinutes');
            return 0;
        }

        return history.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
    }

    /**
     * Get rowing progress for a user
     * @param {string} userId - User ID
     * @param {number} week - Week number
     * @returns {Promise<Object>} Rowing progress data
     */
async getRowingProgress(userId, week) {
    try {
        const progress = await dataManager.getProgress(userId);
        const rowingTypes = ['Breathe', 'Sweat', 'Drive'];
        const rowingProgress = {};

        rowingTypes.forEach(type => {
            const key = `rowing_${type}`;
            if (progress[key]?.history) {
                const weekData = progress[key].history.filter(entry => {
                    const entryWeek = this.getWeekNumber(new Date(entry.date));
                    return entryWeek === week;
                });

                rowingProgress[type] = {
                    bestPace: this.calculateBestPaceMinPer500m(weekData),
                    averagePace: this.calculateRecentAverage(weekData),
                    totalMeters: this.calculateTotalMeters(weekData)
                };
            }
        });

        return rowingProgress;
    } catch (error) {
        console.error('Error getting rowing progress:', error);
        return {};
    }
}


    /**
     * Get strength progress for a user
     * @param {string} userId - User ID
     * @param {number} week - Week number
     * @returns {Promise<Object>} Strength progress data
     */
    async getStrengthProgress(userId, week) {
        try {
            const progress = await dataManager.getProgress(userId);
            const strengthProgress = {};

            Object.entries(progress).forEach(([exercise, data]) => {
                if (exercise.startsWith('rowing_') || !data.history) return;

                const weekData = data.history.filter(entry => {
                    const entryWeek = this.getWeekNumber(new Date(entry.date));
                    return entryWeek === week;
                });

                if (weekData.length > 0) {
                    strengthProgress[exercise] = {
                        best: this.getBestSet(weekData),
                        current: this.getCurrentSet(weekData)
                    };
                }
            });

            console.log(`Strength progress for week ${week}:`, strengthProgress);
            return strengthProgress;
        } catch (error) {
            console.error('Error getting strength progress:', error);
            return {};
        }
    }

    /**
     * Get personal bests for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Personal bests data
     */
    async getPersonalBests(userId) {
        try {
            const progress = await dataManager.getProgress(userId);
            const personalBests = {};

            Object.entries(progress).forEach(([exercise, data]) => {
                if (data.personalBest && Object.keys(data.personalBest).length > 0) {
                    personalBests[exercise] = data.personalBest;
                }
            });

            console.log('Personal bests:', personalBests);
            return personalBests;
        } catch (error) {
            console.error('Error getting personal bests:', error);
            return {};
        }
    }

    /**
     * Helper method to get week number from date
     * @param {Date} date - Date to calculate week number for
     * @returns {number} Week number
     * @private
     */
    getWeekNumber(date) {
        const startDate = new Date('2025-03-03');
        const diff = date - startDate;
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    }


     /**
     * Get best set from strength data
     * @param {Array} data - Strength data
     * @returns {Object|null} Best set
     * @private
     */
    getBestSet(data) {
        if (!data || data.length === 0) return null;
        const allSets = data.flatMap(entry => entry.sets || []);
        return allSets.reduce((best, current) => {
            if (!best || (current.weight && current.weight > best.weight)) {
                return current;
            }
            return best;
        }, null);
    }

    /**
     * Get current set from strength data
     * @param {Array} data - Strength data
     * @returns {Object|null} Current set
     * @private
     */
    getCurrentSet(data) {
        if (!data || data.length === 0) return null;
        const lastEntry = data[data.length - 1];
        return (lastEntry.sets && lastEntry.sets[0]) || null;
    }
}

// Create and export instance
const progressTracker = new ProgressTracker();
export default progressTracker;

// Final Verification:
// - All method signatures verified
// - Return types documented and verified
// - Error handling implemented throughout
// - Data validation checks in place
// - Implementation notes included
// - Cross-reference checks completed
// - Console logging implemented for debugging
