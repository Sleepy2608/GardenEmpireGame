/*
   GARDEN EMPIRE — GAME ACTION LOGS COMPONENT
   Hiển thị nhật ký hành động trực tiếp, có thể cuộn và thu gọn/mở rộng.
*/

export class GameLogUI {
  constructor() {
    this.widgetEl = null;
    this.feedEl = null;
    this.tickerEl = null;
    this.latestTextEl = null;
    this.toggleBtnEl = null;
    this.toggleArrowEl = null;
    this.countBadgeEl = null;

    this.isCollapsed = localStorage.getItem('garden_empire_log_collapsed') === 'true';
    this.userScrolledUp = false;
    this.lastLogCount = 0;
  }

  /**
   * Khởi tạo liên kết DOM và sự kiện
   */
  init() {
    this.widgetEl = document.getElementById('game-log-widget');
    this.feedEl = document.getElementById('game-log-feed');
    this.tickerEl = document.getElementById('game-log-mini-ticker');
    this.latestTextEl = document.getElementById('game-log-latest-text');
    this.toggleBtnEl = document.getElementById('btn-toggle-log-collapse');
    this.toggleArrowEl = document.getElementById('log-toggle-arrow');
    this.countBadgeEl = document.getElementById('game-log-count');

    if (!this.widgetEl) return;

    // Thiết lập trạng thái ban đầu từ localStorage
    this.updateCollapseUI();

    // Toggle collapse khi click nút mũi tên
    if (this.toggleBtnEl) {
      this.toggleBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCollapse();
      });
    }

    // Toggle khi click vào mini ticker bar
    if (this.tickerEl) {
      this.tickerEl.addEventListener('click', () => {
        if (this.isCollapsed) {
          this.toggleCollapse();
        }
      });
    }

    // Nút Nhật Ký ở Header Top Bar
    const btnTopBarLog = document.getElementById('btn-toggle-game-log');
    if (btnTopBarLog) {
      btnTopBarLog.addEventListener('click', () => {
        this.toggleCollapse();
      });
    }

    // Nhận diện người chơi đang chủ động cuộn lên xem lịch sử cũ
    if (this.feedEl) {
      this.feedEl.addEventListener('scroll', () => {
        const threshold = 35; // px từ đáy
        const isAtBottom = this.feedEl.scrollHeight - this.feedEl.scrollTop - this.feedEl.clientHeight <= threshold;
        this.userScrolledUp = !isAtBottom;
      });
    }
  }

  /**
   * Chuyển đổi trạng thái thu gọn / mở rộng
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('garden_empire_log_collapsed', this.isCollapsed);
    this.updateCollapseUI();

    if (!this.isCollapsed) {
      // Khi mở rộng, cuộn ngay xuống mục mới nhất
      this.scrollToBottom(true);
    }
  }

  /**
   * Cập nhật giao diện theo trạng thái isCollapsed
   */
  updateCollapseUI() {
    if (!this.widgetEl) return;

    if (this.isCollapsed) {
      this.widgetEl.classList.add('is-collapsed');
      if (this.feedEl) this.feedEl.classList.add('hidden');
      if (this.tickerEl) this.tickerEl.classList.remove('hidden');
      if (this.toggleArrowEl) this.toggleArrowEl.textContent = '▲';
      if (this.toggleBtnEl) this.toggleBtnEl.title = 'Mở rộng nhật ký ván đấu';
    } else {
      this.widgetEl.classList.remove('is-collapsed');
      if (this.feedEl) this.feedEl.classList.remove('hidden');
      if (this.tickerEl) this.tickerEl.classList.add('hidden');
      if (this.toggleArrowEl) this.toggleArrowEl.textContent = '▼';
      if (this.toggleBtnEl) this.toggleBtnEl.title = 'Thu gọn nhật ký ván đấu';
    }
  }

  /**
   * Render danh sách logs nhận từ GameState
   * @param {Array} actionLogs 
   * @param {string} myPlayerId 
   */
  render(actionLogs = [], myPlayerId = '') {
    if (!this.feedEl) return;

    const logs = Array.isArray(actionLogs) ? actionLogs : [];

    // Cập nhật số lượng
    if (this.countBadgeEl) {
      this.countBadgeEl.textContent = logs.length;
    }

    // Nếu không có log nào
    if (logs.length === 0) {
      this.feedEl.innerHTML = `
        <div class="log-item log-empty-state">
          <span class="log-empty-icon">🌱</span>
          <span>Ván đấu đã sẵn sàng, chờ hành động đầu tiên...</span>
        </div>
      `;
      if (this.latestTextEl) {
        this.latestTextEl.textContent = 'Chờ lượt đi đầu tiên...';
      }
      return;
    }

    // Cập nhật thanh mini ticker với log mới nhất
    const latestLog = logs[logs.length - 1];
    if (this.latestTextEl && latestLog) {
      const avatar = latestLog.playerAvatar || '🌱';
      this.latestTextEl.innerHTML = `<strong>${avatar} ${latestLog.playerName || 'Người chơi'}:</strong> ${latestLog.message}`;
    }

    // Chỉ render lại danh sách nếu có log mới
    if (logs.length !== this.lastLogCount) {
      this.lastLogCount = logs.length;

      const itemsHtml = logs.map((log, index) => {
        const isMine = log.playerId && log.playerId === myPlayerId;
        const avatar = log.playerAvatar || '🌱';
        const timeStr = log.timestamp ? this.formatTime(log.timestamp) : '';
        const actionTypeClass = `action-${(log.actionType || 'GENERIC').toLowerCase().replace(/_/g, '-')}`;

        return `
          <div class="log-item ${actionTypeClass} ${isMine ? 'log-item-mine' : ''}" data-log-id="${log.id || index}">
            <div class="log-item-header">
              <span class="log-player-avatar">${avatar}</span>
              <span class="log-player-name ${isMine ? 'text-mine' : ''}">${log.playerName || 'Hệ thống'}</span>
              ${timeStr ? `<span class="log-timestamp">${timeStr}</span>` : ''}
            </div>
            <div class="log-item-message">${this.highlightTokens(log.message || '')}</div>
          </div>
        `;
      }).join('');

      this.feedEl.innerHTML = itemsHtml;

      // Tự động cuộn xuống dưới cùng nếu người dùng không đang cuộn lên
      if (!this.userScrolledUp) {
        this.scrollToBottom(false);
      }
    }
  }

  /**
   * Cuộn danh sách log xuống dưới cùng
   */
  scrollToBottom(smooth = true) {
    if (!this.feedEl) return;
    requestAnimationFrame(() => {
      this.feedEl.scrollTo({
        top: this.feedEl.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    });
  }

  /**
   * Định dạng thời gian hh:mm:ss
   */
  formatTime(timestamp) {
    try {
      const d = new Date(timestamp);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    } catch (_) {
      return '';
    }
  }

  /**
   * Thêm màu sắc và badge cho các icon tài nguyên trong message
   */
  highlightTokens(message) {
    if (!message) return '';
    return message
      .replace(/🟫 Đất/g, '<span class="log-token-badge badge-dirt">🟫 Đất</span>')
      .replace(/💧 Nước/g, '<span class="log-token-badge badge-water">💧 Nước</span>')
      .replace(/☀️ Sáng/g, '<span class="log-token-badge badge-sunlight">☀️ Sáng</span>')
      .replace(/🌰 Hạt Giống/g, '<span class="log-token-badge badge-seed">🌰 Hạt Giống</span>')
      .replace(/🧪 Dinh Dưỡng/g, '<span class="log-token-badge badge-nutrients">🧪 Dinh Dưỡng</span>')
      .replace(/🌾 Phân Bón/g, '<span class="log-token-badge badge-wild">🌾 Phân Bón</span>')
      .replace(/★ \+(\d+)/g, '<span class="log-prestige-gain">★ +$1</span>');
  }
}

export const gameLogUI = new GameLogUI();
