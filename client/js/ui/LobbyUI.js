/*
   GARDEN EMPIRE — LOBBY UI COMPONENT
*/
import { roomApi } from '../api/roomApi.js';
import { sessionGuard } from '../utils/sessionGuard.js';
import { navigateTo } from '../utils/navigation.js';

export class LobbyUI {
  constructor() {
    this.guestId = localStorage.getItem('garden_empire_guest_id');
    this.guestName = localStorage.getItem('garden_empire_guest_name');
    this.guestAvatar = localStorage.getItem('garden_empire_guest_avatar') || '🌱';

    this.isCreatingRoom = false;
    this.isJoiningRoom = false;

    if (!this.guestName) {
      navigateTo('index');
      return;
    }

    this.init();
  }

  init() {
    // Kích hoạt bảo vệ phiên độc quyền trên platform/browser
    sessionGuard.init({
      onConflict: () => {
        if (this.pollInterval) clearInterval(this.pollInterval);
      }
    });

    // Update user profile banner
    const displayUserName = document.getElementById('display-user-name');
    const displayUserAvatar = document.getElementById('display-user-avatar');

    if (displayUserName) displayUserName.textContent = this.guestName;
    if (displayUserAvatar) displayUserAvatar.textContent = this.guestAvatar;

    // Return to Home / Index
    const btnHome = document.getElementById('btn-home') || document.getElementById('btn-logout');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        navigateTo('index');
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
    // Tự động làm mới danh sách phòng mỗi 7 giây (chạy ngầm)
    this.pollInterval = setInterval(() => this.loadRooms(true), 7000);
    window.addEventListener('beforeunload', () => clearInterval(this.pollInterval));
  }

