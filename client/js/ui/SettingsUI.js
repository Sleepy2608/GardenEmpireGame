/**
 * GARDEN EMPIRE - SETTINGS UI COMPONENT (SettingsUI.js)
 * Design System: Deep Forest Botanical Glassmorphism
 * Adheres strictly to design-taste-frontend: No AI-slop, no em-dashes, rich botanical controls
 */

import { settingsManager } from '../settings/SettingsManager.js';
import { SoundFX } from './SoundFX.js';

export class SettingsUI {
  /**
   * Tạo chuỗi HTML hoàn chỉnh cho Modal Cài Đặt Hệ Thống
   * @param {Object} options
   * @param {string} options.prefixId - Tiền tố id để phân biệt các trường
   * @returns {string} Chuỗi HTML template
   */
  static getModalTemplate({ prefixId = 'settings' } = {}) {
    return `
      <div class="settings-modal-dialog" id="${prefixId}-dialog" role="document">
        <!-- Header -->
        <header class="settings-header">
          <div class="settings-title-wrap">
            <div class="settings-emblem" aria-hidden="true">⚙️</div>
            <div>
              <h2 class="settings-heading">CÀI ĐẶT HỆ THỐNG</h2>
              <p class="settings-subheading">Tùy biến âm thanh, đồ họa và hỗ trợ trải nghiệm</p>
            </div>
          </div>
          <button type="button" class="settings-close-btn" id="${prefixId}-btn-close" aria-label="Đóng cài đặt" title="Đóng (Esc)">✕</button>
        </header>

        <!-- Tabs Navigation -->
        <nav class="settings-tabs-bar" role="tablist" aria-label="Danh mục cài đặt">
          <button type="button" class="settings-tab-btn active" role="tab" id="${prefixId}-tab-btn-audio" aria-selected="true" aria-controls="${prefixId}-panel-audio" data-tab="audio">
            <span class="tab-icon">🔊</span> <span>Âm Thanh</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" id="${prefixId}-tab-btn-display" aria-selected="false" aria-controls="${prefixId}-panel-display" data-tab="display">
            <span class="tab-icon">🎨</span> <span>Hiển Thị</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" id="${prefixId}-tab-btn-gameplay" aria-selected="false" aria-controls="${prefixId}-panel-gameplay" data-tab="gameplay">
            <span class="tab-icon">🎮</span> <span>Bàn Đấu</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" id="${prefixId}-tab-btn-system" aria-selected="false" aria-controls="${prefixId}-panel-system" data-tab="system">
            <span class="tab-icon">ℹ️</span> <span>Hệ Thống</span>
          </button>
        </nav>

        <!-- Content Body -->
        <div class="settings-content-body">
          <!-- TAB 1: AUDIO -->
          <div class="settings-panel active" id="${prefixId}-panel-audio" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-audio">
            <div class="settings-section-title">ĐIỀU KHIỂN ÂM LƯỢNG</div>

            <!-- Master Volume -->
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="${prefixId}-slider-master">Âm Lượng Tổng (Master)</label>
                <div class="setting-desc">Điều chỉnh mức âm lượng chung cho toàn bộ trò chơi</div>
              </div>
              <div class="setting-control">
                <div class="setting-slider-group">
                  <button type="button" class="setting-quick-mute-btn" id="${prefixId}-btn-mute-master" title="Bật/Tắt âm tổng" aria-label="Bật/Tắt âm tổng">🔊</button>
                  <input type="range" class="setting-range-slider" id="${prefixId}-slider-master" min="0" max="100" step="1" value="80" aria-label="Âm lượng tổng">
                  <span class="setting-slider-val" id="${prefixId}-val-master">80%</span>
                </div>
              </div>
            </div>

            <!-- BGM Volume -->
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="${prefixId}-slider-bgm">Nhạc Nền (Music BGM)</label>
                <div class="setting-desc">Giai điệu thời kỳ Phục Hưng trong lành và thư giãn</div>
              </div>
              <div class="setting-control">
                <div class="setting-slider-group">
                  <button type="button" class="setting-quick-mute-btn" id="${prefixId}-btn-mute-bgm" title="Bật/Tắt nhạc nền" aria-label="Bật/Tắt nhạc nền">🎵</button>
                  <input type="range" class="setting-range-slider" id="${prefixId}-slider-bgm" min="0" max="100" step="1" value="70" aria-label="Âm lượng nhạc nền">
                  <span class="setting-slider-val" id="${prefixId}-val-bgm">70%</span>
                </div>
              </div>
            </div>

            <!-- SFX Volume -->
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="${prefixId}-slider-sfx">Hiệu Ứng Âm Thanh (SFX)</label>
                <div class="setting-desc">Âm xúc giác khi bốc token, gieo trồng cây và chuông đếm giờ</div>
              </div>
              <div class="setting-control">
                <div class="setting-slider-group">
                  <button type="button" class="setting-quick-mute-btn" id="${prefixId}-btn-mute-sfx" title="Bật/Tắt hiệu ứng" aria-label="Bật/Tắt hiệu ứng">🔔</button>
                  <input type="range" class="setting-range-slider" id="${prefixId}-slider-sfx" min="0" max="100" step="1" value="100" aria-label="Âm lượng hiệu ứng">
                  <span class="setting-slider-val" id="${prefixId}-val-sfx">100%</span>
                  <button type="button" class="btn-test-sound" id="${prefixId}-btn-test-sfx" title="Nghe thử âm lượng SFX">Thử Âm</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: DISPLAY -->
          <div class="settings-panel" id="${prefixId}-panel-display" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-display">
            <div class="settings-section-title">ĐỒ HỌA &amp; HIỆU ỨNG THỊ GIÁC</div>

            <!-- Eco Particles -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Bụi Sáng Sinh Thái (Eco Particles)</span>
                <div class="setting-desc">Hiệu ứng bào tử lơ lửng trong không gian khu vườn (tắt để tiết kiệm pin)</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-particles">
                  <input type="checkbox" id="${prefixId}-toggle-particles" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Reduced Motion -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Giảm Chuyển Động (Reduced Motion)</span>
                <div class="setting-desc">Hạn chế hoạt ảnh rung lắc, chuyển cảnh 3D theo chuẩn trợ năng</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-reduced-motion">
                  <input type="checkbox" id="${prefixId}-toggle-reduced-motion">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Card Hover Zoom -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Phóng To Thẻ Cây (Card Hover Zoom)</span>
                <div class="setting-desc">Phóng to ảnh thẻ cây khi rê chuột để xem chi tiết loài thực vật</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-card-zoom">
                  <input type="checkbox" id="${prefixId}-toggle-card-zoom" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- TAB 3: GAMEPLAY -->
          <div class="settings-panel" id="${prefixId}-panel-gameplay" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-gameplay">
            <div class="settings-section-title">HỖ TRỢ THI ĐẤU &amp; TRỢ NĂNG</div>

            <!-- Turn Notification -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Chuông Báo Tới Lượt (Turn Alert)</span>
                <div class="setting-desc">Phát chuông thông báo khi lượt đi chuyển tới bạn</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-turn-alert">
                  <input type="checkbox" id="${prefixId}-toggle-turn-alert" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Chat Sound -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Âm Tin Nhắn Chat (Chat Sound)</span>
                <div class="setting-desc">Phát âm thanh nhẹ khi có tin nhắn mới trong phòng đấu</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-chat-sound">
                  <input type="checkbox" id="${prefixId}-toggle-chat-sound" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Colorblind Mode -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Chế Độ Khiếm Thị Màu (Colorblind)</span>
                <div class="setting-desc">Luôn hiển thị biểu tượng chữ và ký hiệu đặc thù trên token</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-colorblind">
                  <input type="checkbox" id="${prefixId}-toggle-colorblind">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Bot Hint -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Gợi Ý Nước Đi (Bot Strategy Hints)</span>
                <div class="setting-desc">Gợi ý phân tích thẻ tối ưu từ Smart Bot (dành cho người mới học chơi)</div>
              </div>
              <div class="setting-control">
                <label class="toggle-switch" for="${prefixId}-toggle-bot-hint">
                  <input type="checkbox" id="${prefixId}-toggle-bot-hint">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- TAB 4: SYSTEM & INFO -->
          <div class="settings-panel" id="${prefixId}-panel-system" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-system">
            <div class="settings-section-title">THÔNG TIN HỆ THỐNG &amp; ĐIỀU KHIỂN</div>

            <!-- Fullscreen Toggle -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Toàn Màn Hình (Fullscreen F11)</span>
                <div class="setting-desc">Mở rộng không gian bàn cờ chiếm trọn màn hình</div>
              </div>
              <div class="setting-control">
                <button type="button" class="btn-fullscreen-toggle" id="${prefixId}-btn-fullscreen">⛶ Bật Toàn Màn Hình</button>
              </div>
            </div>

            <!-- Version & Engine Specs -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Phiên Bản Trò Chơi</span>
                <div class="setting-desc">Garden Empire Engine Spring Boot 3 &amp; WebSocket Native</div>
              </div>
              <div class="setting-control">
                <span class="settings-version-badge">v1.7.0</span>
              </div>
            </div>

            <!-- Keyboard Shortcuts Reference -->
            <div class="settings-shortcuts-card">
              <div class="shortcuts-title">⌨️ Phím Tắt Tiện Ích</div>
              <div class="shortcuts-grid">
                <div class="shortcut-item"><kbd>Esc</kbd> <span>Đóng Cài Đặt / Cẩm Nang</span></div>
                <div class="shortcut-item"><kbd>O</kbd> / <kbd>,</kbd> <span>Mở Bảng Cài Đặt</span></div>
                <div class="shortcut-item"><kbd>M</kbd> <span>Bật / Tắt Nhanh Âm Thanh</span></div>
                <div class="shortcut-item"><kbd>F11</kbd> <span>Toàn Màn Hình</span></div>
              </div>
            </div>

            <!-- Music Attribution -->
            <div class="settings-credits-card">
              <strong>🎵 Tác Quyền Âm Nhạc:</strong> Nhạc nền Phục Hưng sáng tác bởi <strong>Kevin MacLeod</strong> (incompetech.com), cấp phép theo tiêu chuẩn quốc tế <strong>CC-BY 4.0</strong>.
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <footer class="settings-footer">
          <button type="button" class="btn-reset-defaults" id="${prefixId}-btn-reset-defaults" title="Khôi phục toàn bộ cài đặt về ban đầu">
            ↺ Khôi Phục Mặc Định
          </button>
          <button type="button" class="btn-settings-done" id="${prefixId}-btn-done">
            Xong
          </button>
        </footer>
      </div>
    `;
  }

