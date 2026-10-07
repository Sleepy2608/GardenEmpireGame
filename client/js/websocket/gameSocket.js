import { CONFIG } from '../config.js';
import { sessionGuard } from '../utils/sessionGuard.js';

/**
 * WebSocket handler for real-time multiplayer updates
 */
export class GameSocket {
  constructor(gameId, playerId, onMessageCallback) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.onMessageCallback = onMessageCallback;
    this.socket = null;
    this.isConnected = false;
    this.manualDisconnect = false;
  }

  connect() {
    const wsBase = CONFIG.WS_BASE_URL;
    const url = `${wsBase}/ws/game?gameId=${this.gameId}&playerId=${this.playerId}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Đã kết nối WebSocket game:', this.gameId);
      this.send('GET_STATE', {});
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SESSION_TERMINATED') {
          console.warn('[GameSocket] Phiên kết nối bị hủy do đăng nhập nơi khác:', data);
          this.manualDisconnect = true;
          this.disconnect();
          sessionGuard.triggerConflict(data.message || 'Đã đăng nhập ở một tab hoặc thiết bị khác');
          return;
        }

        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp dữ liệu WebSocket:', err);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      if (this.manualDisconnect) {
        console.log('WebSocket đóng kết nối chủ động hoặc bị ngắt phiên.');
        return;
      }
      console.log('WebSocket đã đóng kết nối, thử kết nối lại sau 2 giây...');
      setTimeout(() => this.connect(), 2000);
    };

    this.socket.onerror = (error) => {
      console.error('Lỗi WebSocket:', error);
    };
  }

  send(actionType, payload = {}) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket chưa sẵn sàng');
      return;
    }
    const message = {
      type: actionType,
      gameId: this.gameId,
      playerId: this.playerId,
      payload: payload,
      timestamp: Date.now()
    };
    this.socket.send(JSON.stringify(message));
  }

  disconnect() {
    this.manualDisconnect = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}
