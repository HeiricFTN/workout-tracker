// =============================
// File: progress.js
// =============================
import { fetchLogsByUser, fetchLogsByExercise } from './models/workoutLogs.js';
import { calculateGrowth } from './analytics/growthTracker.js';
import dataManager from './dataManager.js';

let currentUser = 'Dad';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.addEventListener('DOMContentLoaded', async () => {
  currentUser = await dataManager.getCurrentUser();
  const logs = await fetchLogsByUser(currentUser);
  const allExercises = new Set();
  logs.forEach(log => {
    Object.keys(log.performance).forEach(ex => allExercises.add(ex));
  });

  const container = document.getElementById('growthContainer');
  container.innerHTML = '';
  const styles = getComputedStyle(document.documentElement);
  const lineColor = styles.getPropertyValue('--primary').trim();
  const fillColor = hexToRgba(lineColor, 0.2);

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
      <canvas aria-label="Progress chart for ${exerciseName}" role="img"></canvas>
      <p>Trend: ${growth.trend} | Change: ${growth.change}% (${growth.method})</p>
    `;
    container.appendChild(card);

    const ctx = card.querySelector('canvas').getContext('2d');
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: dataPoints,
          borderColor: lineColor,
          backgroundColor: fillColor,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { maxTicksLimit: isMobile ? 4 : 8 } }
        }
      }
    });
  }
});
