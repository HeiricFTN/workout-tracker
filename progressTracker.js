// progressTracker.js
import dataManager from './dataManager.js';

class ProgressTracker {
    constructor() {
        this.dataManager = dataManager;
    }

    // Program Tracking
    async getCurrentProgram() {
        const currentWeek = await this.dataManager.getCurrentWeek();
        return {
            week: currentWeek,
            phase: currentWeek <= 6 ? 1 : 2,
            daysCompleted: await this.getCompletedDays()
        };
    }

    async getCompletedDays() {
        const user = this.dataManager.getCurrentUser();
        return await this.dataManager.getWeeklyWorkouts(user);
    }

    // Progress Analysis
    async analyzeProgress(user, exerciseType = 'all') {
        const progress = await this.dataManager.getProgress(user);
        const analysis = {};

        for (const [name, data] of Object.entries(progress)) {
            // Filter by exercise type if specified
            if (exerciseType !== 'all') {
                if (exerciseType === 'rowing' && !name.startsWith('rowing_')) continue;
                if (exerciseType === 'strength' && name.startsWith('rowing_')) continue;
            }

            if (data.history.length >= 2) {
                const recent = data.history.slice(-2);
                analysis[name] = this.calculateProgressMetrics(name, recent, data.personalBest);
            }
        }

        return analysis;
    }

    calculateProgressMetrics(name, recent, personalBest) {
        const [previous, current] = recent;
        const isRowing = name.startsWith('rowing_');

        if (isRowing) {
            return {
                type: 'rowing',
                trend: current.pace > previous.pace ? 'improving' : 'declining',
                changePercent: ((current.pace - previous.pace) / previous.pace) * 100,
                currentPace: Math.round(current.pace),
                bestPace: Math.round(personalBest.pace),
                isPersonalBest: current.pace >= personalBest.pace
            };
        }

        // Strength exercise
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

    getStrengthTrend(current, previous) {
        if (current.weight > previous.weight) return 'improving';
        if (current.weight < previous.weight) return 'declining';
        if (current.reps > previous.reps) return 'improving';
        if (current.reps < previous.reps) return 'declining';
        return 'steady';
    }

    // Target Calculations
    async getNextTargets(user) {
        const progress = await this.dataManager.getProgress(user);
        const targets = {};

        for (const [name, data] of Object.entries(progress)) {
            if (data.history.length > 0) {
                const current = data.history[data.history.length - 1];
                targets[name] = this.calculateTarget(name, current);
            }
        }

        return targets;
    }

    calculateTarget(name, current) {
        if (name.startsWith('rowing_')) {
            return {
                type: 'rowing',
                targetPace: Math.round(current.pace * 1.05), // 5% increase
                suggestedMinutes: current.minutes
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

    // Rowing Specific Methods
async getRowingStats(user) {
    try {
        const progress = await this.dataManager.getProgress(user);
        const stats = {};

        for (const type of ['Breathe', 'Sweat', 'Drive']) {
            const key = `rowing_${type}`;
            if (progress[key]) {
                stats[type] = {
                    bestPace: progress[key].personalBest?.pacePerFiveHundred || "0:00",
                    recentAverage: this.calculateRecentPacePerFiveHundred(progress[key].history),
                    totalMeters: this.calculateTotalMeters(progress[key].history),
                    totalMinutes: this.calculateTotalMinutes(progress[key].history)
                };
            }
        }

        return stats;
    } catch (error) {
        console.error('Error getting rowing stats:', error);
        return {};
    }
}

    calculateRecentAverage(history, entries = 5) {
        if (!history.length) return 0;
        const recent = history.slice(-entries);
        return Math.round(recent.reduce((sum, entry) => sum + entry.pace, 0) / recent.length);
    }

    calculateTotalMeters(history) {
        return history.reduce((sum, entry) => sum + entry.meters, 0);
    }

    calculateTotalMinutes(history) {
        return history.reduce((sum, entry) => sum + entry.minutes, 0);
    }
}

// Create and export instance
const progressTracker = new ProgressTracker();
export default progressTracker;
