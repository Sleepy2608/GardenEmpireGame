/*
   GARDEN EMPIRE — GUEST ENTRY LOGIC
*/

document.addEventListener('DOMContentLoaded', () => {
  const guestForm = document.getElementById('guest-form');
  const guestNameInput = document.getElementById('guest-name');
  const avatarButtons = document.querySelectorAll('.avatar-option');
  const selectedAvatarInput = document.getElementById('selected-avatar');

  // Load existing guest details
  const savedGuest = localStorage.getItem('garden_empire_guest_name');
  const savedAvatar = localStorage.getItem('garden_empire_guest_avatar') || '🌱';

  if (savedGuest && guestNameInput) {
    guestNameInput.value = savedGuest;
  }

  if (savedAvatar && selectedAvatarInput) {
    selectedAvatarInput.value = savedAvatar;
    avatarButtons.forEach(btn => {
      if (btn.dataset.avatar === savedAvatar) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  // Handle avatar click
  avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatarInput.value = btn.dataset.avatar;
    });
  });

  // Handle form submit
  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = guestNameInput.value.trim();
      const guestAvatar = selectedAvatarInput.value || '🌱';
      if (!guestName) return;

      let guestId = localStorage.getItem('garden_empire_guest_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      }

      localStorage.setItem('garden_empire_guest_id', guestId);
      localStorage.setItem('garden_empire_guest_name', guestName);
      localStorage.setItem('garden_empire_guest_avatar', guestAvatar);

      window.location.href = 'lobby.html';
    });
  }
});
