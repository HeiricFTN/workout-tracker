// workoutTracker.js
import dataManager from './dataManager.js';
import workoutLibrary from './workoutLibrary.js';
import { FirebaseHelper } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async function() {
    const elements = {
        currentUser: document.getElementById('currentUser'),
        workoutTitle: document.getElementById('workoutTitle'),
        workoutContainer: document.getElementById('workoutContainer'),
        completeWorkoutBtn: document.getElementById('completeWorkoutBtn'),
        supersetTemplate: document.getElementById('supersetTemplate'),
        exerciseTemplate: document.getElementById('exerciseTemplate'),
        rowingType: document.getElementById('rowingType'),
        rowingMinutes: document.getElementById('rowingMinutes'),
        rowingMeters: document.getElementById('rowingMeters'),
        loadingIndicator: document.getElementById('loadingIndicator')
    };

    const state = {
        currentUser: '',
        currentWorkout: null,
        isLoading: false,
        hasUnsavedChanges: false,
        exerciseData: new Map()
    };

    async function init() {
        try {
            showLoading(true);
            await loadWorkoutFromURL();
            setupEventListeners();
            setupAutoSave();
            await renderWorkout();
            showLoading(false);
        } catch (error) {
            console.error('Error initializing workout:', error);
            showError('Error loading workout. Returning to dashboard.');
            window.location.href = 'index.html';
        }
    }

    async function loadWorkoutFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        state.currentUser = urlParams.get('user') || 'Dad';
        const workoutType = urlParams.get('type');

        try {
            state.currentWorkout = workoutLibrary[workoutType];

            if (!state.currentWorkout) {
                throw new Error(`Invalid workout type: ${workoutType}`);
            }

            elements.currentUser.textContent = state.currentUser;
            elements.workoutTitle.textContent = state.currentWorkout.name;
        } catch (error) {
            console.error('Error loading workout:', error);
            throw error;
        }
    }

    function setupEventListeners() {
        elements.completeWorkoutBtn.addEventListener('click', completeWorkout);
        setupInputListeners();
        setupBeforeUnloadWarning();
    }

    function setupInputListeners() {
        elements.workoutContainer.addEventListener('input', (event) => {
            if (event.target.matches('input')) {
                state.hasUnsavedChanges = true;
                validateInput(event.target);
                updateExerciseData(event.target);
            }
        });

        elements.rowingMeters.addEventListener('input', validateRowingInput);
        elements.rowingMinutes.addEventListener('input', validateRowingInput);
    }

    function setupBeforeUnloadWarning() {
        window.addEventListener('beforeunload', (e) => {
            if (state.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    function setupAutoSave() {
        setInterval(async () => {
            if (state.hasUnsavedChanges) {
                await saveProgress();
            }
        }, 30000);
    }

    async function renderWorkout() {
        elements.workoutContainer.innerHTML = '';
        const savedData = await FirebaseHelper.getWorkoutProgress(state.currentUser, state.currentWorkout.name);
        
        state.currentWorkout.supersets.forEach((superset, index) => {
            const supersetElement = renderSuperset(superset, index, savedData);
            elements.workoutContainer.appendChild(supersetElement);
        });
    }

    function renderSuperset(superset, index, savedData) {
        const template = elements.supersetTemplate.content.cloneNode(true);
        const supersetElement = template.querySelector('.superset');
        
        supersetElement.qt.querySelector('h3').textContent = `Superset ${index + 1}`;
        const exerciseContainer = supersetElement.querySelector('.exercise-container');

        superset.exercises.forEach(exercise => {
            const exerciseElement = renderExercise(exercise, savedData);
            exerciseContainer.appendChild(exerciseElement);
        });

        return supersetElement;
    }

    function renderExercise(exercise, savedData) {
        const template = elements.exerciseTemplate.content.cloneNode(true);
        const exerciseElement = template.querySelector('.exercise');

        exerciseElement.querySelector('h4').textContent = exercise.name;
        exerciseElement.querySelector('p').textContent = exercise.description;

        const savedExercise = savedData?.exercises?.find(e => e.name === exercise.name);
        setupExerciseInputs(exerciseElement, exercise, savedExercise);

        return exerciseElement;
    }

    function setupExerciseInputs(element, exercise, savedData) {
        const weightInputs = element.querySelectorAll('.weight-input');
        const repsInputs = element.querySelectorAll('.reps-input');

        if (exercise.type === 'trx') {
            weightInputs.forEach(input => input.closest('.weight-input-container').classList.add('hidden'));
        }

        if (savedData) {
            savedData.sets.forEach((set, index) => {
                if (weightInputs[index]) weightInputs[index].value = set.weight || '';
                if (repsInputs[index]) repsInputs[index].value = set.reps || '';
            });
        }
    }

    function validateInput(input) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 0) {
            input.value = '';
        } else if (value > 999) {
            input.value = '999';
        }
    }

    function validateRowingInput() {
        const minutes = parseInt(elements.rowingMinutes.value) || 0;
        const meters = parseInt(elements.rowingMeters.value) || 0;
        
        const isValid = minutes > 0 && meters > 0;
        elements.completeWorkoutBtn.disabled = !isValid;
    }

    function updateExerciseData(input) {
        const exerciseElement = input.closest('.exercise');
        const exerciseName = exerciseElement.querySelector('h4').textContent;
        
        if (!state.exerciseData.has(exerciseName)) {
            state.exerciseData.set(exerciseName, { sets: [] });
        }
        
        const inputs = exerciseElement.querySelectorAll('input');
        const inputIndex = Array.from(inputs).indexOf(input);
        const setIndex = Math.floor(inputIndex / 2);
        const isWeight = input.classList.contains('weight-input');
        
        const exerciseData = state.exerciseData.get(exerciseName);
        while (exerciseData.sets.length <= setIndex) {
            exerciseData.sets.push({});
        }
        
        if (isWeight) {
            exerciseData.sets[setIndex].weight = parseInt(input.value) || 0;
        } else {
            exerciseData.sets[setIndex].reps = parseInt(input.value) || 0;
        }

        console.log('Updated exercise data:', {
            exerciseName,
            setIndex,
            data: exerciseData.sets[setIndex]
        });
    }

    async function saveProgress() {
        try {
            const progressData = collectWorkoutData();
            await FirebaseHelper.saveWorkoutProgress(state.currentUser, progressData);
            state.hasUnsavedChanges = false;
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    function collectWorkoutData() {
        return {
            name: state.currentWorkout.name,
            date: new Date().toISOString(),
            rowing: getRowingData(),
            exercises: Array.from(state.exerciseData.entries()).map(([name, data]) => ({
                name,
                sets: data.sets
            }))
        };
    }

    function getRowingData() {
        return {
            type: elements.rowingType.value,
            minutes: parseInt(elements.rowingMinutes.value) || 0,
            meters: parseInt(elements.rowingMeters.value) || 0
        };
    }

    async function completeWorkout() {
        try {
            const isValid = validateWorkoutData();
            console.log('Workout validation result:', isValid);

            if (!isValid) {
                showError('Please fill in all required fields before completing the workout.');
                return;
            }

            showLoading(true);
            const workoutData = collectWorkoutData();
            console.log('Collected workout data:', workoutData);

            await FirebaseHelper.saveWorkout(state.currentUser, workoutData);
            await dataManager.saveWorkout(state.currentUser, workoutData);
            
            showSuccess('Workout completed and saved!');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } catch (error) {
            console.error('Error completing workout:', error);
            showError('Failed to save workout. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    function validateWorkoutData() {
        console.log('Validating workout data...');
        
        const rowing = getRowingData();
        console.log('Rowing data:', rowing);

        console.log('Exercise data:', state.exerciseData);

        if (state.exerciseData.size === 0) {
            console.log('No exercise data found');
            return false;
        }

        const rowingValid = validateRowingData(rowing);
        if (!rowingValid) {
            console.log('Rowing validation failed');
            return false;
        }

        const exercisesValid = validateExercises();
        console.log('Exercises validation result:', exercisesValid);

        return exercisesValid;
    }

    function validateRowingData(rowing) {
        if (rowing.meters > 0 || rowing.minutes > 0) {
            return rowing.meters > 0 && rowing.minutes > 0;
        }
        return true;
    }

    function validateExercises() {
        const exerciseElements = document.querySelectorAll('.exercise');
        
        for (const exerciseElement of exerciseElements) {
            const exerciseName = exerciseElement.querySelector('h4').textContent;
            const exerciseData = state.exerciseData.get(exerciseName);
            
            if (!exerciseData || !exerciseData.sets || exerciseData.sets.length === 0) {
                console.log(`Missing data for exercise: ${exerciseName}`);
                return false;
            }

            const isTRX = exerciseElement.querySelectorAll('.weight-input-container.hidden').length > 0;

            for (const set of exerciseData.sets) {
                if (isTRX) {
                    if (!set.reps || set.reps <= 0) {
                        console.log(`Invalid TRX reps for ${exerciseName}:`, set);
                        return false;
                    }
                } else {
                    if (!set.weight || !set.reps || set.weight <= 0 || set.reps <= 0) {
                        console.log(`Invalid dumbbell set for ${exerciseName}:`, set);
                        return false;
                    }
                }
            }
        }

        return true;
    }

    function showLoading(show) {
        state.isLoading = show;
        elements.loadingIndicator?.classList.toggle('hidden', !show);
        elements.completeWorkoutBtn.disabled = show;
    }

    function showError(message) {
        alert(message);
    }

    function showSuccess(message) {
        alert(message);
    }

    // Initialize the tracker
    init().catch(error => {
        console.error('Failed to initialize workout tracker:', error);
        showError('Failed to initialize workout tracker');
    });
});
