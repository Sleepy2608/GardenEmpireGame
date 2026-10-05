/*
   GARDEN EMPIRE — WAITING ROOM UI
   Handles: host detection, player list rendering, start game, WebSocket events
*/
import { roomApi } from '../api/roomApi.js';
import { GameSocket } from '../websocket/gameSocket.js';
import { CONFIG } from '../config.js';

class WaitingRoomUI {
  constructor() {
    // Player identity from localStorage
    this.myId     = localStorage.getItem('garden_empire_guest_id');
    this.myName   = localStorage.getItem('garden_empire_guest_name');
    this.myAvatar = localStorage.getItem('garden_empire_guest_avatar') || '🌱';

    // Room from URL
    const params  = new URLSearchParams(window.location.search);
    this.roomId   = params.get('roomId');

    if (!this.myName || !this.roomId) {
      window.location.href = 'index.html';
      return;
    }

    this.room   = null;
    this.socket = null;
    this.init();
  }

  async init() {
    this._renderSelfBadge();
    this._bindStaticEvents();

    try {
      this.room = await roomApi.getRoom(this.roomId);
      this._renderRoom();
    } catch (err) {
      this._showToast('Không tìm thấy phòng: ' + err.message, 'error');
      setTimeout(() => { window.location.href = 'lobby.html'; }, 2000);
      return;
    }

    this._connectWebSocket();
  }

  // ── Self badge ─────────────────────────────────────────────────
  _renderSelfBadge() {
    const avatar = document.getElementById('self-avatar');
    const name   = document.getElementById('self-name');
    if (avatar) avatar.textContent = this.myAvatar;
    if (name)   name.textContent   = this.myName;
  }

  // ── Static button bindings ────────────────────────────────────
  _bindStaticEvents() {
    // Copy room code
    document.getElementById('btn-copy-code')?.addEventListener('click', () => {
      const code = document.getElementById('room-code')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('btn-copy-code');
        if (btn) { btn.textContent = '✅'; btn.classList.add('copied'); }
        this._showToast('Đã sao chép mã phòng!');
        setTimeout(() => {
          if (btn) { btn.textContent = '📋'; btn.classList.remove('copied'); }
        }, 1500);
      });
    });

    // Start game (host only)
    document.getElementById('btn-start-game')?.addEventListener('click', () => this._startGame());

    // Leave room
    document.getElementById('btn-leave-room')?.addEventListener('click', () => this._leaveRoom());
  }

  // ── Render room info & player list ────────────────────────────
  _renderRoom() {
    if (!this.room) return;
    const isHost = this.room.hostId === this.myId;

    // Room info
    document.getElementById('room-name').textContent  = this.room.name || 'Vườn Thượng Uyển';
    document.getElementById('room-code').textContent  = this.room.code || this.room.id;
    document.getElementById('player-count').textContent = this.room.players?.length || 0;
    document.getElementById('max-players').textContent  = this.room.maxPlayers || 4;

    // Show correct control panel
    document.getElementById('host-controls').classList.toggle('hidden', !isHost);
    document.getElementById('guest-controls').classList.toggle('hidden', isHost);

    // Enable start button only if ≥ 2 players
    if (isHost) {
      const count  = this.room.players?.length || 0;
      const canStart = count >= 2;
      const btn    = document.getElementById('btn-start-game');
      const hint   = document.getElementById('start-hint');
      if (btn)  btn.disabled = !canStart;
      if (hint) hint.textContent = canStart
        ? `✅ ${count} người đã sẵn sàng — có thể bắt đầu!`
        : `⚠️ Cần ít nhất 2 người chơi (hiện có ${count})`;
    }

    // Player list
    this._renderPlayerList(this.room.players || [], this.room.hostId, this.room.maxPlayers);
  }

  _renderPlayerList(players, hostId, maxPlayers) {
    const grid = document.getElementById('player-list');
    if (!grid) return;

    grid.innerHTML = '';

    // Filled slots
    players.forEach(player => {
      const isHost  = player.id === hostId;
      const card = document.createElement('div');
      card.className = `player-card${isHost ? ' is-host' : ''}`;
      card.dataset.playerId = player.id;
      card.innerHTML = `
        <div class="player-avatar">${player.avatar || '🌱'}</div>
        <div class="player-name">${this._escape(player.name)}</div>
        <div class="player-badge ${isHost ? 'host-badge' : 'guest-badge'}">
          ${isHost ? '👑 Chủ Phòng' : '🌿 Sẵn Sàng'}
        </div>
      `;
      grid.appendChild(card);
    });

    // Empty slots
    const empty = (maxPlayers || 4) - players.length;
    for (let i = 0; i < empty; i++) {
      const slot = document.createElement('div');
      slot.className = 'player-slot-empty';
      slot.innerHTML = `<span class="player-slot-empty-icon">🌱</span><span>Chờ người chơi...</span>`;
      grid.appendChild(slot);
    }
  }

  // ── WebSocket ─────────────────────────────────────────────────
  _connectWebSocket() {
    this.socket = new GameSocket(this.roomId, this.myId, (msg) => this._onMessage(msg));
    this.socket.connect();
  }

  _onMessage(msg) {
    switch (msg.type) {
      case 'ROOM_UPDATE':
        // Cập nhật danh sách người chơi real-time
        this.room = msg.room;
        this._renderRoom();
        break;

      case 'GAME_STARTED':
        // Chủ phòng bấm bắt đầu → tất cả chuyển sang game
        this._showToast('🎮 Trò chơi bắt đầu! Đang chuyển sang bàn đấu...');
        setTimeout(() => {
          window.location.href = `game.html?roomId=${msg.roomId || this.roomId}`;
        }, 800);
        break;

      case 'ERROR':
        this._showToast(msg.message || 'Lỗi không xác định', 'error');
        break;

      default:
        break;
    }
  }

  // ── Actions ───────────────────────────────────────────────────
  async _startGame() {
    const btn = document.getElementById('btn-start-game');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang bắt đầu...'; }
    try {
      await roomApi.startGame(this.roomId, this.myId);
      // Server sẽ broadcast GAME_STARTED → _onMessage xử lý chuyển trang
    } catch (err) {
      this._showToast(err.message || 'Không thể bắt đầu trò chơi', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<span class="btn-start-icon">✨</span><span>Bắt Đầu Trò Chơi</span>'; }
    }
  }

  async _leaveRoom() {
    try {
      if (this.socket) this.socket.disconnect();
      await roomApi.leaveRoom(this.roomId, this.myId);
    } catch (_) {
      // ignore
    } finally {
      window.location.href = 'lobby.html';
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  _escape(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  _showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className   = `toast${type === 'error' ? ' error' : ''}`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────
if (document.getElementById('player-list')) {
  new WaitingRoomUI();
}
