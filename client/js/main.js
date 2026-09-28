/**
 * GardenEmpire - Frontend Initialization (Guest Entry)
 */
document.addEventListener('DOMContentLoaded', () => {
  const guestForm = document.getElementById('guest-form');
  const guestNameInput = document.getElementById('guest-name');

  // Load existing guest name from localStorage if available
  const savedGuest = localStorage.getItem('garden_empire_guest_name');
  if (savedGuest && guestNameInput) {
    guestNameInput.value = savedGuest;
  }

  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = guestNameInput.value.trim();
      if (!guestName) return;

      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('garden_empire_guest_id', guestId);
      localStorage.setItem('garden_empire_guest_name', guestName);

      // Redirect to lobby
      window.location.href = 'lobby.html';
    });
  }
});
