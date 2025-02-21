// progressTracker.js
class ProgressTracker {
    constructor() {
        this.dataManager = dataManager; // Use existing global dataManager instance
    }

    // Program Tracking
    getCurrentProgram() {
           const currentWeek = this.dataManager.getCurrentWeek();
        return {
            week: currentWeek,
            phase: currentWeek <= 6 ? 1 : 2,
            daysCompleted: this.getCompletedDays()
        };
    }

    getCompletedDays() {
        const user = this.dataManager.getCurrentUser();
        return this.dataManager.getWeeklyWorkouts(user);
    }

    // Progress Analysis
    analyzeProgress(user, exerciseType = 'all') {
        const progress = this.dataManager.getProgress(user);
        const analysis = {};

        Object.entries(progress).forEach(([name, data]) => {
            // Filter by exercise type if specified
            if (exerciseType !== 'all') {
                if (exerciseType === 'rowing' && !name.startsWith('rowing_')) return;
                if (exerciseType === 'strength' && name.startsWith('rowing_')) return;
            }

            if (data.history.length >= 2) {
                const recent = data.history.slice(-2);
                analysis[name] = this.calculateProgressMetrics(name, recent, data.personalBest);
            }
        });

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
    getNextTargets(user) {
        const progress = this.dataManager.getProgress(user);
        const targets = {};

        Object.entries(progress).forEach(([name, data]) => {
            if (data.history.length > 0) {
                const current = data.history[data.history.length - 1];
                targets[name] = this.calculateTarget(name, current);
            }
        });

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
    getRowingStats(user) {
        const progress = this.dataManager.getProgress(user);
        const stats = {};

        ['Breathe', 'Sweat', 'Drive'].forEach(type => {
            const key = `rowing_${type}`;
            if (progress[key]) {
                stats[type] = {
                    bestPace: Math.round(progress[key].personalBest.pace),
                    recentAverage: this.calculateRecentAverage(progress[key].history),
                    totalMeters: this.calculateTotalMeters(progress[key].history),
                    totalMinutes: this.calculateTotalMinutes(progress[key].history)
                };
            }
        });

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

// Create global instance
const progressTracker = new ProgressTracker();
