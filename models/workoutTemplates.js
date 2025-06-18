// =============================
// File: models/workoutTemplates.js
// =============================

import { db, collection, addDoc, getDocs } from '../services/firebaseService.js';

const templatesRef = collection(db, 'workoutTemplates');

export async function saveTemplate(template) {
  try {
    await addDoc(templatesRef, template);
    console.log('Template saved to Firebase:', template.title);
  } catch (err) {
    console.error('Error saving template:', err);
  }
}

export async function fetchTemplates() {
  try {
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), templateId: doc.id }));
  } catch (err) {
    console.error('Error fetching templates:', err);
    return [];
  }
  
}
export async function fetchTemplateById(templateId) {
  try {
    const snapshot = await getDocs(templatesRef);
    const doc = snapshot.docs.find(doc => doc.id === templateId);
    if (!doc) return null;
    return { ...doc.data(), templateId: doc.id };
  } catch (err) {
    console.error('Error fetching template by ID:', err);
    return null;
  }
}
