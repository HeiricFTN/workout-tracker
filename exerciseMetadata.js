// =============================
// File: models/exerciseMetadata.js
// =============================

import { exerciseLibrary } from './exerciseLibrary.js';

const EQUIPMENT_ALIASES = {
  dumbbell: 'Dumbbell',
  db: 'Dumbbell',
  kettlebell: 'Kettlebell',
  kb: 'Kettlebell',
  barbell: 'Barbell',
  machine: 'Machine',
  cable: 'Cable',
  suspension: 'TRX',
  trx: 'TRX',
  bodyweight: 'Bodyweight',
};

export function normalizeEquipment(rawEquipment = '', rawType = '', name = '') {
  const normalized = (rawEquipment || rawType || '').toString().toLowerCase();
  const namePrefix = name.split(' ')[0]?.toLowerCase();

  if (EQUIPMENT_ALIASES[normalized]) {
    return EQUIPMENT_ALIASES[normalized];
  }

  if (EQUIPMENT_ALIASES[namePrefix]) {
    return EQUIPMENT_ALIASES[namePrefix];
  }

  return rawEquipment || rawType || '';
}

export function resolveExerciseInfo(exercise = {}) {
  const libraryMatch = exerciseLibrary.find(
    (item) => item.name.toLowerCase() === (exercise.name || '').toLowerCase()
  );

  const name = exercise.name || libraryMatch?.name || 'Exercise';
  const equipment = normalizeEquipment(
    exercise.equipment || libraryMatch?.equipment || '',
    exercise.type || libraryMatch?.type || '',
    name
  );
  const targetReps = exercise.targetReps || libraryMatch?.targetReps || null;

  return {
    ...exercise,
    name,
    equipment,
    targetReps,
  };
}

export function getSuggestedRepNumber(targetReps) {
  const match = (targetReps || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 8;
}
