// progress.js
import { ProgressTracker } from './progressTracker.js';

document.addEventListener('DOMContentLoaded', function() {
    const progressTracker = new ProgressTracker();
    
    const elements = {
        userToggle: document.getElementById('userToggle'),
        weekSelector: document.getElementById('weekSelector'),
        progressContainer: document.getElementById('progressContainer')
    };

    let currentUser = 'Dad';
    let currentWeek = getCurrentWeek();

    function init() {
        setupEventListeners();
        updateUserToggle();
        populateWeekSelector();
        displayProgress();
    }

    function setupEventListeners() {
        elements.userToggle.addEventListener('click', toggleUser);
        elements.weekSelector.addEventListener('change', (e) => {
            currentWeek = parseInt(e.target.value);
            displayProgress();
        });
    }

    function toggleUser() {
        currentUser = currentUser === 'Dad' ? 'Alex' : 'Dad';
        updateUserToggle();
        displayProgress();
    }

    function updateUserToggle() {
        elements.userToggle.textContent = currentUser;
        elements.userToggle.classList.toggle('bg-blue-500', currentUser === 'Dad');
        elements.userToggle.classList.toggle('bg-green-500', currentUser === 'Alex');
    }

    function populateWeekSelector() {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            elements.weekSelector.appendChild(option);
        }
        elements.weekSelector.value = currentWeek;
    }

    function getCurrentWeek() {
        const startDate = new Date('2023-09-01'); // Adjust this to your program start date
        const today = new Date();
        const weeksPassed = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12); // Ensure it's between 1 and 12
    }

    function displayProgress() {
        const progressData = progressTracker.getProgressForWeek(currentUser, currentWeek);
        elements.progressContainer.innerHTML = ''; // Clear previous content

        for (const workout in in progressData) {
            const workoutElement = createWorkoutElement(workout, progressData[workout]);
            elements.progressContainer.appendChild(workoutElement);
        }
    }

    function createWorkoutElement(workoutName, exercises) {
        const workoutDiv = document.createElement('div');
        workoutDiv.className = 'workout-card mb-4';
        workoutDiv.innerHTML = `<h2 class="text-xl font-bold mb-2">${workoutName}</h2>`;

        for (const exercise of exercises) {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise-progress mb-2';
            exerciseDiv.innerHTML = `
                <h3 class="font-medium">${exercise.name}</h3>
                <p>Best Set: ${exercise.bestSet.weight || ''} ${exercise.bestSet.weight ? 'lbs' : ''} x ${exercise.bestSet.reps} reps</p>
                <p>Last Week: ${exercise.lastWeek.weight || ''} ${exercise.lastWeek.weight ? 'lbs' : ''} x ${exercise.lastWeek.reps} reps</p>
                ${exercise.suggestion ? `<p class="text-green-600">Suggestion: ${exercise.suggestion}</p>` : ''}
            `;
            workoutDiv.appendChild(exerciseDiv);
        }

        return workoutDiv;
    }

    init();
});
