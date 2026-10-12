/*
   GARDEN EMPIRE — IN-GAME CHAT UI COMPONENT
   Khung chat trực tuyến trong bàn đấu, hỗ trợ thu gọn/mở rộng,
   phím tắt Enter thông minh, auto-scroll và phân biệt tin nhắn.
*/

import { SoundFX } from './SoundFX.js';

export class ChatUI {
  constructor() {
    this.widgetEl = null;
    this.headerEl = null;
    this.bodyEl = null;
    this.feedEl = null;
    this.tickerEl = null;
    this.latestTextEl = null;
    this.toggleBtnEl = null;
    this.toggleArrowEl = null;
    this.unreadBadgeEl = null;
    this.formEl = null;
    this.inputEl = null;
    this.sendBtnEl = null;

    this.isCollapsed = localStorage.getItem('garden_empire_chat_collapsed') === 'true';
    this.unreadCount = 0;
    this.userScrolledUp = false;
    this.lastRenderedCount = 0;
    this.lastSendTimestamp = 0;
    this.onSendMessage = null;
    this.currentGuestId = null;
  }

  /**
   * Khởi tạo liên kết DOM và các sự kiện
   * @param {Function} onSendMessage Callback gửi tin nhắn lên WebSocket: (text) => void
   */
  init(onSendMessage) {
    this.onSendMessage = onSendMessage;

    this.widgetEl = document.getElementById('chat-widget');
    this.headerEl = document.getElementById('chat-header');
    this.bodyEl = document.getElementById('chat-body');
    this.feedEl = document.getElementById('chat-feed');
    this.tickerEl = document.getElementById('chat-mini-ticker');
    this.latestTextEl = document.getElementById('chat-latest-text');
    this.toggleBtnEl = document.getElementById('btn-toggle-chat-collapse');
    this.toggleArrowEl = document.getElementById('chat-toggle-arrow');
    this.unreadBadgeEl = document.getElementById('chat-unread-badge');
    this.formEl = document.getElementById('chat-form');
    this.inputEl = document.getElementById('chat-input');
    this.sendBtnEl = document.getElementById('btn-send-chat');

    if (!this.widgetEl) return;

    // Cập nhật trạng thái hiển thị ban đầu từ localStorage
    this.updateCollapseUI();

    // Sự kiện thu gọn / mở rộng khi bấm nút mũi tên
    if (this.toggleBtnEl) {
      this.toggleBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCollapse();
      });
    }

    // Sự kiện mở rộng khi bấm vào Mini Ticker Bar
    if (this.tickerEl) {
      this.tickerEl.addEventListener('click', () => {
        if (this.isCollapsed) {
          this.toggleCollapse(false);
          this.focusInput();
        }
      });
    }

    // Nút Trò Chuyện ở Header Top Bar
    const btnTopBarChat = document.getElementById('btn-toggle-chat');
    if (btnTopBarChat) {
      btnTopBarChat.addEventListener('click', () => {
        this.toggleCollapse();
        if (!this.isCollapsed) {
          this.focusInput();
        }
      });
    }

    // Sự kiện gửi tin nhắn qua Form Submit
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Theo dõi cuộn của người dùng để tạm dừng auto-scroll khi đọc tin cũ
    if (this.feedEl) {
      this.feedEl.addEventListener('scroll', () => {
        const threshold = 30; // px
        const isNearBottom = this.feedEl.scrollHeight - this.feedEl.scrollTop - this.feedEl.clientHeight <= threshold;
        this.userScrolledUp = !isNearBottom;
      });
    }

    // Sự kiện phím tắt toàn cục (Global Keyboard Shortcuts)
    this.initKeyboardShortcuts();
  }

  /**
   * Thiết lập phím tắt Enter và Escape
   */
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Phím Escape: Hủy focus ô chat nếu đang gõ
      if (e.key === 'Escape') {
        if (this.inputEl && document.activeElement === this.inputEl) {
          this.inputEl.blur();
        }
        return;
      }

      // Phím Enter: Kích hoạt nhanh ô chat khi không đang gõ ở input/modal nào khác
      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable
        );

        if (!isTyping) {
          e.preventDefault();
          if (this.isCollapsed) {
            this.toggleCollapse(false);
          }
          this.focusInput();
        }
      }
    });
  }

  /**
   * Xử lý gửi tin nhắn
   */
  handleSubmit() {
    if (!this.inputEl) return;
    const rawText = this.inputEl.value.trim();

    if (!rawText) return;

    // Client-side rate-limit cooldown: tối thiểu 600ms giữa 2 lần gửi
    const now = Date.now();
    if (now - this.lastSendTimestamp < 600) {
      return;
    }
    this.lastSendTimestamp = now;

    // Gửi qua callback
    if (typeof this.onSendMessage === 'function') {
      this.onSendMessage(rawText);
    }

    // Xóa trắng input và giữ con trỏ để gõ tiếp
    this.inputEl.value = '';
    this.userScrolledUp = false;
    this.focusInput();
  }

  /**
   * Focus vào ô nhập liệu
   */
  focusInput() {
    if (this.inputEl) {
      setTimeout(() => {
        this.inputEl.focus();
      }, 50);
    }
  }

  /**
   * Chuyển đổi trạng thái thu gọn / mở rộng
   * @param {boolean} [forcedState] Trạng thái ép buộc (tuỳ chọn)
   */
  toggleCollapse(forcedState) {
    if (typeof forcedState === 'boolean') {
      this.isCollapsed = forcedState;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }

    localStorage.setItem('garden_empire_chat_collapsed', this.isCollapsed);
    this.updateCollapseUI();

    if (!this.isCollapsed) {
      // Xóa huy hiệu chưa đọc khi mở rộng
      this.unreadCount = 0;
      this.updateUnreadBadge();
      this.scrollToBottom(true);
    }
  }

  /**
   * Cập nhật DOM theo trạng thái isCollapsed
   */
  updateCollapseUI() {
    if (!this.widgetEl) return;

    if (this.isCollapsed) {
      this.widgetEl.classList.add('is-collapsed');
      if (this.bodyEl) this.bodyEl.classList.add('hidden');
      if (this.tickerEl) this.tickerEl.classList.remove('hidden');
      if (this.toggleArrowEl) this.toggleArrowEl.textContent = '▲';
      if (this.toggleBtnEl) this.toggleBtnEl.title = 'Mở rộng khung trò chuyện';
    } else {
      this.widgetEl.classList.remove('is-collapsed');
      if (this.bodyEl) this.bodyEl.classList.remove('hidden');
      if (this.tickerEl) this.tickerEl.classList.add('hidden');
      if (this.toggleArrowEl) this.toggleArrowEl.textContent = '▼';
      if (this.toggleBtnEl) this.toggleBtnEl.title = 'Thu gọn khung trò chuyện';
    }
  }

  /**
   * Cập nhật huy hiệu tin nhắn chưa đọc
   */
  updateUnreadBadge() {
    if (!this.unreadBadgeEl) return;

    if (this.unreadCount > 0 && this.isCollapsed) {
      this.unreadBadgeEl.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.unreadBadgeEl.classList.remove('hidden');
    } else {
      this.unreadBadgeEl.textContent = '0';
      this.unreadBadgeEl.classList.add('hidden');
    }
  }

  /**
   * Render danh sách tin nhắn chat từ GameState
   * @param {Array} chatMessages Danh sách tin nhắn
   * @param {string} myPlayerId ID của người chơi hiện tại
   */
  render(chatMessages = [], myPlayerId = '') {
    if (!this.feedEl) return;
    this.currentGuestId = myPlayerId;

    const messages = Array.isArray(chatMessages) ? chatMessages : [];

    // Kiểm tra tin nhắn mới để phát âm thanh & cập nhật unread badge
    if (messages.length > this.lastRenderedCount) {
      const newMessages = messages.slice(this.lastRenderedCount);
      const hasOtherPlayerMessage = newMessages.some(m => m.playerId !== myPlayerId);

      if (hasOtherPlayerMessage && this.lastRenderedCount > 0) {
        SoundFX.playChatSound();
        if (this.isCollapsed) {
          this.unreadCount += newMessages.filter(m => m.playerId !== myPlayerId).length;
          this.updateUnreadBadge();
        }
      }
    }
    this.lastRenderedCount = messages.length;

    // Cập nhật Mini Ticker Bar
    if (messages.length > 0 && this.latestTextEl) {
      const latestMsg = messages[messages.length - 1];
      const avatar = latestMsg.playerAvatar || '🌱';
      const sender = latestMsg.playerName || 'Người chơi';
      this.latestTextEl.textContent = `${avatar} ${sender}: ${latestMsg.content || ''}`;
    }

    // Nếu chưa có tin nhắn nào
    if (messages.length === 0) {
      this.feedEl.innerHTML = `
        <div class="chat-msg-item chat-empty-state">
          <span class="chat-empty-icon">🌱</span>
          <span>Trò chuyện cùng bạn bè trong phòng... (Nhấn Enter để gõ)</span>
        </div>
      `;
      if (this.latestTextEl) {
        this.latestTextEl.textContent = 'Chưa có tin nhắn...';
      }
      return;
    }

    // Render danh sách tin nhắn
    const html = messages.map(msg => this.renderMessageItem(msg, myPlayerId)).join('');
    this.feedEl.innerHTML = html;

    // Tự động cuộn xuống dưới cùng nếu người dùng không chủ động cuộn lên
    if (!this.userScrolledUp) {
      this.scrollToBottom();
    }
  }

  /**
   * Render một item tin nhắn chat
   */
  renderMessageItem(msg, myPlayerId) {
    const isMe = msg.playerId === myPlayerId;
    const avatar = msg.playerAvatar || '🌱';
    const name = this.escapeHtml(msg.playerName || 'Khách');
    const content = this.escapeHtml(msg.content || '');
    const timeStr = this.formatTime(msg.timestamp);

    const rowClass = isMe ? 'chat-msg-row chat-msg-me' : 'chat-msg-row chat-msg-them';

    return `
      <div class="${rowClass}">
        <span class="chat-msg-avatar" title="${name}">${avatar}</span>
        <div class="chat-msg-bubble">
          <div class="chat-msg-header">
            <span class="chat-msg-sender">${name}</span>
            <span class="chat-msg-time">${timeStr}</span>
          </div>
          <div class="chat-msg-content">${content}</div>
        </div>
      </div>
    `;
  }

  /**
   * Xử lý sự kiện nhận tin nhắn riêng lẻ từ WebSocket (CHAT_MESSAGE_RECEIVED)
   */
  onMessageReceived(msg, myPlayerId) {
    if (!msg) return;
    if (msg.playerId !== myPlayerId) {
      SoundFX.playChatSound();
      if (this.isCollapsed) {
        this.unreadCount += 1;
        this.updateUnreadBadge();
      }
    }
    if (this.latestTextEl) {
      const avatar = msg.playerAvatar || '🌱';
      const sender = msg.playerName || 'Người chơi';
      this.latestTextEl.textContent = `${avatar} ${sender}: ${msg.content || ''}`;
    }
  }

  /**
   * Cuộn danh sách tin nhắn xuống dưới cùng
   */
  scrollToBottom(force = false) {
    if (!this.feedEl) return;
    if (force || !this.userScrolledUp) {
      requestAnimationFrame(() => {
        this.feedEl.scrollTop = this.feedEl.scrollHeight;
      });
    }
  }

  /**
   * Định dạng thời gian hh:mm
   */
  formatTime(epochMillis) {
    if (!epochMillis) return '';
    const date = new Date(epochMillis);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Escape HTML an toàn
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export const chatUI = new ChatUI();
