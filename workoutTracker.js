// =============================
// File: workoutTracker.js (updated)
// =============================
import { logWorkout } from './models/workoutLogs.js';
import { fetchTemplateById } from './models/workoutTemplates.js';

let selectedTemplateId = null;
let currentUser = 'Dad';

window.startWorkout = async function(templateId) {
  selectedTemplateId = templateId;
  const template = await fetchTemplateById(templateId);
  if (!template) return alert("Template not found");

  document.getElementById('workoutTitle').textContent = `${template.title} (v${template.version})`;
  renderWorkoutUI(template.exercises);
};

function renderWorkoutUI(exercises) {
  const container = document.getElementById('workoutContainer');
  container.innerHTML = '';
  exercises.forEach((exercise, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h4>${exercise.name}</h4>
      <input type="number" id="weight-${index}" placeholder="Weight">
      <input type="number" id="reps-${index}" placeholder="Reps">
    `;
    container.appendChild(div);
  });
}

document.getElementById('completeWorkoutBtn')?.addEventListener('click', async () => {
  const performance = {};
  document.querySelectorAll('#workoutContainer > div').forEach((div, index) => {
    const name = div.querySelector('h4').textContent;
    const weight = parseFloat(div.querySelector(`#weight-${index}`).value) || 0;
    const reps = parseInt(div.querySelector(`#reps-${index}`).value) || 0;
    performance[name] = [{ weight, reps }];
  });

  await logWorkout({
    userId: currentUser,
    templateId: selectedTemplateId,
    completedAt: new Date().toISOString(),
    performance
  });

  alert('Workout logged successfully!');
});
