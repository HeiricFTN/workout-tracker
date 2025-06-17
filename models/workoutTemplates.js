// =============================
// File: models/workoutTemplates.js
// =============================
import { db } from '../services/firebaseService.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const templatesRef = collection(db, 'workoutTemplates');

export async function createTemplate(template) {
  return await addDoc(templatesRef, template);
}

export async function fetchTemplates() {
  const snapshot = await getDocs(templatesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchTemplateById(id) {
  const snapshot = await getDocs(query(templatesRef, where("templateId", "==", id)));
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() };
  }
  return null;
}

export async function updateTemplate(id, updatedData) {
  const templateDoc = doc(db, 'workoutTemplates', id);
  await updateDoc(templateDoc, updatedData);
}

export async function deleteTemplate(id) {
  const templateDoc = doc(db, 'workoutTemplates', id);
  await deleteDoc(templateDoc);
}

