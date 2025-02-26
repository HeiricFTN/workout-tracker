// workoutTracker.js
import dataManager from './dataManager.js';
import workoutLibrary, { WorkoutLibrary } from './workoutLibrary.js';
import { db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        currentUser: document.getElementById('currentUser'),
        workoutTitle: document.getElementById('workoutTitle'),
        workoutContainer: document.getElementById('workoutContainer'),
        completeWorkoutBtn: document.getElementById('completeWorkoutBtn'),
        supersetTemplate: document.getElementById('supersetTemplate'),
        exerciseTemplate: document.getElementById('exerciseTemplate'),
        rowingType: document.getElementById('rowingType'),
        rowingMinutes: document.getElementById('rowingMinutes'),
        rowingMeters: document.getElementById('rowingMeters')
    };

    // State
    const state = {
        currentUser: '',
        currentWorkout: null
    };

    // Initialize
    async function init() {
        try {
            await loadWorkoutFromURL();
            setupEventListeners();
            renderWorkout();
        } catch (error) {
            console.error('Error initializing workout:', error);
            alert('Error loading workout. Returning to dashboard.');
            window.location.href = 'index.html';
        }
    }

    // Load workout based on URL parameters
    async function loadWorkoutFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        state.currentUser = urlParams.get('user') || 'Dad';
        const workoutType = urlParams.get('type');
        
        // Try to load custom workout from Firebase, fallback to default
        state.currentWorkout = await WorkoutLibrary.getWorkoutFromFirebase(state.currentUser, workoutType) || workoutLibrary[workoutType];

        if (!state.currentWorkout) {
            throw new Error(`Invalid workout type: ${workoutType}`);
        }

        elements.currentUser.textContent = state.currentUser;
        elements.workoutTitle.textContent = state.currentWorkout.name;
    }

    // Set up event listeners
    function setupEventListeners() {
        elements.completeWorkoutBtn.addEventListener('click', completeWorkout);
    }

    // Render workout
    function renderWorkout() {
        elements.workoutContainer.innerHTML = '';
        state.currentWorkout.supersets.forEach((superset, index) => {
            const supersetElement = renderSuperset(superset, index);
            elements.workoutContainer.appendChild(supersetElement);
        });
    }

    // Render superset
    function renderSuperset(superset, index) {
        const template = elements.supersetTemplate.content.cloneNode(true);
        const supersetElement = template.querySelector('.superset');
        
        supersetElement.querySelector('h3').textContent = `Superset ${index + 1}`;
        const exerciseContainer = supersetElement.querySelector('.exercise-container');

        superset.exercises.forEach(exercise => {
            const exerciseElement = renderExercise(exercise);
            exerciseContainer.appendChild(exerciseElement);
        });

        return supersetElement;
    }

    // Render exercise
    function renderExercise(exercise) {
        const template = elements.exerciseTemplate.content.cloneNode(true);
        const exerciseElement = template.querySelector('.exercise');

        exerciseElement.querySelector('h4').textContent = exercise.name;
        exerciseElement.querySelector('p').textContent = exercise.description;

        // Handle TRX exercises
        const weightInputContainers = exerciseElement.querySelectorAll('.weight-input-container');
        if (exercise.type === 'trx') {
            weightInputContainers.forEach(container => container.classList.add('hidden'));
        }

        return exerciseElement;
    }

    // Complete workout
    async function completeWorkout() {
        try {
            const workoutData = {
                user: state.currentUser,
                workoutName: state.currentWorkout.name,
                date: new Date().toISOString(),
                rowing: getRowingData(),
                exercises: getExercisesData()
            };

            // Validate workout data
            if (!validateWorkoutData(workoutData)) {
                alert('Please fill in all required fields before completing the workout.');
                return;
            }

            // Show loading state
            elements.completeWorkoutBtn.disabled = true;
            elements.completeWorkoutBtn.textContent = 'Saving...';

            // Save to Firebase
            await saveWorkoutToFirebase(workoutData);
            
            // Save to local storage via dataManager
            await dataManager.saveWorkout(state.currentUser, workoutData);
            
            alert('Workout completed and saved!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Failed to save workout. Please try again.');
            
            // Reset button state
            elements.completeWorkoutBtn.disabled = false;
            elements.completeWorkoutBtn.textContent = 'Complete Workout';
        }
    }

    // Save workout to Firebase
    async function saveWorkoutToFirebase(workoutData) {
        try {
            const workoutRef = doc(db, 'workoutHistory', `${state.currentUser}_${new Date().toISOString()}`);
            await setDoc(workoutRef, workoutData);
        } catch (error) {
            console.error('Error saving workout to Firebase:', error);
            throw error; // Re-throw to be caught in completeWorkout
        }
    }

    // Validate workout data
    function validateWorkoutData(workoutData) {
        // Validate rowing data if provided
        if (workoutData.rowing.minutes > 0 || workoutData.rowing.meters > 0) {
            if (workoutData.rowing.minutes <= 0 || workoutData.rowing.meters <= 0) {
                return false;
            }
        }

        // Validate exercise data
        return workoutData.exercises.every(exercise => {
            return exercise.sets.every(set => {
                if (exercise.type === 'dumbbell') {
                    return set.weight > 0 && set.reps > 0;
                }
                return set.reps > 0;
            });
        });
    }

    // Get rowing data
    function getRowingData() {
        return {
            type: elements.rowingType.value,
            minutes: parseInt(elements.rowingMinutes.value) || 0,
            meters: parseInt(elements.rowingMeters.value) || 0
        };
    }

    // Get exercises data
    function getExercisesData() {
        const exercisesData = [];
        elements.workoutContainer.querySelectorAll('.superset').forEach((supersetElement, supersetIndex) => {
            supersetElement.querySelectorAll('.exercise').forEach((exerciseElement, exerciseIndex) => {
                const exercise = state.currentWorkout.supersets[supersetIndex].exercises[exerciseIndex];
                const exerciseData = {
                    name: exercise.name,
                    type: exercise.type,
                    sets: []
                };

                // Get data for each set
                for (let setNum = 1; setNum <= 3; setNum++) {
                    const setData = {
                        setNumber: setNum,
                        reps: parseInt(exerciseElement.querySelector(`.reps-input[data-set="${setNum}"]`)?.value) || 0
                    };

                    if (exercise.type === 'dumbbell') {
                        setData.weight = parseInt(exerciseElement.querySelector(`.weight-input[data-set="${setNum}"]`)?.value) || 0;
                    }

                    exerciseData.sets.push(setData);
                }

                exercisesData.push(exerciseData);
            });
        });
        return exercisesData;
    }

    // Start initialization
    init().catch(error => {
        console.error('Failed to initialize workout tracker:', error);
    });
});
