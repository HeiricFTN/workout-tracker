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
     * Get recommended set for an exercise based on progress and profile
     * @param {string} userId - User ID
     * @param {string} exercise - Exercise name
     * @returns {Promise<Object>} Recommended weight and reps
     */
    async getRecommendedSet(userId, exercise) {
        try {
            const progress = await dataManager.getProgress(userId);
            const profile = await dataManager.getUserProfile(userId);
            const exerciseData = progress[exercise];

            if (exerciseData?.history?.length > 0) {
                const last = exerciseData.history[exerciseData.history.length - 1];
                const set = last.sets && last.sets[0];
                const weight = (set?.weight || 0) + 5;
                const reps = set?.reps || 8;
                return { weight, reps };
            }

            return { weight: profile.age, reps: 8 };
        } catch (error) {
            console.error('Error getting recommended set:', error);
            return { weight: 0, reps: 8 };
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
