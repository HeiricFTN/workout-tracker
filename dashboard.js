// dashboard.js
const Dashboard rd = {
    init() {
        console.log('Initializing dashboard');
        this.setupButtons();
        this.updateButtonStyles();
       },

    setupButtons() {
        // Get button elements
        const dadButton = document.getElementById('dadButton');
        consonst alexButton = document.getElementById('alexButton');

        // Add click handlers
        if (dadButton) {
            dadButton.onclick = () => {
                console.log('Dad clicked');
                this.handleUserSwitch('Dad');
            };
        }

        if (alexButton) {
            alexBexButton.onclick = () => {
                console.log('Alex clicked');
                this.handleUserSwitch('Alex');
            };
        }
    },

    handleUserSwitch(user) {
        localStorage.setItem('currentUser', user);
        this.updateButtonStyles(user);
    },

    updateButtonStyles(activeUser = 'Dad') {
        const dadButton = document.getElementById('dadButton');
        const alexButton = document.getElementById('alexButton');

        if (dadButton && alexButton) {
            // Reset both buttons
            dadButton.className = 'flex-1 py-2 px-4 rounded-lg bg-gray-200';
            alexButton.className = 'flex-1 py-2 px-4 rounded-lg bg-gray-200';

            // Set active button
            if (activeUser === 'Dad') {
                dadButton.className = 'flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white';
            } else {
                alexButton.className = 'flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white';
            }
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});
