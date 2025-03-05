```md
# Dad & Alex Workout Tracker

A mobile-first progressive web application (PWA) for tracking workouts, focused on chest, arms, and shoulders, with integrated rowing metrics. Built for a father-son duo using dumbbells, TRX equipment, and Hydrow rowing in a home gym setting.

---

## Program Timeline

- Start Date: March 3, 2025  
- Program Phase 1: Weeks 1-8 (Current)
- Phase 2 Start: April 28, 2025

### Program Progression

#### Phase 1 (Weeks 1-8)
Current workout split with focus on:
- Form mastery
- Building baseline strength  
- Establishing mind-muscle connection
- Learning proper tempo

Target Progress Metrics:
- Week 1-2: Focus on form, no weight targets
- Week 3-4: Begin progressive overload
- Week 5-6: Increase weight when hitting rep targets
- Week 7-8: Evaluate for Phase 2 readiness

#### Phase 2 (Weeks 9-16) 
Advanced techniques to implement:
- Drop sets on final set
- Supersets: Chest/Triceps, Back/Biceps
- Decreased rest periods
- Increased weight targets  
- Modified rep ranges

---

## Technical Architecture

### Core Components
- Firebase real-time database for data persistence
- PWA with offline support
- Auto-save and sync functionality
- Version: 1.0.6

### Data Structure & Security
```javascript
/workouts/
  /{userId}_{workoutType}/
    - exercises: []
    - date: timestamp
    - rowing: {}
    - version: string

/progress/
  /{userId}/
    - exercises: {}
    - rowing: {}
    - personalBests: {}

/workoutHistory/
  /{userId}/
    - workouts: []
    - timestamps: []
```
*Note: Firebase security rules restrict data access by userId*

### Rowing Integration
Tracks three workout types:
- Breathe: Endurance focus
- Sweat: HIIT intervals  
- Drive: Power development

Metrics tracked per session:
- Pace (m/min)
- Total meters
- Duration  
- Pace per 500m
- Personal bests

### Auto-Save & Sync
- Automatic save every 30 seconds during workouts
- Offline storage with IndexedDB
- Background sync when connection restored
- Conflict resolution with timestamp verification

---

## Workout Schedule

### Monday - Chest & Triceps
Exercise | Sets x Reps | Rest | Notes
---------|-------------|------|-------
DB Bench Press | 4x8-12 | 90s | Progress weight when 12 reps achieved
Incline DB Press | 3x8-12 | 90s | 30-45° incline
TRX Push-ups | 3x10-15 | 60s | Bodyweight, adjust foot position
DB Flyes | 3x12-15 | 60s | Light weight, focus on stretch
TRX Tricep Press | 3x12-15 | 60s | Bodyweight, lean for intensity

### Wednesday - Shoulders & Traps
Exercise | Sets x Reps | Rest | Notes
---------|-------------|------|-------
Seated DB Press | 4x8-12 | 90s | Start conservatively
Lateral Raises | 3x12-15 | 60s | Strict form priority
Front Raises | 3x12 | 60s | Alternate arms
TRX Y-Raises | 3x12-15 | 60s | Bodyweight
DB Shrugs | 3x15 | 60s | Hold peak contraction

### Friday - Back & Biceps
Exercise | Sets x Reps | Rest | Notes
---------|-------------|------|-------
Modified Pull-ups | 3xMax | 90s | Bodyweight, bend knees
Standing DB Curls | 3x10-12 | 60s | No swinging
Hammer Curls | 3x12 | 60s | Neutral grip
TRX Rows | 3x12-15 | 60s | Bodyweight, adjust angle
Concentration Curls | 2x12 | 60s | Strict form

---

## Progress Tracking

### Rowing Metrics
- Real-time pace calculation
- Historical trend analysis
- Personal best tracking by workout type
- Weekly volume tracking
- Average pace progression

### Strength Progress
- Weight progression tracking
- Rep range monitoring
- Volume calculations
- Personal best records
- Progressive overload guidance

---

## File Structure
All files are located in the main branch of the GitHub repository:
```text
├── README.md
├── dashboard.js
├── dataManager.js
├── firebase-config.js
├── firebaseService.js
├── index.html
├── manifest.json
├── progress.html
├── progress.js
├── progressTracker.js
├── styles.css
├── workout.html
├── workoutLibrary.js
└── workoutTracker.js
```

---

## Features

### Workout Tracking
- Real-time exercise logging
- Auto-saving progress
- Offline capability
- Form cues and descriptions
- Superset support

### Progress Monitoring
- Weekly progress visualization
- Personal best tracking
- Progress trend analysis
- Volume progression
- Recovery monitoring

### Rowing Integration
- Three workout types tracking
- Pace calculations
- Distance monitoring
- Time tracking
- Performance trending

---

## Setup

1. Clone repository
2. Configure Firebase:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain",
  projectId: "your-project-id",
  storageBucket: "your-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```
3. Open index.html in modern web browser
4. Add to home screen for PWA features

*Note: Secure your Firebase API keys and configure security rules appropriately*

---

## Equipment Required

- Dumbbells (0-100 lbs)
- TRX Straps
- Pull-up/Dip Rack
- Adjustable Bench
- Hydrow (for warm-up)

## Space Requirements

- 8' ceiling height
- Space for bench setup
- Wall mount for TRX

---

## Browser Support
- Chrome (recommended)
- Safari
- Firefox
- Mobile browsers
- PWA support required

## Notes
- Offline support maintains full functionality
- Data syncs automatically when online
- Auto-saves every 30 seconds
- Update program metrics every 8 weeks
- Track body measurements monthly
- Take progress photos every 4 weeks

---

## Program Success Metrics

### Monthly Check-ins
- Track body measurements
- Review progress photos
- Assess energy levels
- Evaluate recovery quality
- Update weight targets

### Weekly Reviews
- Form improvement
- Weight progression
- Exercise confidence
- Recovery time
- Overall satisfaction

Remember: Progress at your own pace and prioritize form over weight. Adjust the program based on individual recovery and progression rates.
```
