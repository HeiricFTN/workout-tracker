// progress.js
import dataManager from './dataManager.js';
import firebaseService from './services/firebaseService.js';
import { WorkoutLibrary } from './workoutLibrary.js';

document.addEventListener('DOMContentLoaded', async function() {
    const elements = {
        userToggle: document.getElementById('userToggle'),
        weekSelector: document.getElementById('weekSelector'),
        currentWeek: document.getElementById('currentWeek'),
        programPhase: document.getElementById('programPhase'),
        progressContainer: document.getElementById('progressContainer'),
        rowingProgress: document.getElementById('rowingProgress'),
        personalBests: document.getElementById('personalBests'),
        nextTargets: document.getElementById('nextTargets'),
        loadingIndicator: document.getElementById('loadingIndicator')
    };

    const state = {
        currentUser: await dataManager.getCurrentUser(),
        selectedWeek: getCurrentWeek(),
        programStart: new Date('2025-02-18'),
        isLoading: false
    };

    async function init() {
        try {
            showLoading(true);
            setupEventListeners();
            await populateWeekSelector();
            await updateDisplay();
            showLoading(false);
        } catch (error) {
            console.error('Error initializing progress page:', error);
            showError('Failed to load progress data');
        }
    }

    functiotion setupEventListeners() {
        elements.userToggle.addEventListener('click', toggleUser);
        elements.weekSelector.addEventListener('change', handleWeekChange);
    }

    async function toggleUser() {
        try {
            showLoading(true);
            state.currentUser = state.currentUser === 'Dad' ? 'Alex' : 'Dad';
            await dataManager.setCurrentUser(state.currentUser);
            elements.userToggle.textContent = state.currentUser;
            elements.userToggle.classList.toggle('bg-blue-500');
            elements.userToggle.classList.toggle('bg-green-500');
            await updateDisplay();
        } catch (error) {
            console.error('Error toggling user:', error);
            showError('Failed to switch user');
        } finally {
            showLoading(false);
        }
    }

    async function populateWeekSelector() {
        const currentWeek = getCurrentWeek();
        elements.weekSelector.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            option.selected = i === currentWeek;
            elements.weekSelector.appendChild(option);
        }
    }

    function getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - state.programStart) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    async function handleWeekChange(event) {
        try {
            showLoading(true);
            state.selectedWeek = parseInt(event.target.value);
            await updateDisplay();
        } catch (error) {
            console.error('Error updating week:', error);
            showError('Failed to update week data');
        } finally {
            showLoading(false);
        }
    }

    async function updateDisplay() {
        updateProgramStatus();
        await updateRowingProgress();
        await updateStrengthProgress();
        await updatePersonalBests();
        await updateNextTargets();
    }

    function updateProgramStatus() {
        elements.currentWeek.textContent = `Week ${state.selectedWeek} of 12`;
        elements.programPhase.textContent = `Phase ${state.selectedWeek <= 6 ? '1' : '2'}`;
    }

    async function updateRowingProgress() {
        try {
            const rowingProgress = await firebaseService.getRowingProgress(state.currentUser, state.selectedWeek);
            elements.rowingProgress.innerHTML = '';

            for (const [type, data] of Object.entries(rowingProgress)) {
                const rowingElement = createRowingProgressElement(type, data);
                elements.rowingProgress.appendChild(rowingElement);
            }
        } catch (error) {
            console.error('Error updating rowing progress:', error);
            showError('Failed to load rowing progress');
        }
    }

    function createRowingProgressElement(type, data) {
        const element = document.createElement('div');
        element.className = 'rowing-progress-item mb-4';
        element.innerHTML = `
            <h3 class="font-bold mb-2">${type} Rowing</h3>
            <p>Best Pace: ${data.bestPace.toFixed(2)} m/min</p>
            <p>Average Pace: ${data.averagePace.toFixed(2)} m/min</p>
            <p>Total Distance: ${data.totalMeters} meters</p>
        `;
        return element;
    }

    async function updateStrengthProgress() {
        try {
            const strengthProgress = await firebaseService.getStrengthProgress(state.currentUser, state.selectedWeek);
            elements.progressContainer.innerHTML = '';

            for (const [exercise, data] of Object.entries(strengthProgress)) {
                const progressElement = createProgressElement(exercise, data);
                elements.progressContainer.appendChild(progressElement);
            }
        } catch (error) {
            console.error('Error updating strength progress:', error);
            showError('Failed to load strength progress');
        }
    }

    function createProgressElement(exercise, data) {
        const element = document.createElement('div');
        element.className = 'exercise-progress-item mb-4';
        element.innerHTML = `
            <h3 class="font-bold mb-2">${exercise}</h3>
            <p>Best: ${formatMeasurement(data.best)}</p>
            <p>Current: ${formatMeasurement(data.current)}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${calculateProgressPercentage(data)}%"></div>
            </div>
        `;
        return element;
    }

    function formatMeasurement(data) {
        if (data.weight) {
            return `${data.weight} lbs x ${data.reps} reps`;
        }
        return `${data.reps} reps`;
    }

    function calculateProgressPercentage(data) {
        if (data.best.weight) {
            return (data.current.weight / data.best.weight) * 100;
        }
        return (data.current.reps / data.best.reps) * 100;
    }

    async function updatePersonalBests() {
        try {
            const personalBests = await firebaseService.getPersonalBests(state.currentUser);
            elements.personalBests.innerHTML = '';

            for (const [exercise, data] of Object.entries(personalBests)) {
                const bestElement = createPersonalBestElement(exercise, data);
                elements.personalBests.appendChild(bestElement);
            }
        } catch (error) {
            console.error('Error updating personal bests:', error);
            showError('Failed to load personal bests');
        }
    }

    function createPersonalBestElement(exercise, data) {
        const element = document.createElement('div');
        element.className = 'personal-best-item mb-2';
        element.innerHTML = `
            <span class="font-medium">${exercise}:</span>
            <span>${formatMeasurement(data)}</span>
        `;
        return element;
    }

    async function updateNextTargets() {
        try {
            const nextTargets = await firebaseService.getNextTargets(state.currentUser);
            elements.nextTargets.innerHTML = '';

            for (const [exercise, target] of Object.entries(nextTargets)) {
                const targetElement = createTargetElement(exercise, target);
                elements.nextTargets.appendChild(targetElement);
            }
        } catch (error) {
            console.error('Error updating next targets:', error);
            showError('Failed to load next targets');
        }
    }

    function createTargetElement(exercise, target) {
        const element = document.createElement('div');
        element.className = 'target-item mb-2';
        element.innerHTML = `
            <span class="font-medium">${exercise}:</span>
            <span>${formatMeasurement(target)}</span>
        `;
        return element;
    }

    function showLoading(show) {
        state.isLoading = show;
        elements.loadingIndicator.classList.toggle('hidden', !show);
        elements.userToggle.disabled = show;
        elements.weekSelector.disabled = show;
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
        errorElement.textContent = message;
        document.body.insertBefore(errorElement, document.body.firstChild);
        setTimeout(() => errorElement.remove(), 5000);
    }

    // Initialize the progress page
    init().catch(error => {
        console.error('Failed to initialize progress page:', error);
        showError('Failed to initialize progress page');
    });
});
