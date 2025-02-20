// workoutTracker.js
import dataManager from './dataManager.js';
import workoutLibrary, { WorkoutLibrary } from './workoutLibrary.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        currentUser: document.getElementById('currentUser'),
        workoutTitle: document.getElementById('workoutTitle'),
        workoutContainer: document.getElementById('workoutContainer'),
        completeWorkoutBtn: document.getElementById('completeWorkoutBtn'),
        supersetTemplate: document.getElementById('supersetTemplate'),
        exerciseTemplate: document.getElementById('exerciseTemplate')
    };

    // State
    const state = {
        currentUser: '',
        currentWorkout: null
    };

    // Initialize
    function init() {
        loadWorkoutFromURL();
        setupEventListeners();
        renderWorkout();
    }

    // Load workout based on URL parameters
    function loadWorkoutFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        state.currentUser = urlParams.get('user') || 'Dad';
        const workoutType = urlParams.get('type');
        state.currentWorkout = WorkoutLibrary.getWorkout(workoutType);

        if (!state.currentWorkout) {
            console.error('Invalid workout type:', workoutType);
            window.location.href = 'index.html';
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

        const weightInput = exerciseElement.querySelector('.weight-input-container');
        if (exercise.type === 'trx') {
            weightInput.classList.add('hidden');
        }

        return exerciseElement;
    }

    // Complete workout
    function completeWorkout() {
        const workoutData = {
            user: state.currentUser,
            workoutName: state.currentWorkout.name,
            date: new Date().toISOString(),
            supersets: []
        };

        elements.workoutContainer.querySelectorAll('.superset').forEach((supersetElement, supersetIndex) => {
            const supersetData = {
                exercises: []
            };

            supersetElement.querySelectorAll('.exercise').forEach((exerciseElement, exerciseIndex) => {
                const exercise = state.currentWorkout.supersets[supersetIndex].exercises[exerciseIndex];
                const exerciseData = {
                    name: exercise.name,
                    type: exercise.type,
                    reps: exerciseElement.querySelector('.reps-input').value
                };

                if (exercise.type === 'dumbbell') {
                    exerciseData.weight = exerciseElement.querySelector('.weight-input').value;
                }

                supersetData.exercises.push(exerciseData);
            });

            workoutData.supersets.push(supersetData);
        });

        saveWorkout(workoutData);
        alert('Workout completed and saved!');
        window.location.href = 'index.html';
    }

    // Save workout data
    function saveWorkout(workoutData) {
        let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        workouts.push(workoutData);
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    // Initialize the tracker
    init();
});
