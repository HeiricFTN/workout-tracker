// =============================
// File: models/workoutLogs.js
// =============================
import { db } from '../services/firebaseService.js';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

const logsRef = collection(db, 'workoutLogs');

export async function logWorkout(log) {
  return await addDoc(logsRef, log);
}

export async function fetchLogsByUser(userId) {
  const q = query(logsRef, where("userId", "==", userId), orderBy("completedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchLogsByTemplate(userId, templateId) {
  const q = query(
    logsRef,
    where("userId", "==", userId),
    where("templateId", "==", templateId),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
