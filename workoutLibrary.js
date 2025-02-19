// workoutLibrary.js - Complete workout definitions and phase management

const currentUser = localStorage.getItem('currentUser') || 'Dad';
console.log('Current User:', currentUser);

const WorkoutLibrary = {
    phases: {
        phase1: {
            startDate: '2025-02-18',
            endDate: '2025-04-15',
            workouts: {
                chest_tri: {
                    id: 'chest_tri',
                    name: 'Chest & Triceps',
                    supersets: [
                        {
                            name: 'A',
                            exercises: [
                                {
                                    name: 'DB Bench Press',
                                    description: 'Lying on flat bench, press dumbbells up from chest level',
                                    sets: 4,
                                    repRange: '8-12',
                                    rest: 90,
                                    isBodyweight: false,
                                    formCues: [
                                        'Back flat on bench',
                                        'Drive through feet',
                                        'Full range of motion'
                                    ]
                                },
                                {
                                    name: 'TRX Tricep Extensions',
                                    description: 'Face away from anchor, extend arms down',
                                    sets: 4,
                                    repRange: '12-15',
                                    isBodyweight: true,
                                    formCues: [
                                        'Keep elbows high',
                                        'Body straight',
                                        'Control the motion'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'B',
                            exercises: [
                                {
                                    name: 'Incline DB Press',
                                    description: 'Press on 30-45° incline bench',
                                    sets: 3,
                                    repRange: '8-12',
                                    rest: 90,
                                    isBodyweight: false,
                                    formCues: [
                                        'Back supported',
                                        'Drive dumbbells up',
                                        'Control descent'
                                    ]
                                },
                                {
                                    name: 'DB Skull Crushers',
                                    description: 'Lying on bench, lower dumbbells to sides of head',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Keep elbows still',
                                        'Lower to ear level',
                                        'Control the weight'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'C',
                            exercises: [
                                {
                                    name: 'TRX Push-ups',
                                    description: 'Push-ups with hands in TRX straps',
                                    sets: 3,
                                    repRange: 'Max Reps',
                                    rest: 60,
                                    isBodyweight: true,
                                       formCues: [
                                        'Body straight line',
                                        'Lower chest to hands',
                                        'Full lockout'
                                    ]
                                },
                                {
                                    name: 'DB Tricep Kickbacks',
                                    description: 'Bend forward, extend dumbbells back',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Keep upper arms still',
                                        'Full extension',
                                        'Control return'
                                    ]
                                }
                            ]
                        }
                    ]
                },
                shoulders: {
                    id: 'shoulders',
                    name: 'Shoulders',
                    supersets: [
                        {
                            name: 'A',
                            exercises: [
                                {
                                    name: 'Seated DB Press',
                                    description: 'Press dumbbells overhead from shoulders',
                                    sets: 4,
                                    repRange: '8-12',
                                    rest: 90,
                                    isBodyweight: false,
                                    formCues: [
                                        'Back supported',
                                        'Press straight up',
                                        'Full lockout'
                                    ]
                                },
                                {
                                    name: 'Lateral Raises',
                                    description: 'Raise dumbbells to sides to shoulder level',
                                    sets: 4,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Slight elbow bend',
                                        'Lead with elbows',
                                        'Control descent'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'B',
                            exercises: [
                                {
                                    name: 'Front Raises',
                                    description: 'Raise dumbbells to front at shoulder height',
                                    sets: 3,
                                    repRange: '12-15',
                                    rest: 60,
                                    isBodyweight: false,
                                    formCues: [
                                        'Keep core tight',
                                        'Controlled motion',
                                        'Shoulder height'
                                    ]
                                },
                                {
                                    name: 'TRX Y-Raises',
                                    description: 'Pull up and out in Y pattern',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: true,
                                    formCues: [
                                        'Control body angle',
                                        'Pull to Y position',
                                        'Squeeze at top'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'C',
                            exercises: [
                                {
                                    name: 'DB Shrugs',
                                    description: 'Shrug shoulders straight up',
                                    sets: 3,
                                    repRange: '15-20',
                                    rest: 60,
                                    isBodyweight: false,
                                    formCues: [
                                        'Straight up motion',
                                        'Hold at top',
                                        'Control descent'
                                    ]
                                },
                                {
                                    name: 'Rear Delt Raises',
                                    description: 'Bend forward, raise dumbbells to sides',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Bend at hips',
                                        'Raise to shoulder line',
                                        'Squeeze rear delts'
                                    ]
                                }
                            ]
                        }
                    ]
                },
                back_bi: {
                    id: 'back_bi',
                    name: 'Back & Biceps',
                    supersets: [
                        {
                            name: 'A',
                            exercises: [
                                {
                                    name: 'Modified Pull-ups',
                                    description: 'Pull-ups with knees bent for ceiling',
                                    sets: 4,
                                    repRange: 'Max Reps',
                                    rest: 90,
                                    isBodyweight: true,
                                    formCues: [
                                        'Bend knees up',
                                        'Pull chest to bar',
                                        'Control descent'
                                    ]
                                },
                                {
                                    name: 'DB Curls',
                                    description: 'Standing alternating dumbbell curls',
                                    sets: 4,
                                    repRange: '10-12',
                                    isBodyweight: false,
                                    formCues: [
                                        'Keep elbows still',
                                        'Full range of motion',
                                        'Control descent'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'B',
                            exercises: [
                                {
                                    name: 'TRX Rows',
                                    description: 'Row body up to hands',
                                    sets: 3,
                                    repRange: '12-15',
                                    rest: 60,
                                    isBodyweight: true,
                                    formCues: [
                                        'Body straight',
                                        'Pull elbows back',
                                        'Squeeze shoulder blades'
                                    ]
                                },
                                {
                                    name: 'Hammer Curls',
                                    description: 'Curls with neutral grip',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Palms face each other',
                                        'Keep elbows in',
                                        'Full range'
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'C',
                            exercises: [
                                {
                                    name: 'DB Rows',
                                    description: 'Single arm rows with support',
                                    sets: 3,
                                    repRange: '12-15',
                                    rest: 60,
                                    isBodyweight: false,
                                    formCues: [
                                        'Back parallel',
                                        'Pull to hip',
                                        'Control descent'
                                    ]
                                },
                                {
                                    name: 'Concentration Curls',
                                    description: 'Seated single arm curls',
                                    sets: 3,
                                    repRange: '12-15',
                                    isBodyweight: false,
                                    formCues: [
                                        'Elbow on inner thigh',
                                        'Full range of motion',
                                        'Slow negative'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // Phase 2 will be defined similarly with progressive overload
        phase2: {
            startDate: '2025-04-16',
            endDate: '2025-06-11',
            workouts: {
                // Phase 2 workouts will go here
                // Will include increased intensity and volume
            }
        }
    },

    getWorkout(phase, workoutId) {
        return this.phases[phase]?.workouts[workoutId] || null;
    },

    getCurrentPhase() {
        const today = new Date();
        return Object.entries(this.phases).find(([_, phase]) => {
            const start = new Date(phase.startDate);
            const end = new Date(phase.endDate);
            return today >= start && today <= end;
        })?.[0] || 'phase1';
    },

    getSuggestedWorkoutForDay(day) {
        const schedule = {
            1: 'chest_tri',    // Monday
            3: 'shoulders',    // Wednesday
            5: 'back_bi'       // Friday
        };
        const currentPhase = this.getCurrentPhase();
        return this.getWorkout(currentPhase, schedule[day]);
    }
};

export default WorkoutLibrary;