  async loadRooms(isSilent = false) {
    const listContainer = document.getElementById('room-list');
    const countBadge = document.getElementById('active-rooms-count');
    if (!listContainer) return;

    // 1. SWR Cache: Render ngay lập tức danh sách phòng từ sessionStorage (0ms)
    let hasRenderedCache = false;
    const cachedData = sessionStorage.getItem('garden_empire_cached_rooms');
    if (cachedData && !isSilent && listContainer.children.length === 0) {
      try {
        const cachedRooms = JSON.parse(cachedData);
        if (Array.isArray(cachedRooms)) {
          this._renderRoomsList(cachedRooms, listContainer, countBadge);
          hasRenderedCache = true;
        }
      } catch (_) {}
    }

    // 2. Nếu chưa có cache và không phải silent refresh: Hiển thị Skeleton Shimmer
    let coldStartTimer = null;
    if (!hasRenderedCache && !isSilent) {
      listContainer.innerHTML = `
        <div class="room-skeleton-wrap">
          <div class="room-card-skeleton"></div>
          <div class="room-card-skeleton"></div>
        </div>
        <p class="loading-hint">🌱 Đang kết nối danh sách phòng...</p>
      `;

      // Sau 3.5s nếu chưa xong -> Máy chủ Render đang khởi động (Cold Start)
      coldStartTimer = setTimeout(() => {
        const hint = listContainer.querySelector('.loading-hint');
        if (hint) {
          hint.innerHTML = `<em>Vui lòng đợi giây lát...</em>`;
        }
      }, 3500);
    }

    try {
      const allRooms = await roomApi.getAllRooms();
      if (coldStartTimer) clearTimeout(coldStartTimer);

      const rooms = (allRooms || []).filter(r => r.status === 'WAITING' || !r.status);
      sessionStorage.setItem('garden_empire_cached_rooms', JSON.stringify(rooms));
      this._renderRoomsList(rooms, listContainer, countBadge);
    } catch (err) {
      if (coldStartTimer) clearTimeout(coldStartTimer);
      if (!isSilent || listContainer.children.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem;">
            <p class="text-gold" style="margin-bottom: 0.75rem;">⚠️ Lỗi kết nối sảnh: ${err.message}</p>
            <button id="btn-retry-load" class="btn-nature-secondary btn-sm">Thử lại</button>
          </div>
        `;
        document.getElementById('btn-retry-load')?.addEventListener('click', () => this.loadRooms());
      }
    }
  }

  _renderRoomsList(rooms, listContainer, countBadge) {
    if (countBadge) countBadge.textContent = rooms.length;

    if (rooms.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
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
              <span class="room-title">${this._escape(room.name || 'Vườn Thượng Uyển')}</span>
              <span class="room-status-badge ${isPlaying ? 'status-playing' : 'status-waiting'}">
                ${isPlaying ? 'ĐANG CHƠI' : 'ĐANG CHỜ'}
              </span>
            </div>
            <div class="room-meta-row">
              <span>👑 Chủ phòng: <strong>${this._escape(room.hostName || 'Nghệ nhân')}</strong></span>
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
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async handleCreateRoom(e) {
    e.preventDefault();
    if (this.isCreatingRoom) return;

    const roomNameInput = document.getElementById('room-name');
    const maxPlayersInput = document.getElementById('max-players');
    const createBtn = document.getElementById('btn-create-room');

    const roomName = roomNameInput ? roomNameInput.value.trim() : '';
    const maxPlayers = maxPlayersInput ? parseInt(maxPlayersInput.value, 10) : 4;

    if (!roomName) return;

    this.isCreatingRoom = true;
    const originalBtnHtml = createBtn ? createBtn.innerHTML : '';

    if (createBtn) {
      createBtn.disabled = true;
      createBtn.classList.add('is-loading');
      createBtn.innerHTML = `<span>⏳ Đang khởi tạo phòng...</span>`;
    }
    if (roomNameInput) roomNameInput.disabled = true;
    if (maxPlayersInput) maxPlayersInput.disabled = true;

    try {
      const room = await roomApi.createRoom(roomName, maxPlayers, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      navigateTo('room', { roomId: room.id });
    } catch (err) {
      alert(`Lỗi tạo phòng: ${err.message}`);
      this.isCreatingRoom = false;
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.classList.remove('is-loading');
        createBtn.innerHTML = originalBtnHtml;
      }
      if (roomNameInput) roomNameInput.disabled = false;
      if (maxPlayersInput) maxPlayersInput.disabled = false;
    }
  }

  async handleJoinByCode(e) {
    e.preventDefault();
    if (this.isJoiningRoom) return;

    const codeInput = document.getElementById('join-room-code');
    const joinCodeForm = document.getElementById('join-code-form');
    const joinBtn = joinCodeForm ? joinCodeForm.querySelector('button[type="submit"]') : null;
    const code = codeInput ? codeInput.value.trim() : '';
    if (!code) return;

    this.isJoiningRoom = true;
    const originalBtnHtml = joinBtn ? joinBtn.innerHTML : '';

    if (joinBtn) {
      joinBtn.disabled = true;
      joinBtn.classList.add('is-loading');
      joinBtn.innerHTML = `<span>⏳ Đang vào phòng...</span>`;
    }
    if (codeInput) codeInput.disabled = true;

    try {
      const room = await roomApi.joinRoomByCode(code, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      navigateTo('room', { roomId: room.id });
    } catch (err) {
      alert(`Lỗi vào phòng: ${err.message}`);
      this.isJoiningRoom = false;
      if (joinBtn) {
        joinBtn.disabled = false;
        joinBtn.classList.remove('is-loading');
        joinBtn.innerHTML = originalBtnHtml;
      }
      if (codeInput) codeInput.disabled = false;
    }
  }

  async handleJoinRoom(roomId) {
    if (this.isJoiningRoom) return;
    this.isJoiningRoom = true;

    const allJoinBtns = document.querySelectorAll('.btn-join');
    allJoinBtns.forEach(btn => btn.disabled = true);

    try {
      await roomApi.joinRoom(roomId, {
        id: this.guestId,
        name: this.guestName,
        avatar: this.guestAvatar
      });
      navigateTo('room', { roomId: roomId });
    } catch (err) {
      alert(`Lỗi tham gia phòng: ${err.message}`);
      this.isJoiningRoom = false;
      allJoinBtns.forEach(btn => btn.disabled = false);
    }
  }
}

if (document.getElementById('room-list')) {
  new LobbyUI();
}
