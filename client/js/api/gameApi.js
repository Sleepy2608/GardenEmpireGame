/**
 * REST API for Game actions
 */
const API_BASE = '/api/game';

export const gameApi = {
  async getGameState(gameId) {
    const res = await fetch(`${API_BASE}/${gameId}/state`);
    if (!res.ok) throw new Error('Không thể lấy trạng thái game');
    return await res.json();
  },

  async performAction(gameId, actionPayload) {
    const res = await fetch(`${API_BASE}/${gameId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionPayload)
    });
    if (!res.ok) throw new Error('Thao tác không hợp lệ');
    return await res.json();
  }
};