  /**
   * Khởi tạo chuyển tab bên trong container
   * @param {HTMLElement|string} container - Element hoặc selector chứa modal
   */
  static initTabs(container) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;

    const tabButtons = root.querySelectorAll('.settings-tab-btn');
    const panels = root.querySelectorAll('.settings-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Cập nhật trạng thái các tab button
        tabButtons.forEach(b => {
          const isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        // Chuyển đổi hiển thị panels
        panels.forEach(p => {
          const isTarget = p.id.endsWith(`panel-${targetTab}`);
          p.classList.toggle('active', isTarget);
        });
      });

      // Điều hướng phím mũi tên trái / phải
      btn.addEventListener('keydown', (e) => {
        let targetBtn = null;
        if (e.key === 'ArrowRight') {
          targetBtn = btn.nextElementSibling || tabButtons[0];
        } else if (e.key === 'ArrowLeft') {
          targetBtn = btn.previousElementSibling || tabButtons[tabButtons.length - 1];
        }

        if (targetBtn && targetBtn.classList.contains('settings-tab-btn')) {
          e.preventDefault();
          targetBtn.focus();
          targetBtn.click();
        }
      });
    });
  }

  /**
   * Gắn sự kiện cho các điều khiển bên trong modal (sliders, switches, buttons)
   * @param {HTMLElement|string} container
   * @param {string} prefixId
   */
  static bindSettingsControls(container, prefixId = 'settings') {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;

    // --- Audio Sliders & Mute Buttons ---
    const sliderMaster = root.querySelector(`#${prefixId}-slider-master`);
    const valMaster = root.querySelector(`#${prefixId}-val-master`);
    const btnMuteMaster = root.querySelector(`#${prefixId}-btn-mute-master`);

    if (sliderMaster) {
      sliderMaster.addEventListener('input', (e) => {
        const vol = Number(e.target.value) / 100;
        settingsManager.setMasterVolume(vol);
        if (valMaster) valMaster.textContent = `${e.target.value}%`;
      });
    }

    if (btnMuteMaster) {
      btnMuteMaster.addEventListener('click', () => {
        settingsManager.toggleMasterMute();
      });
    }

    const sliderBgm = root.querySelector(`#${prefixId}-slider-bgm`);
    const valBgm = root.querySelector(`#${prefixId}-val-bgm`);
    const btnMuteBgm = root.querySelector(`#${prefixId}-btn-mute-bgm`);

    if (sliderBgm) {
      sliderBgm.addEventListener('input', (e) => {
        const vol = Number(e.target.value) / 100;
        settingsManager.setBgmVolume(vol);
        if (valBgm) valBgm.textContent = `${e.target.value}%`;
      });
    }

    if (btnMuteBgm) {
      btnMuteBgm.addEventListener('click', () => {
        settingsManager.toggleBgmMute();
      });
    }

    const sliderSfx = root.querySelector(`#${prefixId}-slider-sfx`);
    const valSfx = root.querySelector(`#${prefixId}-val-sfx`);
    const btnMuteSfx = root.querySelector(`#${prefixId}-btn-mute-sfx`);
    const btnTestSfx = root.querySelector(`#${prefixId}-btn-test-sfx`);

    if (sliderSfx) {
      sliderSfx.addEventListener('input', (e) => {
        const vol = Number(e.target.value) / 100;
        settingsManager.setSfxVolume(vol);
        if (valSfx) valSfx.textContent = `${e.target.value}%`;
      });
    }

    if (btnMuteSfx) {
      btnMuteSfx.addEventListener('click', () => {
        settingsManager.toggleSfxMute();
      });
    }

    if (btnTestSfx) {
      btnTestSfx.addEventListener('click', () => {
        SettingsUI.testSfxSound();
      });
    }

    // --- Display Toggles ---
    const toggleParticles = root.querySelector(`#${prefixId}-toggle-particles`);
    if (toggleParticles) {
      toggleParticles.addEventListener('change', (e) => {
        settingsManager.setDisplaySetting('particlesEnabled', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    const toggleReducedMotion = root.querySelector(`#${prefixId}-toggle-reduced-motion`);
    if (toggleReducedMotion) {
      toggleReducedMotion.addEventListener('change', (e) => {
        settingsManager.setDisplaySetting('reducedMotion', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    const toggleCardZoom = root.querySelector(`#${prefixId}-toggle-card-zoom`);
    if (toggleCardZoom) {
      toggleCardZoom.addEventListener('change', (e) => {
        settingsManager.setDisplaySetting('cardHoverZoom', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    // --- Gameplay Toggles ---
    const toggleTurnAlert = root.querySelector(`#${prefixId}-toggle-turn-alert`);
    if (toggleTurnAlert) {
      toggleTurnAlert.addEventListener('change', (e) => {
        settingsManager.setGameplaySetting('turnAlertSound', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    const toggleChatSound = root.querySelector(`#${prefixId}-toggle-chat-sound`);
    if (toggleChatSound) {
      toggleChatSound.addEventListener('change', (e) => {
        settingsManager.setGameplaySetting('chatMessageSound', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    const toggleColorblind = root.querySelector(`#${prefixId}-toggle-colorblind`);
    if (toggleColorblind) {
      toggleColorblind.addEventListener('change', (e) => {
        settingsManager.setGameplaySetting('colorblindMode', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    const toggleBotHint = root.querySelector(`#${prefixId}-toggle-bot-hint`);
    if (toggleBotHint) {
      toggleBotHint.addEventListener('change', (e) => {
        settingsManager.setGameplaySetting('botHintEnabled', e.target.checked);
        SettingsUI.applyDisplayAndGameplayPreferences();
      });
    }

    // --- System Actions ---
    const btnFullscreen = root.querySelector(`#${prefixId}-btn-fullscreen`);
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        SettingsUI.toggleFullscreen();
      });
    }

    const btnResetDefaults = root.querySelector(`#${prefixId}-btn-reset-defaults`);
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', () => {
        settingsManager.resetToDefaults();
      });
    }
  }

  /**
   * Đồng bộ dữ liệu từ SettingsManager vào các thẻ input trong modal
   * @param {HTMLElement|string} container
   * @param {string} prefixId
   */
  static syncUIFromSettings(container, prefixId = 'settings') {
    if (typeof document === 'undefined' && typeof container === 'string') return;
    const root = typeof container === 'string' ? (typeof document !== 'undefined' && typeof document.querySelector === 'function' ? document.querySelector(container) : null) : container;
    if (!root || typeof root.querySelector !== 'function') return;

    const s = settingsManager.getSettings();

    // 1. Audio controls
    const masterVal = Math.round((s.audio.masterVolume ?? 0.8) * 100);
    const sliderMaster = root.querySelector(`#${prefixId}-slider-master`);
    const valMaster = root.querySelector(`#${prefixId}-val-master`);
    const btnMuteMaster = root.querySelector(`#${prefixId}-btn-mute-master`);

    if (sliderMaster) sliderMaster.value = masterVal;
    if (valMaster) valMaster.textContent = `${masterVal}%`;
    if (btnMuteMaster) {
      const isMuted = Boolean(s.audio.masterMuted);
      btnMuteMaster.classList.toggle('muted', isMuted);
      btnMuteMaster.textContent = isMuted ? '🔇' : '🔊';
    }

    const bgmVal = Math.round((s.audio.bgmVolume ?? 0.7) * 100);
    const sliderBgm = root.querySelector(`#${prefixId}-slider-bgm`);
    const valBgm = root.querySelector(`#${prefixId}-val-bgm`);
    const btnMuteBgm = root.querySelector(`#${prefixId}-btn-mute-bgm`);

    if (sliderBgm) sliderBgm.value = bgmVal;
    if (valBgm) valBgm.textContent = `${bgmVal}%`;
    if (btnMuteBgm) {
      const isMuted = Boolean(s.audio.bgmMuted);
      btnMuteBgm.classList.toggle('muted', isMuted);
      btnMuteBgm.textContent = isMuted ? '🔇' : '🎵';
    }

    const sfxVal = Math.round((s.audio.sfxVolume ?? 1.0) * 100);
    const sliderSfx = root.querySelector(`#${prefixId}-slider-sfx`);
    const valSfx = root.querySelector(`#${prefixId}-val-sfx`);
    const btnMuteSfx = root.querySelector(`#${prefixId}-btn-mute-sfx`);

    if (sliderSfx) sliderSfx.value = sfxVal;
    if (valSfx) valSfx.textContent = `${sfxVal}%`;
    if (btnMuteSfx) {
      const isMuted = Boolean(s.audio.sfxMuted);
      btnMuteSfx.classList.toggle('muted', isMuted);
      btnMuteSfx.textContent = isMuted ? '🔇' : '🔔';
    }

    // 2. Display controls
    const toggleParticles = root.querySelector(`#${prefixId}-toggle-particles`);
    if (toggleParticles) toggleParticles.checked = Boolean(s.display.particlesEnabled);

    const toggleReducedMotion = root.querySelector(`#${prefixId}-toggle-reduced-motion`);
    if (toggleReducedMotion) toggleReducedMotion.checked = Boolean(s.display.reducedMotion);

    const toggleCardZoom = root.querySelector(`#${prefixId}-toggle-card-zoom`);
    if (toggleCardZoom) toggleCardZoom.checked = Boolean(s.display.cardHoverZoom);

    // 3. Gameplay controls
    const toggleTurnAlert = root.querySelector(`#${prefixId}-toggle-turn-alert`);
    if (toggleTurnAlert) toggleTurnAlert.checked = Boolean(s.gameplay.turnAlertSound);

    const toggleChatSound = root.querySelector(`#${prefixId}-toggle-chat-sound`);
    if (toggleChatSound) toggleChatSound.checked = Boolean(s.gameplay.chatMessageSound);

    const toggleColorblind = root.querySelector(`#${prefixId}-toggle-colorblind`);
    if (toggleColorblind) toggleColorblind.checked = Boolean(s.gameplay.colorblindMode);

    const toggleBotHint = root.querySelector(`#${prefixId}-toggle-bot-hint`);
    if (toggleBotHint) toggleBotHint.checked = Boolean(s.gameplay.botHintEnabled);
  }

  /**
   * Khởi tạo và gắn Modal Cài Đặt vào body của trang
   * @param {Object} options
   * @param {string} options.modalId - Id của modal overlay (mặc định: 'settings-modal')
   * @param {string} options.prefixId - Tiền tố id bên trong template (mặc định: 'settings')
   * @param {string} options.openTriggerSelector - Selector của nút bấm mở modal
   */
  static setupModal({
    modalId = 'settings-modal',
    prefixId = 'settings',
    openTriggerSelector = '#btn-open-settings'
  } = {}) {
    if (typeof document === 'undefined') return null;

    let modalOverlay = document.getElementById(modalId);

    // Nếu modal chưa có trong DOM, tự động tạo mới
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = modalId;
      modalOverlay.className = 'settings-modal-overlay';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-label', 'Cài đặt hệ thống Garden Empire');

      modalOverlay.innerHTML = SettingsUI.getModalTemplate({ prefixId });
      document.body.appendChild(modalOverlay);

      // Kích hoạt tabs trong modal
      SettingsUI.initTabs(modalOverlay);

      // Gắn sự kiện cho các điều khiển
      SettingsUI.bindSettingsControls(modalOverlay, prefixId);

      // Đồng bộ trạng thái ban đầu
      SettingsUI.syncUIFromSettings(modalOverlay, prefixId);

      // Áp dụng các tùy chọn đồ họa và trợ năng lên thẻ html ngay khi khởi tạo
      SettingsUI.applyDisplayAndGameplayPreferences();

      // Đồng bộ biểu tượng âm thanh trên navbar nếu có
      const updateNavbarSoundIcon = () => {
        if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
        const soundIcon = document.getElementById('sound-icon');
        if (soundIcon) {
          soundIcon.textContent = settingsManager.isMasterMuted() ? '🔇' : '🔊';
        }
      };
      updateNavbarSoundIcon();

      // Lắng nghe thay đổi từ SettingsManager để cập nhật ngược lại UI nếu có mutation từ nguồn khác
      settingsManager.addListener((change, currentSettings) => {
        SettingsUI.syncUIFromSettings(modalOverlay, prefixId);
        SettingsUI.applyDisplayAndGameplayPreferences(currentSettings);
        updateNavbarSoundIcon();
      });

      // Nút đóng modal (header ✕ và footer Xong)
      const closeBtn = modalOverlay.querySelector(`#${prefixId}-btn-close`);
      if (closeBtn) {
        closeBtn.addEventListener('click', () => SettingsUI.closeModal(modalId));
      }

      const doneBtn = modalOverlay.querySelector(`#${prefixId}-btn-done`);
      if (doneBtn) {
        doneBtn.addEventListener('click', () => SettingsUI.closeModal(modalId));
      }

      // Đóng khi click ngoài backdrop
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          SettingsUI.closeModal(modalId);
        }
      });

      // Hỗ trợ phím tắt toàn cục
      document.addEventListener('keydown', (e) => {
        // Đóng bằng phím Esc
        if (e.key === 'Escape' && SettingsUI.isOpen(modalId)) {
          SettingsUI.closeModal(modalId);
          return;
        }

        // Mở/đóng bằng phím 'O' hoặc ',' khi không nhập text trong ô input
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        const isEditing = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);
        if (!isEditing && !e.ctrlKey && !e.altKey && !e.metaKey) {
          if (e.key === 'o' || e.key === 'O' || e.key === ',') {
            e.preventDefault();
            if (SettingsUI.isOpen(modalId)) {
              SettingsUI.closeModal(modalId);
            } else {
              SettingsUI.openModal(modalId, prefixId);
            }
          }
        }
      });
    }

    // Gắn sự kiện mở cho các trigger nút bấm
    if (openTriggerSelector) {
      const triggers = document.querySelectorAll(openTriggerSelector);
      triggers.forEach(trig => {
        trig.addEventListener('click', (e) => {
          e.preventDefault();
          SettingsUI.openModal(modalId, prefixId);
        });
      });
    }

    return modalOverlay;
  }

  /**
   * Mở modal cài đặt
   * @param {string} modalId
   * @param {string} prefixId
   */
  static openModal(modalId = 'settings-modal', prefixId = 'settings') {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (modal) {
      SettingsUI.syncUIFromSettings(modal, prefixId);
      modal.classList.add('active');
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }

      // Focus vào nút tab đang hoạt động để trợ năng
      const activeTab = modal.querySelector('.settings-tab-btn.active') || modal.querySelector('.settings-tab-btn');
      if (activeTab) activeTab.focus();
    }
  }

  /**
   * Đóng modal cài đặt
   * @param {string} modalId
   */
  static closeModal(modalId = 'settings-modal') {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      if (document.body) {
        document.body.style.overflow = '';
      }
    }
  }

  /**
   * Kiểm tra modal có đang mở hay không
   * @param {string} modalId
   * @returns {boolean}
   */
  static isOpen(modalId = 'settings-modal') {
    if (typeof document === 'undefined') return false;
    const modal = document.getElementById(modalId);
    return Boolean(modal && modal.classList.contains('active'));
  }

  /**
   * Áp dụng các thuộc tính data-attributes lên thẻ html để điều khiển CSS
   * @param {Object} [settings] Cấu hình từ SettingsManager (mặc định lấy cấu hình hiện tại)
   */
  static applyDisplayAndGameplayPreferences(settings = null) {
    if (typeof document === 'undefined') return;
    const s = settings || settingsManager.getSettings();
    const docEl = document.documentElement;
    if (!docEl || !docEl.dataset) return;

    if (s.display) {
      docEl.dataset.particles = String(Boolean(s.display.particlesEnabled));
      docEl.dataset.reducedMotion = String(Boolean(s.display.reducedMotion));
      docEl.dataset.cardHoverZoom = String(Boolean(s.display.cardHoverZoom));
    }
    if (s.gameplay) {
      docEl.dataset.colorblind = String(Boolean(s.gameplay.colorblindMode));
      docEl.dataset.botHint = String(Boolean(s.gameplay.botHintEnabled));
    }
  }

  /**
   * Phát âm thanh xúc giác để nghe thử mức âm lượng SFX
   */
  static testSfxSound() {
    try {
      if (typeof SoundFX !== 'undefined' && SoundFX && typeof SoundFX.playTokenSound === 'function') {
        SoundFX.playTokenSound();
      }
    } catch (_) {
      // Bỏ qua lỗi audio môi trường test
    }
  }

  /**
   * Chuyển đổi trạng thái toàn màn hình
   */
  static toggleFullscreen() {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn('[SettingsUI] Fullscreen toggle error:', e);
    }
  }
}

// Global exposure
export const settingsUI = SettingsUI;

if (typeof window !== 'undefined') {
  window.SettingsUI = SettingsUI;
}
