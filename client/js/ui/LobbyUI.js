/**
 * UI Component for Lobby management and Room handling
 */
import { roomApi } from '../api/roomApi.js';

export class LobbyUI {
  constructor() {
    this.guestId = localStorage.getItem('garden_empire_guest_id');
    this.guestName = localStorage.getItem('garden_empire_guest_name');
    
    if (!this.guestName) {
      window.location.href = 'index.html';
      return;
    }

    this.init();
  }

  init() {
    const displayUserName = document.getElementById('display-user-name');
    if (displayUserName) {
      displayUserName.textContent = `Khách: ${this.guestName}`;
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('garden_empire_guest_name');
        window.location.href = 'index.html';
      });
    }

    const btnRefresh = document.getElementById('btn-refresh-rooms');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadRooms());
    }

    const createForm = document.getElementById('create-room-form');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
    }

    this.loadRooms();
  }

  async loadRooms() {
    const listContainer = document.getElementById('room-list');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = '<p>Đang tải danh sách phòng...</p>';
      const rooms = await roomApi.getAllRooms();
      
      if (!rooms || rooms.length === 0) {
        listContainer.innerHTML = '<p>Chưa có phòng nào. Hãy tạo phòng mới!</p>';
        return;
      }

      listContainer.innerHTML = '';
      rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'room-item-card';
        item.innerHTML = `
          <div>
            <strong>${room.name}</strong> (${room.players?.length || 0}/${room.maxPlayers})
            <div>Chủ phòng: ${room.hostName}</div>
          </div>
          <button class="btn-primary btn-join" data-id="${room.id}">Tham gia</button>
        `;
        item.querySelector('.btn-join').addEventListener('click', () => this.handleJoinRoom(room.id));
        listContainer.appendChild(item);
      });
    } catch (err) {
      listContainer.innerHTML = `<p class="error">${err.message}</p>`;
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
        name: this.guestName
      });
      window.location.href = `game.html?roomId=${room.id}`;
    } catch (err) {
      alert(`Lỗi tạo phòng: ${err.message}`);
    }
  }

  async handleJoinRoom(roomId) {
    try {
      await roomApi.joinRoom(roomId, {
        id: this.guestId,
        name: this.guestName
      });
      window.location.href = `game.html?roomId=${roomId}`;
    } catch (err) {
      alert(`Lỗi tham gia phòng: ${err.message}`);
    }
  }
}

// Auto-instantiate when in lobby page
if (document.getElementById('room-list')) {
  new LobbyUI();
}
