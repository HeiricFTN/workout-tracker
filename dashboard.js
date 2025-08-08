import { fetchTemplates } from './models/workoutTemplates.js';
import dataManager from './dataManager.js';

const weeklyPlan = [
  { template: null },       // Sunday
  { template: 'Full Body Strength' },
  { template: null },
  { template: 'Push + Conditioning' },
  { template: null },
  { template: 'Pull + Legs' },
  { template: null }
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

  const labels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  const weekRow = document.createElement('div');
  weekRow.className = 'weekly-schedule';

  labels.forEach((label, index) => {
    const day = document.createElement('div');
    day.className = 'day';
    day.textContent = label;

    const plan = weeklyPlan[index];
    if (plan.template) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (completedDays.includes(index)) {
        dot.classList.add('completed');
      } else {
        dot.classList.add('pending');
      }
      day.appendChild(dot);
    }

    weekRow.appendChild(day);
  });

  container.appendChild(weekRow);

  const todayButton = document.createElement('button');
  todayButton.textContent = "Start Today's Workout";
  todayButton.addEventListener('click', () => {
    const today = new Date().getDay();
    const plan = weeklyPlan[today];
    if (plan.template) {
      const template = templates.find(t => t.title === plan.template);
      if (template) {
        startWorkout(template.templateId);
        return;
      }
    }
    startWorkout();
  });
  container.appendChild(todayButton);

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
