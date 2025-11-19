// progressTracker.js
import dataManager from './dataManager.js';
import { getSuggestedRepNumber, normalizeEquipment, resolveExerciseInfo } from './models/exerciseMetadata.js';

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
@@ -87,81 +87,101 @@ class ProgressTracker {
        if (current.reps > previous.reps) return 'improving';
        if (current.reps < previous.reps) return 'declining';
        return 'steady';
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

    async getRecommendedSet(userId, exercise, options = {}) {
        try {
            const progress = await this.dataManager.getProgress(userId);
            const profile = await this.dataManager.getUserProfile(userId);
            const exerciseData = progress[exercise];
            const exerciseInfo = resolveExerciseInfo({ name: exercise, equipment: options.equipment });
            const equipment = normalizeEquipment(exerciseInfo.equipment, exerciseInfo.type, exerciseInfo.name);
            const isWeighted = this.isWeightedEquipment(equipment);
            const baseReps = this.getBaseReps(options.targetReps || exerciseInfo.targetReps);

            if (exerciseData?.history?.length > 0) {
                const last = exerciseData.history[exerciseData.history.length - 1];
                const set = last.sets && last.sets[0];
                const reps = set?.reps || baseReps;
                if (!isWeighted) {
                    return { reps };
                }
                const previousWeight = set?.weight || 0;
                const progressiveWeight = previousWeight
                    ? Math.max(Math.round(previousWeight * 1.05), previousWeight + 5)
                    : this.getDefaultStartingWeight(profile, exerciseInfo);
                return { weight: progressiveWeight, reps };
            }

            if (!isWeighted) {
                return { reps: baseReps };
            }

            return { weight: this.getDefaultStartingWeight(profile, exerciseInfo), reps: baseReps };
        } catch (error) {
            console.error('Error getting recommended set:', error);
            return { reps: this.getBaseReps(options.targetReps) };
        }
    }

    isWeightedEquipment(equipment) {
        const normalized = (equipment || '').toString().toLowerCase();
        return normalized !== 'bodyweight' && normalized !== 'trx' && normalized !== '';
    }

    getBaseReps(targetReps) {
        if (!targetReps) return 8;
        return getSuggestedRepNumber(targetReps);
    }

    getDefaultStartingWeight(profile, exerciseInfo) {
        const profileAnchor = profile?.bodyWeight ? Math.round(profile.bodyWeight * 0.25) : 15;
        const hintedWeight = exerciseInfo?.startingWeight || profileAnchor || 10;
        return Math.max(5, hintedWeight);
    }
