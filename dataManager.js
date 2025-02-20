// dataManager.js
class DataManager {
    constructor() {
        this.storageKey = 'currentUser';
        this.defaultUser = 'Dad';
    }

    getCurrentUser() {
        return localStorage.getItem(this.storageKey) || this.defaultUser;
    }

    setCurrentUser(user) {
        localStorage.setItem(this.storageKey, user);
        return true;
    }
}
