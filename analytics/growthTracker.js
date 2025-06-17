// =============================
// File: analytics/growthTracker.js
// =============================
import { fetchLogsByUser } from '../models/workoutLogs.js';

export async function calculateGrowth(userId, exerciseName) {
  const logs = await fetchLogsByUser(userId);
  const history = logs
    .filter(log => log.performance[exerciseName])
    .map(log => log.performance[exerciseName])
    .flat();

  if (history.length < 2) return { trend: 'No Data', change: 0, method: 'none' };

  const firstEntry = history[0];
  const lastEntry = history[history.length - 1];

  let change = 0;
  let trend = 'No Data';
  let method = '';

  if ('weight' in firstEntry && 'weight' in lastEntry) {
    change = ((lastEntry.weight - firstEntry.weight) / firstEntry.weight) * 100;
    method = 'weight';
  } else if ('reps' in firstEntry && 'reps' in lastEntry) {
    change = ((lastEntry.reps - firstEntry.reps) / firstEntry.reps) * 100;
    method = 'reps';
  }

  if (change > 0) trend = 'Improving';
  else if (change < 0) trend = 'Declining';
  else trend = 'Stable';

  return { trend, change: parseFloat(change.toFixed(1)), method };
}

