// =============================
// File: progress.js (updated)
// =============================
import { fetchLogsByUser, fetchLogsByExercise } from './models/workoutLogs.js';
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
    const logData = await fetchLogsByExercise(currentUser, exerciseName);
    logData.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    const usesWeight = logData.some(log => {
      const sets = log.performance[exerciseName];
      return sets && sets.some(set => set.weight !== undefined);
    });

    const labels = logData.map(log => new Date(log.completedAt).toLocaleDateString());
    const dataPoints = logData.map(log => {
      const sets = log.performance[exerciseName];
      if (!sets || sets.length === 0) return 0;
      if (usesWeight) {
        return sets.reduce((sum, set) => sum + (set.reps * (set.weight || 0)), 0) / sets.length;
      }
      return sets.reduce((sum, set) => sum + set.reps, 0) / sets.length;
    });

    const card = document.createElement('div');
    card.className = 'growth-card';
    card.innerHTML = `
      <h4>${exerciseName}</h4>
      <canvas></canvas>
      <p>Trend: ${growth.trend} | Change: ${growth.change}% (${growth.method})</p>
    `;
    container.appendChild(card);

    const ctx = card.querySelector('canvas').getContext('2d');
    new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: dataPoints,
          borderColor: '#d1495b',
          backgroundColor: 'rgba(209,73,91,0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
});
