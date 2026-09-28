/**
 * REST API for Room management
 */
const API_BASE = '/api/rooms';

export const roomApi = {
  async getAllRooms() {
    const res = await fetch(`${API_BASE}`);
    if (!res.ok) throw new Error('Không thể tải danh sách phòng');
    return await res.json();
  },

  async createRoom(roomName, maxPlayers, hostPlayer) {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, maxPlayers, hostPlayer })
    });
    if (!res.ok) throw new Error('Không thể tạo phòng mới');
    return await res.json();
  },

  async joinRoom(roomId, player) {
    const res = await fetch(`${API_BASE}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    });
    if (!res.ok) throw new Error('Không thể tham gia phòng');
    return await res.json();
  }
};
