// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data manager
    const dataManager = new DataManager();
    
    // User switching functionality
    const dadButton = document.getElementById('userDad');
    const alexButton = document.getElementById('userAlex');

    dadButton.addEventListener('click', function() {
        dataManager.switchUser('Dad');
        console.log('Switched to Dad');
        updateUIForUser('Dad');
    });

    alexButton.addEventListener('click', function() {
        dataManager.switchUser('Alex');
        console.log('Switched to Alex');
        updateUIForUser('Alex');
    });

    // Workout selection functionality
    const workoutButtons = {
        chestTriceps: document.getElementById('chestTriceps'),
        shoulders: document.getElementById('shoulders'),
        backBiceps: document.getElementById('backBiceps')
    };

    Object.entries(workoutButtons).forEach(([workoutType, button]) => {
        button.addEventListener('click', function() {
            startWorkout(workoutType);
        });
    });

    function updateUIForUser(user) {
        // Update UI elements based on user
        document.querySelectorAll('.user-switch button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`user${user}`).classList.add('active');
    }

    function startWorkout(workoutType) {
        // Log to verify button click is working
        console.log(`Starting ${workoutType} workout`);
        
        // Get current user
        const currentUser = dataManager.getCurrentUser();
        console.log(`Current user: ${currentUser}`);

        // Get workout data from workoutLibrary
        const workout = workoutLibrary[workoutType];
        
        if (!workout) {
            console.error(`Workout ${workoutType} not found in library`);
            return;
        }

        // Display workout
        const workoutDisplay = document.getElementById('workoutDisplay');
        workoutDisplay.innerHTML = `
            <h2>${workout.name}</h2>
            <div class="supersets">
                ${workout.supersets.map((superset, index) => `
                    <div class="superset">
                        <h3>Superset ${index + 1}</h3>
                        <div class="exercises">
                            ${superset.exercises.map(exercise => `
                                <div class="exercise">
                                    <p>${exercise}</p>
                                    <input type="number" placeholder="Weight">
                                    <input type="number" placeholder="Reps">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="completeWorkout()">Complete Workout</button>
        `;
    }
});

// Global function for workout completion
function on completeWorkout() {
    console.log('Workout completed');
    // Add completion logic here
}
