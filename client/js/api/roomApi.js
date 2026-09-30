import { CONFIG } from '../config.js';

const getApiBase = () => `${CONFIG.API_BASE_URL}/api/rooms`;

export const roomApi = {
  async getAllRooms() {
    const res = await fetch(`${getApiBase()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách phòng');
    return await res.json();
  },

  async createRoom(roomName, maxPlayers, hostPlayer) {
    const res = await fetch(`${getApiBase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, maxPlayers, hostPlayer })
    });
    if (!res.ok) throw new Error('Không thể tạo phòng mới');
    return await res.json();
  },

  async getRoom(roomId) {
    const res = await fetch(`${getApiBase()}/${roomId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không tìm thấy phòng');
    }
    return await res.json();
  },

  async joinRoom(roomId, player) {
    const res = await fetch(`${getApiBase()}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tham gia phòng');
    }
    return await res.json();
  },

  async joinRoomByCode(code, player) {
    const res = await fetch(`${getApiBase()}/join-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, id: player.id, name: player.name, avatar: player.avatar })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Mã phòng không hợp lệ hoặc phòng đã đầy');
    }
    return await res.json();
  },

  async leaveRoom(roomId, playerId) {
    const res = await fetch(`${getApiBase()}/${roomId}/leave?playerId=${encodeURIComponent(playerId)}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể rời phòng');
    }
    return await res.json();
  },

  async startGame(roomId, hostId) {
    const res = await fetch(`${getApiBase()}/${roomId}/start?hostId=${encodeURIComponent(hostId)}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể bắt đầu trận đấu');
    }
    return await res.json();
  }
};
