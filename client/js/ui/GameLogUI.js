/*
   GARDEN EMPIRE — GAME ACTION LOGS COMPONENT
   Hiển thị nhật ký hành động: 3 lượt gần nhất trên bàn đấu (Tabletop Arena)
   và cửa sổ Modal chi tiết toàn bộ lịch sử ván đấu (Full Logs UI).
*/

export class GameLogUI {
  constructor() {
    // Widget trên bàn cờ (Top-Right Tabletop Arena)
    this.widgetEl = null;
    this.feedEl = null;
    this.countBadgeEl = null;
    this.toggleBtnEl = null;
    this.quickBarEl = null;
    this.quickTextEl = null;

    // Modal hiển thị toàn bộ nhật ký (Full Logs Modal)
    this.modalEl = null;
    this.modalFeedEl = null;
    this.modalCountEl = null;
    this.modalCloseBtnEl = null;
    this.modalFooterCloseBtnEl = null;
    this.modalScrollLatestBtnEl = null;
    this.modalFooterStatsEl = null;

    this.actionLogs = [];
    this.myPlayerId = '';
    this.isModalOpen = false;
    this.lastLogCount = 0;
    this.userModalScrolledUp = false;
  }

  /**
   * Khởi tạo liên kết DOM và các sự kiện click, phím tắt
   */
  init() {
    // Widget elements
    this.widgetEl = document.getElementById('game-log-widget');
    this.feedEl = document.getElementById('game-log-feed');
    this.countBadgeEl = document.getElementById('game-log-count');
    this.toggleBtnEl = document.getElementById('btn-toggle-log-collapse');

    // Modal elements
    this.modalEl = document.getElementById('game-logs-modal');
    this.modalFeedEl = document.getElementById('modal-logs-feed');
    this.modalCountEl = document.getElementById('modal-logs-total-count');
    this.modalCloseBtnEl = document.getElementById('modal-logs-close');
    this.modalFooterCloseBtnEl = document.getElementById('btn-close-logs-modal');
    this.modalScrollLatestBtnEl = document.getElementById('btn-scroll-logs-latest');
    this.modalFooterStatsEl = document.getElementById('modal-logs-footer-stats');

    // 1. Nhấp vào Widget để mở Modal xem Full Logs
    if (this.widgetEl) {
      this.widgetEl.addEventListener('click', () => {
        this.openModal();
      });
    }

    // 2. Nút toggle / expand trên header của widget
    if (this.toggleBtnEl) {
      this.toggleBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal();
      });
    }

    // 3. Nút Nhật Ký ở Header Top Bar
    const btnTopBarLog = document.getElementById('btn-toggle-game-log');
    if (btnTopBarLog) {
      btnTopBarLog.addEventListener('click', () => {
        this.toggleModal();
      });
    }

    // 5. Đóng modal (nút X và nút Đóng)
    if (this.modalCloseBtnEl) {
      this.modalCloseBtnEl.addEventListener('click', () => this.closeModal());
    }
    if (this.modalFooterCloseBtnEl) {
      this.modalFooterCloseBtnEl.addEventListener('click', () => this.closeModal());
    }

    // 6. Đóng khi click ngoài backdrop
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.closeModal();
        }
      });
    }

    // 7. Phím tắt Escape để đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });

    // 8. Nút cuộn xuống mới nhất trong modal
    if (this.modalScrollLatestBtnEl) {
      this.modalScrollLatestBtnEl.addEventListener('click', () => {
        this.scrollModalToBottom(true);
      });
    }

    // 9. Theo dõi scroll trong modal
    if (this.modalFeedEl) {
      this.modalFeedEl.addEventListener('scroll', () => {
        const threshold = 40;
        const isAtBottom = this.modalFeedEl.scrollHeight - this.modalFeedEl.scrollTop - this.modalFeedEl.clientHeight <= threshold;
        this.userModalScrolledUp = !isAtBottom;
      });
    }
  }

  /**
   * Mở cửa sổ Modal xem toàn bộ nhật ký
   */
  openModal() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.isModalOpen = true;
    this.renderModal();
    this.scrollModalToBottom(false);
  }

  /**
   * Đóng cửa sổ Modal
   */
  closeModal() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    this.isModalOpen = false;
  }

  /**
   * Chuyển đổi trạng thái đóng / mở modal
   */
  toggleModal() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  /**
   * Render danh sách logs nhận từ GameState
   * - Widget trên bàn cờ: Chỉ hiển thị chính xác 3 hành động gần nhất
   * - Modal: Cập nhật nếu đang mở
   * @param {Array} actionLogs 
   * @param {string} myPlayerId 
   */
  render(actionLogs = [], myPlayerId = '') {
    this.actionLogs = Array.isArray(actionLogs) ? actionLogs : [];
    this.myPlayerId = myPlayerId || '';
    const total = this.actionLogs.length;

    // Cập nhật số lượng tổng
    if (this.countBadgeEl) {
      this.countBadgeEl.textContent = total;
    }

    // 1. RENDER WIDGET BÀN CỜ (CHỈ 3 HÀNH ĐỘNG GẦN NHẤT)
    if (this.feedEl) {
      if (total === 0) {
        this.feedEl.innerHTML = `
          <div class="log-item log-empty-state">
            <span class="log-empty-icon">🌱</span>
            <span>Ván đấu đã sẵn sàng, chờ hành động đầu tiên...</span>
          </div>
        `;
      } else {
        // Lấy 3 lượt hành động gần nhất
        const recentLogs = this.actionLogs.slice(-3);
        const startIndex = total - recentLogs.length;

        const widgetHtml = recentLogs.map((log, idx) => {
          const globalOrder = startIndex + idx + 1; // Số thứ tự 1-based toàn cục trong ván
          const isMine = Boolean(log.playerId && log.playerId === this.myPlayerId);
          return this.createLogItemHtml(log, globalOrder, total, isMine, false);
        }).join('');

        this.feedEl.innerHTML = widgetHtml;
      }
    }

    // 2. CẬP NHẬT MODAL NẾU ĐANG MỞ
    if (this.isModalOpen) {
      this.renderModal();
    }
  }

  /**
   * Render toàn bộ danh sách hành động vào cửa sổ Modal
   */
  renderModal() {
    if (!this.modalFeedEl) return;

    const total = this.actionLogs.length;

    // Cập nhật số lượng trên modal header & footer
    if (this.modalCountEl) {
      this.modalCountEl.textContent = total;
    }
    if (this.modalFooterStatsEl) {
      this.modalFooterStatsEl.innerHTML = `<span>Tổng cộng: <strong>${total}</strong> lượt hành động đã diễn ra trong ván đấu</span>`;
    }

    if (total === 0) {
      this.modalFeedEl.innerHTML = `
        <div class="log-item log-empty-state modal-empty-state">
          <span class="log-empty-icon">🌱</span>
          <div>
            <strong>Ván đấu vừa bắt đầu, chưa ghi nhận hành động nào</strong>
            <p>Mọi nước đi lấy tài nguyên, trồng cây, đặt chỗ thẻ và đón khách quý sẽ được ghi chép đầy đủ tại đây.</p>
          </div>
        </div>
      `;
      return;
    }

    // Render toàn bộ các mục từ 1 đến N
    const fullLogsHtml = this.actionLogs.map((log, index) => {
      const globalOrder = index + 1;
      const isMine = Boolean(log.playerId && log.playerId === this.myPlayerId);
      return this.createLogItemHtml(log, globalOrder, total, isMine, true);
    }).join('');

    this.modalFeedEl.innerHTML = fullLogsHtml;

    // Tự động cuộn xuống dưới cùng nếu người dùng không chủ động cuộn lên
    if (!this.userModalScrolledUp) {
      this.scrollModalToBottom(false);
    }
  }

  /**
   * Tạo HTML cho một dòng log hành động
   * @param {Object} log 
   * @param {number} globalOrder - Số thứ tự của hành động (#1, #2, ...)
   * @param {number} totalCount - Tổng số hành động
   * @param {boolean} isMine - Có phải lượt của chính người chơi này không
   * @param {boolean} isModal - Đang render trong modal hay trên widget
   */
  createLogItemHtml(log, globalOrder, totalCount, isMine, isModal = false) {
    const avatar = log.playerAvatar || '🌱';
    const timeStr = log.timestamp ? this.formatTime(log.timestamp) : '';
    const actionType = log.actionType || 'GENERIC';
    const actionTypeClass = `action-${actionType.toLowerCase().replace(/_/g, '-')}`;
    const actionTag = this.getActionTypeTag(actionType);

    return `
      <div class="log-item ${actionTypeClass} ${isMine ? 'log-item-mine' : ''} ${isModal ? 'modal-log-item' : 'widget-log-item'}" data-log-id="${log.id || globalOrder}">
        <div class="log-item-header">
          <span class="log-order-badge" title="Lượt hành động #${globalOrder}">#${globalOrder}</span>
          <span class="log-player-avatar">${avatar}</span>
          <span class="log-player-name ${isMine ? 'text-mine' : ''}">${log.playerName || 'Hệ thống'}</span>
          ${actionTag ? `<span class="log-action-tag ${actionTypeClass}-tag">${actionTag}</span>` : ''}
          ${timeStr ? `<span class="log-timestamp">${timeStr}</span>` : ''}
        </div>
        <div class="log-item-message">${this.highlightTokens(log.message || '')}</div>
      </div>
    `;
  }

  /**
   * Cuộn modal xuống hành động mới nhất
   */
  scrollModalToBottom(smooth = true) {
    if (!this.modalFeedEl) return;
    requestAnimationFrame(() => {
      this.modalFeedEl.scrollTo({
        top: this.modalFeedEl.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    });
  }

  /**
   * Trả về nhãn tiếng Việt ngắn gọn cho từng loại hành động
   */
  getActionTypeTag(actionType) {
    switch (actionType) {
      case 'TAKE_TOKENS_DISTINCT':
        return '🪙 Lấy 3 Token';
      case 'TAKE_TOKENS_DOUBLE':
        return '🪙 Lấy 2 Token';
      case 'RESERVE_CARD_BOARD':
        return '📑 Đặt Chỗ Thẻ';
      case 'RESERVE_CARD_DECK':
        return '📑 Đặt Chỗ Bài Ẩn';
      case 'BUY_CARD_BOARD':
        return '🌱 Trồng Cây';
      case 'BUY_CARD_RESERVED':
        return '🌱 Trồng Cây Đã Giữ';
      case 'CLAIM_VISITOR':
        return '🦋 Đón Khách Quý';
      case 'DISCARD_TOKENS':
        return '⚠️ Trả Token Dư';
      case 'GAME_START':
        return '🚀 Bắt Đầu Trận';
      case 'FINAL_ROUND_TRIGGERED':
        return '🏁 Vòng Chung Kết';
      case 'GAME_OVER':
        return '👑 Kết Thúc Ván';
      default:
        return '';
    }
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
      .replace(/⭐ Phân Bón Vàng/g, '<span class="log-token-badge badge-wild">⭐ Vàng WILD</span>')
      .replace(/★ \+(\d+)/g, '<span class="log-prestige-gain">★ +$1</span>')
      .replace(/\+(\d+)★/g, '<span class="log-prestige-gain">+$1★</span>');
  }
}

export const gameLogUI = new GameLogUI();
