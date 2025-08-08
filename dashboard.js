import { fetchTemplates } from './models/workoutTemplates.js';
import dataManager from './dataManager.js';

const weeklyPlan = [
  { name: 'Sunday', template: null },
  { name: 'Monday', template: 'Full Body Strength' },
  { name: 'Tuesday', template: null },
  { name: 'Wednesday', template: 'Push + Conditioning' },
  { name: 'Thursday', template: null },
  { name: 'Friday', template: 'Pull + Legs' },
  { name: 'Saturday', template: null }
];

window.startWorkout = (templateId) => {
  const url = templateId ? `workout.html?templateId=${templateId}` : 'workout.html';
  window.location.href = url;
};

window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('dashboardContainer');
  container.innerHTML = '';

  const currentUser = await dataManager.getCurrentUser();
  const templates = await fetchTemplates();
  const completedDays = await dataManager.getWeeklyWorkouts(currentUser);

  const weekGrid = document.createElement('div');
  weekGrid.className = 'weekly-schedule';

  weeklyPlan.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `<h3>${day.name}</h3>`;

    if (completedDays.includes(index)) {
      card.innerHTML += '<p class="completed">Completed</p>';
    } else {
      const template = templates.find(t => t.title === day.template);
      if (template) {
        card.innerHTML += `<button onclick="startWorkout('${template.templateId}')">Start ${day.template}</button>`;
      } else {
        card.innerHTML += `<button onclick="startWorkout()">Start Workout</button>`;
      }
    }

    weekGrid.appendChild(card);
  });

  container.appendChild(weekGrid);

  const allHeader = document.createElement('h3');
  allHeader.textContent = 'All Workout Templates';
  container.appendChild(allHeader);

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
