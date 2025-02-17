// wednesday.js
const WednesdayWorkout = {
    exercises: [
        {
            name: 'Seated DB Press',
            description: 'Press dumbbells overhead from shoulders',
            sets: 4,
            repRange: '8-12'
        },
  
        {
            name: 'Lateral Raises',
            description: 'Raise dumbbells to sides to shoulder level',
            sets: 3,
            repRange: '12-15'
        },
        {
            name: 'Front Raises',
            description: 'Raise dumbbells to front to shoulder level',
            sets: 3,
            repRange: '12'
        },
        {
            name: 'TRX Face Pulls',
            description: 'Pull TRX handles to face level, elbows high',
            sets: 3,
            repRange: '15'
        },
        {
            name: 'DB Shrugs',
            description: 'Shrug shoulders straight up and hold',
            sets: 3,
            repRange: '15'
        }
    ],

    // ... [Same methods as monday.js, just change 'monday' to 'wednesday' in storage keys]
};

// ... [Same helper functions as monday.js]

document.addEventListener('DOMContentLoaded', () => WednesdayWorkout.init());
