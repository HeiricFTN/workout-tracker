// =============================
// File: analytics/growthTracker.js
// =============================

import { fetchLogsByExercise } from '../models/workoutLogs.js';

export async function calculateGrowth(userId, exerciseName) {
  const logs = await fetchLogsByExercise(userId, exerciseName);
  if (logs.length < 2) return { trend: 'No data', change: 0, method: 'N/A' };

  // Sort logs chronologically
  logs.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  const extractAverage = (log) => {
    const sets = log.performance[exerciseName];
    if (!sets || sets.length === 0) return 0;
    return sets.reduce((sum, set) => sum + (set.reps * set.weight), 0) / sets.length;
  };

  const firstAvg = extractAverage(logs[0]);
  const lastAvg = extractAverage(logs[logs.length - 1]);
  const change = firstAvg === 0 ? 0 : (((lastAvg - firstAvg) / firstAvg) * 100).toFixed(1);

  let trend = 'No Change';
  if (change > 5) trend = 'Improving';
  else if (change < -5) trend = 'Declining';

  return {
    trend,
    change,
    method: 'Avg Volume (reps x weight)'
  };
}
