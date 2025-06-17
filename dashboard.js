// =============================
// File: dashboard.js
// =============================
import { fetchTemplates } from './models/workoutTemplates.js';

const userId = 'Dad';

// 3-day per week core schedule + optional 4th
const threeDaySchedule = [
  'Full Body Strength',    // Day 1
  'Push + Conditioning',  // Day 2
  'Pull + Legs'           // Day 3
];

const optionalDay = 'Arms & Core';

function getDayIndexThisWeek() {
  const day = new Date().getDay();
  // Map Mon/Wed/Fri = 0/1/2, Thu/Sat/Sun = optional
  const map = { 1: 0, 3: 1, 5: 2 }; // MWF core days
  return map[day];
}

function getTodayFocus() {
  const day = new Date().getDay();
  const index = getDayIndexThisWeek();
  if (index !== undefined) return threeDaySchedule[index];
  if (day === 4 || day === 6) return optionalDay; // Thu/Sat optional
  return 'Rest';
}

window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('dashboardContainer');
  container.innerHTML = '';

  const todayFocus = getTodayFocus();
  const templates = await fetchTemplates();

  const todayHeader = document.createElement('div');
  todayHeader.className = 'template-card';
  todayHeader.innerHTML = `
    <h2>Today: ${todayFocus}</h2>
  `;

  const matchedTemplate = templates.find(t => t.title === todayFocus);
  if (matchedTemplate) {
    todayHeader.innerHTML += `
      <button onclick="startWorkout('${matchedTemplate.templateId}')">Start ${matchedTemplate.title}</button>
    `;
  } else {
    todayHeader.innerHTML += `<p>No template assigned for this day.</p>`;
  }

  container.appendChild(todayHeader);

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
