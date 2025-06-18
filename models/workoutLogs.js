// =============================
// File: models/workoutLogs.js
// =============================

import { db, collection, addDoc, getDocs, query, where } from '../services/firebaseService.js';

const logsRef = collection(db, 'workoutLogs');

export async function logWorkout(log) {
  try {
    await addDoc(logsRef, log);
    console.log('Workout logged:', log);
  } catch (err) {
    console.error('Failed to log workout:', err);
  }
}

export async function fetchLogsByUser(userId) {
  try {
    const q = query(logsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Error fetching logs:', err);
    return [];
  }
}

export async function fetchLogsByExercise(userId, exerciseName) {
  const logs = await fetchLogsByUser(userId);
  return logs.filter(log => log.performance[exerciseName]);
}

export async function fetchLatestTemplateId(userId) {
  const logs = await fetchLogsByUser(userId);
  if (logs.length === 0) return null;
  logs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return logs[0].templateId;
}

export async function generateSupersetTemplate(userId) {
  const { generateAdaptiveSuperset } = await import('../analytics/adaptiveWorkoutSelector.js');
  const supersets = await generateAdaptiveSuperset(userId);

  const template = {
    title: 'Adaptive Superset Plan',
    version: 1,
    exercises: supersets.flatMap(pair => pair.exercises.map(name => ({ name })))
  };

  return template;
}
