import dataManager from './dataManager.js';

window.addEventListener('DOMContentLoaded', async () => {
  const selector = document.getElementById('userSelect');
  if (!selector) return;

  const current = await dataManager.getCurrentUser();
  selector.value = current;

  selector.addEventListener('change', async (e) => {
    await dataManager.setCurrentUser(e.target.value);
    location.reload();
  });
});
