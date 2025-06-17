// =============================
// File: ui/templateEditor.js
// =============================

import { exerciseLibrary } from '../models/exerciseLibrary.js';
import { saveTemplate } from '../models/workoutTemplates.js';

let selectedExercises = [];

function renderExerciseList() {
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  exerciseLibrary.forEach((exercise, idx) => {
    const item = document.createElement('div');
    item.className = 'template-card';
    item.innerHTML = `
      <label>
        <input type="checkbox" value="${exercise.name}" data-index="${idx}" />
        ${exercise.name} <small>(${exercise.equipment})</small>
      </label>
    `;
    list.appendChild(item);
  });
}

function renderSelectedBlocks() {
  const blockContainer = document.getElementById('selectedBlocks');
  blockContainer.innerHTML = '';

  selectedExercises.forEach((block, blockIdx) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'template-card';
    blockEl.innerHTML = `
      <strong>Block ${blockIdx + 1} (${block.type}):</strong>
      <ul>${block.exercises.map(name => `<li>${name}</li>`).join('')}</ul>
      <button onclick="removeBlock(${blockIdx})">Remove</button>
    `;
    blockContainer.appendChild(blockEl);
  });
}

function addBlock(type) {
  const checked = [...document.querySelectorAll('#exerciseList input[type=checkbox]:checked')];
  const exercises = checked.map(cb => cb.value);
  if (!exercises.length) return;

  selectedExercises.push({ type, exercises });
  renderSelectedBlocks();
  document.getElementById('exerciseList').querySelectorAll('input:checked').forEach(cb => cb.checked = false);
}

window.removeBlock = (blockIdx) => {
  selectedExercises.splice(blockIdx, 1);
  renderSelectedBlocks();
};

function handleTemplateSave(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newTemplate = {
    templateId: 'temp_' + Date.now(),
    title: formData.get('title'),
    version: 1,
    notes: formData.get('notes'),
    blocks: selectedExercises
  };
  saveTemplate(newTemplate);
  alert('Template saved!');
  e.target.reset();
  selectedExercises = [];
  renderSelectedBlocks();
}

window.addEventListener('DOMContentLoaded', () => {
  renderExerciseList();
  renderSelectedBlocks();
  document.getElementById('addSupersetBtn').addEventListener('click', () => addBlock('superset'));
  document.getElementById('addSingleBtn').addEventListener('click', () => addBlock('single'));
  document.getElementById('templateForm').addEventListener('submit', handleTemplateSave);
});
