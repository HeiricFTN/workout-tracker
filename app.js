document.addEventListener('DOMContentLoaded', () => {
    let currentUser = 'Dad';
    const workoutData = {};

    document.getElementById('dadButton').addEventListener('click', () => switchUser('Dad'));
    document.getElementById('alexButton').addEventListener('click', () => switchUser('Alex'));
    document.getElementById('saveButton').addEventListener('click', saveWorkout);

    function switchUser(user) {
        currentUser = user;
        document.getElementById('dadButton').classList.toggle('bg-blue-500', user === 'Dad');
        document.getElementById('alexButton').classList.toggle('bg-blue-500', user === 'Alex');
        loadWorkout();
    }

    function saveWorkout() {
        const data = {
            date: new Date().toISOString(),
            hydrow: {
                time: document.getElementById('hydrowTime').value
            },
            benchPress: {
                weight: document.getElementById('benchPressWeight1').value,
                reps: document.getElementById('benchPressReps1').value
            }
        };

        const key = `workout_${currentUser}_${new Date().toLocaleDateString()}`;
        localStorage.setItem(key, JSON.stringify(data));
        alert('Workout saved!');
    }

    function loadWorkout() {
        const key = `workout_${currentUser}_${new Date().toLocaleDateString()}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            const data = JSON.parse(saved);
            document.getElementById('hydrowTime').value = data.hydrow.time;
            document.getElementById('benchPressWeight1').value = data.benchPress.weight;
            document.getElementById('benchPressReps1').value = data.benchPress.reps;
        }
    }
});
