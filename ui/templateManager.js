// =============================
// File: ui/templateManager.js
// =============================
import { createTemplate, fetchTemplates, updateTemplate, deleteTemplate } from '../models/workoutTemplates.js';

export async function displayTemplateList(containerId) {
  const container = document.getElementById(containerId);
  const templates = await fetchTemplates();
  container.innerHTML = '';

  templates.forEach(t => {
    const div = document.createElement('div');
    div.className = 'template-card';
    div.innerHTML = `
      <h3>${t.title} (v${t.version})</h3>
      <p>${t.notes}</p>
      <button onclick="deleteTemplate('${t.id}')">Delete</button>
    `;
    container.appendChild(div);
  });
}

export async function handleCreateTemplate(formData) {
  const newTemplate = {
    templateId: `template_${Date.now()}`,
    title: formData.title,
    version: 1,
    createdBy: formData.createdBy,
    createdAt: new Date().toISOString(),
    exercises: formData.exercises,
    notes: formData.notes || ''
  };

  await createTemplate(newTemplate);
  alert('Template created successfully');
}
