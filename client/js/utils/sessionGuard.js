/**
 * GARDEN EMPIRE — SESSION GUARD
 * 
 * Đảm bảo mỗi người chơi chỉ hoạt động trên 1 tab/cửa sổ duy nhất tại một thời điểm:
 * 1. Sử dụng BroadcastChannel ('garden_empire_session_sync') đồng bộ tức thì giữa các tab.
 * 2. Lắng nghe storage event làm fallback khi thay đổi localStorage.
 * 3. Tự động ngắt kết nối WebSocket và hiển thị Overlay khóa màn hình khi phát hiện đăng nhập mới.
 * 
 * => Điều này giúp khắc phục lỗi nhiều tài khoản trên cùng 1 platform thực hiện nhiều hành động
 * cùng lúc thì sẽ xảy ra lỗi/không đồng bộ
 */
class SessionGuard {
  constructor() {
    this.channel = null;
    this.isBlocked = false;
    this.tabId = this._getOrCreateTabId();
    this.onConflictCallback = null;
    this.isInitialized = false;
  }

  _getOrCreateTabId() {
    let id = sessionStorage.getItem('garden_empire_tab_id');
    if (!id) {
      id = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem('garden_empire_tab_id', id);
    }
    return id;
  }

  /**
   * Khởi tạo lắng nghe xung đột trên trang hiện tại (Lobby, Waiting Room, Board)
   */
  init(options = {}) {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.onConflictCallback = options.onConflict || null;

    // Gán tab hiện tại là tab đang active nếu chưa có
    const currentActive = localStorage.getItem('garden_empire_active_tab_id');
    if (!currentActive) {
      localStorage.setItem('garden_empire_active_tab_id', this.tabId);
    }

    // 1. Kết nối BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('garden_empire_session_sync');
        this.channel.onmessage = (event) => this._handleBroadcast(event.data);
      }
    } catch (e) {
      console.warn('[SessionGuard] BroadcastChannel không được hỗ trợ:', e);
    }

    // 2. Lắng nghe storage event (Cross-tab sync fallback)
    window.addEventListener('storage', (e) => {
      if (e.key === 'garden_empire_active_tab_id' && e.newValue && e.newValue !== this.tabId) {
        this.triggerConflict('Đã đăng nhập ở một tab hoặc cửa sổ khác trên trình duyệt này');
      }
    });

    // 3. Kiểm tra xem tab này có bị tab khác chiếm quyền trước đó không
    const activeTab = localStorage.getItem('garden_empire_active_tab_id');
    if (activeTab && activeTab !== this.tabId && !options.isNewLogin) {
      setTimeout(() => {
        this.triggerConflict('Đã đăng nhập ở một tab hoặc trang khác');
      }, 350);
    }
  }

  /**
   * Gọi khi người dùng bấm đăng nhập (Vào Sảnh) ở trang chủ
   */
  claimActiveSession(source = 'index.html') {
    // Sinh tabId mới cho phiên đăng nhập mới
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem('garden_empire_tab_id', this.tabId);
    localStorage.setItem('garden_empire_active_tab_id', this.tabId);

    // Bắn broadcast thông báo cho toàn bộ các tab cũ ngắt kết nối
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!this.channel) {
          this.channel = new BroadcastChannel('garden_empire_session_sync');
        }
        this.channel.postMessage({
          type: 'DUPLICATE_LOGIN',
          activeTabId: this.tabId,
          source: source,
          timestamp: Date.now(),
          message: 'Đã đăng nhập ở một tab hoặc trang khác trên trình duyệt này'
        });
      }
    } catch (e) {
      console.warn('[SessionGuard] Lỗi gửi broadcast:', e);
    }
  }

  _handleBroadcast(data) {
    if (!data || data.type !== 'DUPLICATE_LOGIN') return;
    // Nếu tin nhắn đến từ một tab khác -> ngắt kết nối tab này
    if (data.activeTabId && data.activeTabId !== this.tabId) {
      this.triggerConflict(data.message || 'Đã đăng nhập ở một tab hoặc trang khác');
    }
  }

  /**
   * Kích hoạt trạng thái xung đột: Ngắt kết nối và hiện Modal chặn
   */
  triggerConflict(message = 'Đã đăng nhập ở một tab hoặc thiết bị khác') {
    if (this.isBlocked) return;
    this.isBlocked = true;

    console.warn('[SessionGuard] Xung đột phiên:', message);

    if (typeof this.onConflictCallback === 'function') {
      try {
        this.onConflictCallback(message);
      } catch (err) {
        console.error('[SessionGuard] Callback error:', err);
      }
    }

    this.showConflictModal(message);
  }

  /**
   * Hiển thị Modal thông báo ngắt kết nối chuyên nghiệp
   */
  showConflictModal(message) {
    let overlay = document.getElementById('session-conflict-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'session-conflict-overlay';
      overlay.className = 'session-conflict-overlay';
      overlay.innerHTML = `
        <div class="session-conflict-modal glass-panel" role="alertdialog" aria-modal="true">
          <div class="conflict-badge">⚠️ PHIÊN BỊ NGẮT KẾT NỐI</div>
          <div class="conflict-icon">🔌</div>
          <h2 class="conflict-title" id="conflict-title-text">${this._escape(message)}</h2>
          <p class="conflict-desc">
            Để tránh xảy ra xung đột dữ liệu và lỗi bàn cờ, phiên chơi tại tab này đã tự động dừng kết nối.
          </p>
          <div class="conflict-actions">
            <button id="btn-conflict-reclaim" class="btn-nature-primary btn-block">
              <span>🔄</span> <span>Dùng Tiếp Ở Tab Này</span>
            </button>
            <button id="btn-conflict-home" class="btn-nature-secondary btn-block">
              <span>🏡</span> <span>Quay Về Trang Chủ</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Nút giành lại phiên
      document.getElementById('btn-conflict-reclaim')?.addEventListener('click', () => {
        this.claimActiveSession('reclaim');
        window.location.reload();
      });

      // Nút về trang chủ
      document.getElementById('btn-conflict-home')?.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    } else {
      const title = document.getElementById('conflict-title-text');
      if (title) title.textContent = message;
      overlay.classList.remove('hidden');
    }
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
}

export const sessionGuard = new SessionGuard();
