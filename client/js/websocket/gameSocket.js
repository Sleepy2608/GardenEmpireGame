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
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:8080';
    const url = `${protocol}//${host}/ws/game?gameId=${this.gameId}&playerId=${this.playerId}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Đã kết nối WebSocket game:', this.gameId);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp dữ liệu WebSocket:', err);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      console.log('WebSocket đã đóng kết nối');
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
    if (this.socket) {
      this.socket.close();
    }
  }
}
