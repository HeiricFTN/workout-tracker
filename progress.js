// progress.js
import dataManager from './dataManager.js';

document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const elements = {
        userToggle: document.getElementById('userToggle'),
        weekSelector: document.getElementById('weekSelector'),
        currentWeek: document.getElementById('currentWeek'),
        programPhase: document.getElementById('programPhase'),
        progressContainer: document.getElementById('progressContainer'),
        rowingProgress: document.getElementById('rowingProgress'),
        personalBests: document.getElementById('personalBests'),
        nextTargets: document.getElementById('nextTargets')
    };

    // State
    const state = {
        currentUser: dataManager.getCurrentUser(),
        selectedWeek: getCurrentWeek(),
        programStart: new Date('2025-02-18')
    };

    // Initialize
    async function init() {
        setupEventListeners();
        populateWeekSelector();
        await updateDisplay();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        elements.userToggle.addEventListener('click', toggleUser);
        elements.weekSelector.addEventListener('change', async (e) => {
            state.selectedWeek = parseInt(e.target.value);
            await updateDisplay();
        });
    }

    // Toggle User
    async function toggleUser() {
        state.currentUser = state.currentUser === 'Dad' ? 'Alex' : 'Dad';
        await dataManager.setCurrentUser(state.currentUser);
        elements.userToggle.textContent = state.currentUser;
        elements.userToggle.classList.toggle('bg-blue-500');
        elements.userToggle.classList.toggle('bg-green-500');
        await updateDisplay();
    }

    // Populate Week Selector
    function populateWeekSelector() {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            elements.weekSelector.appendChild(option);
        }
        elements.weekSelector.value = state.selectedWeek;
    }

    // Get Current Week
    function getCurrentWeek() {
        const today = new Date();
        const weeksPassed = Math.floor((today - state.programStart) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeksPassed + 1, 1), 12);
    }

    // Update Display
    async function updateDisplay() {
        updateProgramStatus();
        await updateRowingProgress();
        await updateStrengthProgress();
        await updatePersonalBests();
        await updateNextTargets();
    }

    // Update Program Status
    function updateProgramStatus() () {
        elements.currentWeek.textContent = `Week ${state.selectedWeek} of 12`;
        elements.programPhase.textContent = `Phase ${state.selectedWeek <= 6 ? '1' : '2'}`;
    }

    // Update Rowing Progress
    async function updateRowingProgress() {
        const progress = await dataManager.getProgress(state.currentUser);
        const rowingTypes = ['Breathe', 'Sweat', 'Drive'];
  
        const template = document.getElementById('rowingProgressTemplate');
        
        elements.rowingProgress.innerHTML = '';

        rowingTypes.forEach(type => {
            const rowingKey = `rowing_${type}`;
            const rowingData = progress[rowingKey];
            
            if (rowingData && rowingData.history.length > 0) {
                const recentEntries = rowingData.history.slice(-5);
                const bestPace = rowingData.personalBest.pace;
                const recentAverage = calculateAveragePace(recentEntries);

                const rowingElement = template.content.cloneNode(true);
                const container = document.createElement('div');
                container.innerHTML = rowingElement.innerHTML
                    .replace('{rowingType}', type)
                    .replace('{bestPace}', Math.round(bestPace))
                    .replace('{recentAverage}', Math.round(recentAverage));

                elements.rowingProgress.appendChild(container.firstElementChild);
            }
        });
    }

    // Calculate Average Pace
    function calculateAveragePace(entries) {
        if (!entries.length) return 0;
        const sum = entries.reduce((total, entry) => total + entry.pace, 0);
        return sum / entries.length;
    }

    // Update Strength Progress
    async function updateStrengthProgress() {
        const progress = await dataManager.getProgress(state.currentUser);
        elements.progressContainer.innerHTML = '';

        Object.entries(progress)
            .filter(([key]) => !key.startsWith('rowing_'))
            .forEach(([exercise, data]) => {
                if (data.history.length > 0) {
                    const progressElement = createProgressElement(exercise, data);
                    elements.progressContainer.appendChild(progressElement);
                }
            });
    }

    // Create Progress Element
    function createProgressElement(exercise, data) {
        const template = document.getElementById('exerciseProgressTemplate');
        const element = template.content.cloneNode(true);
        const container = document.createElement('div');
        
        const current = data.history[data.history.length - 1];
        const best = data.personalBest;
        const progressPercent = calculateProgressPercent(current, best);
        
        container.innerHTML = element.innerHTML
            .replace('{exerciseName}', exercise)
            .replace('{exerciseType}', data.type || 'exercise')
            .replace('{current}', formatMeasurement(current))
            .replace('{best}', formatMeasurement(best))
            .replace('{progressPercent}', progressPercent)
            .replace('{suggestionHtml}', getSuggestionHtml(current, best));

        return container.firstElementChild;
    }

    // Calculate Progress Percent
    function calculateProgressPercent(current, best) {
        if (current.weight) {
            return (current.weight / best.weight * 100) || 0;
        }
        return (current.reps / best.reps * 100) || 0;
    }

    // Format Measurement
    function formatMeasurement(data) {
        if (data.weight) {
            return `${data.weight}lbs × ${data.reps}`;
        }
        return `${data.reps} reps`;
    }

    // Get Suggestion HTML
    function getSuggestionHtml(current, best) {
        const template = document.getElementById('suggestionTemplate');
        const suggestion = getSuggestion(current, best);
        
        if (!suggestion) return '';
        
        return template.innerHTML.replace('{suggestion}', suggestion);
    }

    // Get Suggestion
    function getSuggestion(current, best) {
        if (current.weight) {
            if (current.weight >= best.weight) {
                return 'Try increasing weight next time';
            }
            return 'Work towards your previous best weight';
        }
        
        if (current.reps >= best.reps) {
            return 'Try adding more reps next time';
        }
        return 'Work towards your previous best reps';
    }

    // Update Personal Bests
    async function updatePersonalBests() {
        const progress = await dataManager.getProgress(state.currentUser);
        elements.personalBests.innerHTML = '';

        // Strength Personal Bests
        Object.entries(progress)
            .filter(([key]) => !key.startsWith('rowing_'))
            .forEach(([exercise, data]) => {
                if (data.personalBest) {
                    const bestElement = createPersonalBestElement(exercise, data.personalBest);
                    elements.personalBests.appendChild(bestElement);
                }
            });

        // Rowing Personal Bests
        Object.entries(progress)
            .filter(([key]) => key.startsWith('rowing_'))
            .forEach(([key, data]) => {
                if (data.personalBest) {
                    const type = key.replace('rowing_', '');
                    const bestElement = createRowingBestElement(type, data.personalBest);
                    elements.personalBests.appendChild(bestElement);
                }
            });
    }

    // Create Personal Best Element
    function createPersonalBestElement(exercise, best) {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center';
        div.innerHTML = `
            <span class="text-sm">${exercise}</span>
            <span class="font-medium">${formatMeasurement(best)}</span>
        `;
        return div;
    }

    // Create Rowing Best Element
    function createRowingBestElement(type, best) {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center';
        div.innerHTML = `
            <span class="text-sm">${type} Row</span>
            <span class="font-medium">${Math.round(best.pace)} m/min</span>
        `;
        return div;
    }

    // Update Next Targets
    async function updateNextTargets() {
        const progress = await dataManager.getProgress(state.currentUser);
        elements.nextTargets.innerHTML = '';

        // Strength Targets
        Object.entries(progress)
            .filter(([key]) => !key.startsWith('rowing_'))
            .forEach(([exercise, data]) => {
                if (data.personalBest) {
                    const targetElement = createTargetElement(exercise, data);
                    elements.nextTargets.appendChild(targetElement);
                }
            });

        // Rowing Targets
        Object.entries(progress)
            .filter(([key]) => key.startsWith('rowing_'))
            .forEach(([key, data]) => {
                if (data.personalBest) {
                    const type = key.replace('rowing_', '');
                    const targetElement = createRowingTargetElement(type, data);
                    elements.nextTargets.appendChild(targetElement);
                }
            });
    }

    // Create Target Element
    function createTargetElement(exercise, data) {
        const current = data.history[data.history.length - 1];
        const target = calculateNextTarget(current);
        
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center';
        div.innerHTML = `
            <span class="text-sm">${exercise}</span>
            <span class="font-medium">${formatMeasurement(target)}</span>
        `;
        return div;
    }

    // Create Rowing Target Element
    function createRowingTargetElement(type, data) {
        const currentPace = data.personalBest.pace;
        const targetPace = Math.round(currentPace * 1.05); // 5% improvement target
        
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center';
        div.innerHTML = `
            <span class="text-sm">${type} Row</span>
            <span class="font-medium">${targetPace} m/min</span>
        `;
        return div;
    }

    // Calculate Next Target
    function calculateNextTarget(current) {
        if (current.weight) {
            return {
                weight: Math.ceil(current.weight * 1.05), // 5% increase
                reps: current.reps
            };
        }
        return {
            reps: current.reps + 2 // 2 more reps
        };
    }

    // Initialize the page
    init().catch(error => {
        console.error('Failed to initialize progress page:', error);
    });
});
