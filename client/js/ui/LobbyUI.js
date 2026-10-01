/*
   GARDEN EMPIRE — LOBBY UI COMPONENT
*/
import { roomApi } from '../api/roomApi.js';

export class LobbyUI {
  constructor() {
    this.guestId = localStorage.getItem('garden_empire_guest_id');
    this.guestName = localStorage.getItem('garden_empire_guest_name');
    this.guestAvatar = localStorage.getItem('garden_empire_guest_avatar') || '🌱';

    if (!this.guestName) {
      window.location.href = 'index.html';
      return;
    }

    this.init();
  }

  init() {
    // Update user profile banner
    const displayUserName = document.getElementById('display-user-name');
    const displayUserAvatar = document.getElementById('display-user-avatar');

    if (displayUserName) displayUserName.textContent = this.guestName;
    if (displayUserAvatar) displayUserAvatar.textContent = this.guestAvatar;

    // Logout / Change Name
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('garden_empire_guest_name');
        window.location.href = 'index.html';
      });
    }

    // Refresh Room List
    const btnRefresh = document.getElementById('btn-refresh-rooms');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadRooms());
    }

    // Create Room Form
    const createForm = document.getElementById('create-room-form');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
    }

    // Join by Code Form
    const joinCodeForm = document.getElementById('join-code-form');
    if (joinCodeForm) {
      joinCodeForm.addEventListener('submit', (e) => this.handleJoinByCode(e));
    }

    this.loadRooms();
  }

  async loadRooms() {
    const listContainer = document.getElementById('room-list');
    const countBadge = document.getElementById('active-rooms-count');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Đang tải danh sách phòng...</p>';
      const rooms = await roomApi.getAllRooms();

      if (countBadge) countBadge.textContent = rooms?.length || 0;

      if (!rooms || rooms.length === 0) {
        listContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍃</div>
            <p>Chưa có phòng nào đang mở. Hãy là người đầu tiên tạo phòng!</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = '';
      rooms.forEach(room => {
        const isFull = (room.players?.length || 0) >= (room.maxPlayers || 4);
        const isPlaying = room.status === 'PLAYING';
        const card = document.createElement('div');
        card.className = `room-card ${isPlaying ? 'is-playing' : 'is-waiting'}`;

        card.innerHTML = `
          <div class="room-card-left">
            <div class="room-host-avatar" title="Chủ phòng">${room.hostAvatar || '🏡'}</div>
            <div class="room-info">
              <div class="room-title-row">
                <span class="room-title">${room.name || 'Vườn Thượng Uyển'}</span>
                <span class="room-status-badge ${isPlaying ? 'status-playing' : 'status-waiting'}">
                  ${isPlaying ? 'ĐANG CHƠI' : 'ĐANG CHỜ'}
                </span>
              </div>
              <div class="room-meta-row">
                <span>👑 Chủ phòng: <strong>${room.hostName || 'Nghệ nhân'}</strong></span>
                <span class="meta-dot">•</span>
                <span>🔑 Mã: <code>${room.code || room.id}</code></span>
              </div>
            </div>
          </div>

          <div class="room-card-right">
            <div class="room-players-pill" title="Số người chơi hiện tại">
              <span>👥</span>
              <strong>${room.players?.length || 0}/${room.maxPlayers || 4}</strong>
            </div>
            <button class="btn-nature-primary btn-sm btn-join" ${isFull || isPlaying ? 'disabled' : ''}>
              ${isPlaying ? 'Đang Chơi' : isFull ? 'Đã Đầy' : 'Tham Gia ➔'}
            </button>
          </div>
        `;

        const joinBtn = card.querySelector('.btn-join');
        if (joinBtn && !isFull && !isPlaying) {
          joinBtn.addEventListener('click', () => this.handleJoinRoom(room.id));
        }

        listContainer.appendChild(card);
      });
    } catch (err) {
      listContainer.innerHTML = `<p class="text-gold" style="grid-column: 1/-1; text-align: center;">Lỗi kết nối sảnh: ${err.message}</p>`;
    }
  }

  async handleCreateRoom(e) {
    e.preventDefault();
    const roomNameInput = document.getElementById('room-name');
    const maxPlayersInput = document.getElementById('max-players');

    const roomName = roomNameInput.value.trim();
    const maxPlayers = parseInt(maxPlayersInput.value, 10);

    try {
      const room = await roomApi.createRoom(roomName, maxPlayers, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      window.location.href = `game.html?roomId=${room.id}`;
    } catch (err) {
      alert(`Lỗi tạo phòng: ${err.message}`);
    }
  }

  async handleJoinByCode(e) {
    e.preventDefault();
    const codeInput = document.getElementById('join-room-code');
    const code = codeInput.value.trim();
    if (!code) return;

    try {
      const room = await roomApi.joinRoomByCode(code, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      window.location.href = `game.html?roomId=${room.id}`;
    } catch (err) {
      alert(`Lỗi vào phòng: ${err.message}`);
    }
  }

  async handleJoinRoom(roomId) {
    try {
      await roomApi.joinRoom(roomId, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      window.location.href = `game.html?roomId=${roomId}`;
    } catch (err) {
      alert(`Lỗi tham gia phòng: ${err.message}`);
    }
  }
}

if (document.getElementById('room-list')) {
  new LobbyUI();
}
