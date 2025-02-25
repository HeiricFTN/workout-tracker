// workoutTracker.js
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
            return;
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
    function completeWorkout() {
        const workoutData = {
            user: state.currentUser,
            workoutName: state.currentWorkout.name,
            date: new Date().toISOString(),
            rowing: getRowingData(),
            exercises: getExercisesData()
        };

        try {
            dataManager.saveWorkout(state.currentUser, workoutData);
            alert('Workout completed and saved!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Failed to save workout. Please try again.');
        }
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
    init();
});
