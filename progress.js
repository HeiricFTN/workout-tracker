// =============================
// File: progress.js (updated)
// =============================
import { fetchLogsByUser } from './models/workoutLogs.js';
import { calculateGrowth } from './analytics/growthTracker.js';
import dataManager from './dataManager.js';

let currentUser = 'Dad';

window.addEventListener('DOMContentLoaded', async () => {
  currentUser = await dataManager.getCurrentUser();
  const logs = await fetchLogsByUser(currentUser);
  const allExercises = new Set();
  logs.forEach(log => {
    Object.keys(log.performance).forEach(ex => allExercises.add(ex));
  });

  const container = document.getElementById('growthContainer');
  container.innerHTML = '';

  for (const exerciseName of allExercises) {
    const growth = await calculateGrowth(currentUser, exerciseName);
    const card = document.createElement('div');
    card.className = 'growth-card';
    card.innerHTML = `
      <h4>${exerciseName}</h4>
      <p>Trend: ${growth.trend}</p>
      <p>Change: ${growth.change}% (${growth.method})</p>
    `;
    container.appendChild(card);
  }
});
