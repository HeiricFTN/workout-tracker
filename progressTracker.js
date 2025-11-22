// progressTracker.js
import dataManager from './dataManager.js';
import { getSuggestedRepNumber, isWeightedEquipment } from './models/exerciseMetadata.js';

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
            daysCompleted: await this.getCompletedDays(),
        };
    }

    async getCompletedDays() {
        const user = await this.dataManager.getCurrentUser();
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
                isPersonalBest: current.pace >= personalBest.pace,
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
                isPersonalBest: current.weight >= personalBest.weight && current.reps >= personalBest.reps,
            };
        }

        return {
            type: 'trx',
            trend: current.reps > previous.reps ? 'improving' : 'declining',
            changePercent: ((current.reps - previous.reps) / previous.reps) * 100,
            current: `${current.reps} reps`,
            best: `${personalBest.reps} reps`,
            isPersonalBest: current.reps >= personalBest.reps,
        };
    }

    getStrengthTrend(current, previous) {
        if (current.weight > previous.weight) return 'improving';
        if (current.weight < previous.weight) return 'declining';
        if (current.reps > previous.reps) return 'improving';
        if (current.reps < previous.reps) return 'declining';
        return 'steady';
    }

    // Recommendations used by workout UI
    async getRecommendedSet(userId, exerciseName, { equipment, targetReps } = {}) {
        try {
            const progress = await this.dataManager.getProgress(userId);
            const entry = progress?.[exerciseName];
            const suggestedReps = getSuggestedRepNumber(targetReps);

            if (!entry || !Array.isArray(entry.history) || entry.history.length === 0) {
                return { weight: null, reps: suggestedReps };
            }

            const last = entry.history[entry.history.length - 1];
            const reps = last.reps ?? suggestedReps;

            if (isWeightedEquipment(equipment)) {
                return {
                    weight: last.weight ?? null,
                    reps,
                };
            }

            return { weight: null, reps };
        } catch (error) {
            console.error('Error getting recommended set:', error);
            return { weight: null, reps: getSuggestedRepNumber(targetReps) };
        }
    }

    // Personal Records
    async getPersonalBests(userId) {
        try {
            const progress = await this.dataManager.getProgress(userId);
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

    // General helpers
    getWeekNumber(date) {
        const startDate = new Date('2025-03-03');
        const diff = date - startDate;
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    }

    getBestSet(data) {
        if (!data || data.length === 0) return null;
        const allSets = data.flatMap(entry => entry.sets || []);
        return allSets.reduce((best, current) => {
            if (!best) return current;
            if (current.weight !== undefined && best.weight !== undefined) {
                return current.weight > best.weight ? current : best;
            }
            if (current.weight !== undefined) return current;
            if (best.weight !== undefined) return best;
            return current.reps > best.reps ? current : best;
        }, null);
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
                suggestedMinutes: current.minutes,
            };
        }

        if (current.weight !== undefined) {
            return {
                type: 'dumbbell',
                targetWeight: Math.ceil(current.weight * 1.05), // 5% increase
                targetReps: current.reps,
            };
        }

        return {
            type: 'trx',
            targetReps: current.reps + 2, // 2 more reps
        };
    }

    // Rowing Specific Methods
    async getRowingStats(user) {
        const progress = await this.dataManager.getProgress(user);
        const stats = {};

        for (const type of ['Breathe', 'Sweat', 'Drive']) {
            const key = `rowing_${type}`;
            if (progress[key]) {
                stats[type] = {
                    bestPace: Math.round(progress[key].personalBest.pace),
                    recentAverage: this.calculateRecentAverage(progress[key].history),
                    totalMeters: this.calculateTotalMeters(progress[key].history),
                    totalMinutes: this.calculateTotalMinutes(progress[key].history),
                };
            }
        }

        return stats;
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
