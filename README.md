# Workout Tracker

A full-stack web application for tracking workouts, monitoring progress, and analyzing fitness data.
Version: 1.0.3
Last Updated: March 2024

## Recent Updates

### Version 1.0.3 (March 2024)
- Restructured Firebase operations for better offline support
- Enhanced progress tracking and analysis
- Improved data validation and error handling
- Added comprehensive workout definitions
- Updated UI components for better user feedback

### Major Changes
1. **Firebase Integration**
   - Centralized Firebase operations in firebaseService.js
   - Added offline support and data syncing
   - Improved error handling for Firebase operations
   - Enhanced data validation before saves

2. **Data Management**
   - Restructured data flow through dataManager.js
   - Added local storage fallbacks
   - Improved progress tracking algorithms
   - Enhanced data validation and type checking

3. **Progress Tracking**
   - New progress analysis features in progressTracker.js
   - Enhanced workout statistics
   - Improved personal best tracking
   - Added weekly progress visualization

4. **Workout System**
   - Complete workout definitions in workoutLibrary.js
   - Added support for supersets
   - Enhanced exercise type handling
   - Improved workout validation

## File Structure

### Core Files
├── firebase-config.js     # Firebase initialization and configuration
├── firebaseService.js     # Firebase operations and offline support
├── dataManager.js         # Data operations and state management
├── progressTracker.js     # Progress analysis and calculations
├── workoutLibrary.js      # Workout definitions and exercise data
├── progress.js            # Progress display and UI management
└── dashboard.js           # Main dashboard interface

### Key Components

#### Firebase Configuration (firebase-config.js)
- Basic Firebase initialization
- Firebase app configuration
- DB and Auth exports

#### Firebase Service (firebaseService.js)
- Firebase operations management
- Offline support
- Data synchronization
- Error handling

#### Data Manager (dataManager.js)
- Data operations coordination
- Local storage management
- State management
- Data validation

#### Progress Tracker (progressTracker.js)
- Progress analysis
- Statistics calculations
- Performance metrics
- Trend analysis

#### Workout Library (workoutLibrary.js)
- Workout definitions
- Exercise configurations
- Workout validation
- Type management

## Features

### Workout Management
- Three workout types: Chest & Triceps, Back & Biceps, Shoulders
- Superset support
- Exercise type handling (dumbbell/TRX)
- Rowing integration

### Progress Tracking
- Personal best tracking
- Progress visualization
- Weekly progress tracking
- Performance analytics

### Data Management
- Offline support
- Auto-sync when online
- Local storage backup
- Data validation

### User Interface
- Responsive design
- Loading states
- Error handling
- Progress visualization

## Technical Details

### Data Flow
User Input → UI Components → Data Manager → Firebase Service → Firebase
     ↑          ↓              ↓               ↓               ↓
Progress Tracker ← Workout Library ← Local Storage ← Offline Cache

### Error Handling
- Input validation
- Network error handling
- Data validation
- Type checking
- Fallback mechanisms

### Performance Optimizations
- Local storage caching
- Offline first approach
- Batch updates
- Lazy loading

## Usage

### Installation
git clone https://github.com/username/workout-tracker.git
npm install
Update firebase-config.js with your Firebase credentials

### Development
npm run dev
npm run build

## Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore
3. Update configuration in firebase-config.js
4. Set up authentication (optional)

### Environment Variables
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id

## Key Updates and Bug Fixes

### Firebase Operations
- Centralized Firebase operations in firebaseService.js
- Added robust offline support with local storage fallback
- Improved error handling and data validation
- Enhanced sync functionality

### Data Management
- Restructured data flow through dataManager.js
- Improved state management and data persistence
- Enhanced progress tracking and analysis
- Added data validation and type checking

### User Interface
- Fixed toFixed() number formatting issues
- Improved loading state management
- Enhanced error message display
- Added progress visualization improvements

### Progress Tracking
- Enhanced workout statistics calculation
- Improved personal best tracking
- Added weekly progress visualization
- Fixed date handling issues

### Code Organization
- Improved separation of concerns
- Enhanced module interactions
- Better error propagation
- Improved code documentation

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments
* Firebase team for the excellent documentation
* Contributors and testers
* Open source community
