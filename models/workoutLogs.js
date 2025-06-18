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
