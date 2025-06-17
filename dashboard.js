// =============================
// File: dashboard.js
// =============================
import { fetchTemplates } from './models/workoutTemplates.js';

const userId = 'Dad';

window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('dashboardContainer');
  container.innerHTML = '<h2>Select a Workout Template</h2>';

  const templates = await fetchTemplates();
  templates.forEach(t => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <h3>${t.title} (v${t.version})</h3>
      <p>${t.notes}</p>
      <button onclick="startWorkout('${t.templateId}')">Start Workout</button>
    `;
    container.appendChild(card);
  });

  const link = document.createElement('a');
  link.href = 'progress.html';
  link.textContent = 'View Progress Reports';
  link.className = 'progress-link';
  container.appendChild(link);
});
