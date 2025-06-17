// =============================
// File: ui/exerciseEditor.js
// =============================

import { exerciseLibrary } from '../models/exerciseLibrary.js';

const renderExerciseLibrary = () => {
  const container = document.getElementById('exerciseEditorContainer');
  container.innerHTML = '';

  exerciseLibrary.forEach((exercise, index) => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <h3>${exercise.name}</h3>
      <p><strong>Equipment:</strong> ${exercise.equipment}</p>
      <p><strong>Muscles:</strong> ${exercise.muscles.join(', ')}</p>
      <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
      <p>${exercise.notes}</p>
      <button onclick="deleteExercise(${index})">Delete</button>
    `;
    container.appendChild(card);
  });
};

window.addEventListener('DOMContentLoaded', () => {
  renderExerciseLibrary();

  const form = document.getElementById('addExerciseForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const newExercise = {
      name: formData.get('name'),
      equipment: formData.get('equipment'),
      muscles: formData.get('muscles').split(',').map(m => m.trim()),
      difficulty: formData.get('difficulty'),
      notes: formData.get('notes')
    };
    exerciseLibrary.push(newExercise);
    renderExerciseLibrary();
    form.reset();
  });
});

window.deleteExercise = index => {
  if (confirm('Delete this exercise?')) {
    exerciseLibrary.splice(index, 1);
    renderExerciseLibrary();
  }
};
