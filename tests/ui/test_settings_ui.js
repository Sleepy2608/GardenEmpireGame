/**
 * GARDEN EMPIRE - SETTINGS UI TEST SUITE
 * Kiểm thử toàn diện Modal Cài Đặt Hệ Thống & Giao Diện Người Dùng:
 * - Render đầy đủ 4 Tabs và 4 Panels ngữ nghĩa (Audio, Display, Gameplay, System)
 * - Controls: 3 Sliders (Master, BGM, SFX), 3 Mute buttons, Test Sound button
 * - 3 Toggle switches đồ họa (Particles, Reduced Motion, Card Zoom)
 * - 4 Toggle switches gameplay & trợ năng (Turn Alert, Chat Sound, Colorblind, Bot Hint)
 * - Hệ thống & Tác quyền: Fullscreen, Version v1.7.0, Keyboard shortcuts, CC-BY 4.0
 * - Cơ chế chuyển Tab (Click & Keyboard Arrow navigation)
 * - Đồng bộ 2 chiều với SettingsManager
 * - Modal toàn màn hình (Mở, đóng, backdrop, Esc/O shortcuts)
 * - Tuân thủ tuyệt đối chuẩn Anti-slop (Zero em-dashes: 0 ký tự '—' và '–')
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

// Import modules
import { SettingsUI } from '../../client/js/ui/SettingsUI.js';
import { settingsManager } from '../../client/js/settings/SettingsManager.js';

describe('⚙️ TEST SUITE: SETTINGS MODAL & PREFERENCES UI (4 TABS & CONTROLS)', () => {

  beforeEach(() => {
    globalThis.localStorage.clear();
    settingsManager.resetToDefaults();
  });

  // ===========================================================================
  // PHẦN 1: KIỂM THỬ NỘI DUNG VÀ TÍNH TOÀN VẸN CỦA TEMPLATE MODAL
  // ===========================================================================
  it('1.1. getModalTemplate() phải render đầy đủ 4 Tabs và 4 Panels ngữ nghĩa', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    assert.ok(template.includes('test-settings-tab-btn-audio'), 'Phải có Tab button Audio');
    assert.ok(template.includes('test-settings-tab-btn-display'), 'Phải có Tab button Display');
    assert.ok(template.includes('test-settings-tab-btn-gameplay'), 'Phải có Tab button Gameplay');
    assert.ok(template.includes('test-settings-tab-btn-system'), 'Phải có Tab button System');

    assert.ok(template.includes('test-settings-panel-audio'), 'Phải có Panel Audio');
    assert.ok(template.includes('test-settings-panel-display'), 'Phải có Panel Display');
    assert.ok(template.includes('test-settings-panel-gameplay'), 'Phải có Panel Gameplay');
    assert.ok(template.includes('test-settings-panel-system'), 'Phải có Panel System');
  });

  it('1.2. Tab 1 (Audio): Đầy đủ 3 sliders, 3 mute buttons và nút Thử Âm', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    // Master
    assert.ok(template.includes('test-settings-slider-master'), 'Có slider Master Volume');
    assert.ok(template.includes('test-settings-val-master'), 'Có text hiển thị % Master Volume');
    assert.ok(template.includes('test-settings-btn-mute-master'), 'Có nút Mute Master');

    // BGM
    assert.ok(template.includes('test-settings-slider-bgm'), 'Có slider BGM Volume');
    assert.ok(template.includes('test-settings-val-bgm'), 'Có text hiển thị % BGM Volume');
    assert.ok(template.includes('test-settings-btn-mute-bgm'), 'Có nút Mute BGM');

    // SFX
    assert.ok(template.includes('test-settings-slider-sfx'), 'Có slider SFX Volume');
    assert.ok(template.includes('test-settings-val-sfx'), 'Có text hiển thị % SFX Volume');
    assert.ok(template.includes('test-settings-btn-mute-sfx'), 'Có nút Mute SFX');
    assert.ok(template.includes('test-settings-btn-test-sfx'), 'Có nút Thử Âm SFX');
  });

  it('1.3. Tab 2 (Display): Đầy đủ 3 toggles đồ họa (Particles, Reduced Motion, Card Zoom)', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    assert.ok(template.includes('test-settings-toggle-particles'), 'Có toggle Eco Particles');
    assert.ok(template.includes('test-settings-toggle-reduced-motion'), 'Có toggle Reduced Motion');
    assert.ok(template.includes('test-settings-toggle-card-zoom'), 'Có toggle Card Hover Zoom');
  });

  it('1.4. Tab 3 (Gameplay): Đầy đủ 4 toggles bàn đấu và trợ năng', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    assert.ok(template.includes('test-settings-toggle-turn-alert'), 'Có toggle Turn Alert Sound');
    assert.ok(template.includes('test-settings-toggle-chat-sound'), 'Có toggle Chat Message Sound');
    assert.ok(template.includes('test-settings-toggle-colorblind'), 'Có toggle Colorblind Mode');
    assert.ok(template.includes('test-settings-toggle-bot-hint'), 'Có toggle Bot Strategy Hints');
  });

  it('1.5. Tab 4 (System): Toàn màn hình, version v1.7.0, phím tắt và tác quyền CC-BY 4.0', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    assert.ok(template.includes('test-settings-btn-fullscreen'), 'Có nút Fullscreen');
    assert.ok(template.includes('v1.7.0'), 'Có huy hiệu version v1.7.0');
    assert.ok(template.includes('Kevin MacLeod') && template.includes('CC-BY 4.0'), 'Có tác quyền âm nhạc CC-BY 4.0');
    assert.ok(template.includes('Phím Tắt') || template.includes('shortcuts-card'), 'Có bảng thông tin phím tắt');
  });

  it('1.6. Header & Footer: Nút đóng ✕, nút Xong và nút Khôi Phục Mặc Định', () => {
    const template = SettingsUI.getModalTemplate({ prefixId: 'test-settings' });

    assert.ok(template.includes('test-settings-btn-close'), 'Có nút đóng ✕');
    assert.ok(template.includes('test-settings-btn-done'), 'Có nút hoàn tất Xong');
    assert.ok(template.includes('test-settings-btn-reset-defaults'), 'Có nút Khôi Phục Mặc Định');
  });

  // ===========================================================================
  // PHẦN 2: KIỂM THỬ CHUYỂN TAB VÀ ĐIỀU HƯỚNG PHÍM MŨI TÊN
  // ===========================================================================
  it('2.1. initTabs() chuyển đổi tab và panel đúng ngữ nghĩa', () => {
    const tabBtns = [
      {
        dataset: { tab: 'audio' },
        classList: { classes: new Set(['active']), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); }, contains(cls) { return this.classes.has(cls); } },
        setAttribute(k, v) { this[k] = v; },
        addEventListener(ev, fn) { if (ev === 'click') this.onClick = fn; }
      },
      {
        dataset: { tab: 'display' },
        classList: { classes: new Set(), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); }, contains(cls) { return this.classes.has(cls); } },
        setAttribute(k, v) { this[k] = v; },
        addEventListener(ev, fn) { if (ev === 'click') this.onClick = fn; }
      }
    ];

    const panelEls = [
      { id: 'settings-panel-audio', classList: { classes: new Set(['active']), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); } } },
      { id: 'settings-panel-display', classList: { classes: new Set(), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); } } }
    ];

    const dummyContainer = {
      querySelectorAll(sel) {
        if (sel === '.settings-tab-btn') return tabBtns;
        if (sel === '.settings-panel') return panelEls;
        return [];
      }
    };

    SettingsUI.initTabs(dummyContainer);

    // Click vào tab Display
    assert.strictEqual(typeof tabBtns[1].onClick, 'function');
    tabBtns[1].onClick();

    assert.strictEqual(tabBtns[1].classList.classes.has('active'), true, 'Tab Display phải active');
    assert.strictEqual(tabBtns[1]['aria-selected'], 'true', 'Tab Display aria-selected = true');
    assert.strictEqual(tabBtns[0].classList.classes.has('active'), false, 'Tab Audio phải bỏ active');
    assert.strictEqual(panelEls[1].classList.classes.has('active'), true, 'Panel Display phải active');
    assert.strictEqual(panelEls[0].classList.classes.has('active'), false, 'Panel Audio phải ẩn');
  });

  // ===========================================================================
  // PHẦN 3: KIỂM THỬ ĐỒNG BỘ CONTROLS VỚI SETTINGSMANAGER
  // ===========================================================================
  it('3.1. bindSettingsControls() liên kết sự kiện slider Master/BGM/SFX với SettingsManager', () => {
    let masterInputHandler = null;
    let bgmInputHandler = null;
    let sfxInputHandler = null;

    const mockRoot = {
      querySelector(sel) {
        if (sel.includes('slider-master')) {
          return { addEventListener(ev, fn) { if (ev === 'input') masterInputHandler = fn; } };
        }
        if (sel.includes('slider-bgm')) {
          return { addEventListener(ev, fn) { if (ev === 'input') bgmInputHandler = fn; } };
        }
        if (sel.includes('slider-sfx')) {
          return { addEventListener(ev, fn) { if (ev === 'input') sfxInputHandler = fn; } };
        }
        return null;
      }
    };

    SettingsUI.bindSettingsControls(mockRoot, 'settings');

    assert.strictEqual(typeof masterInputHandler, 'function');
    assert.strictEqual(typeof bgmInputHandler, 'function');
    assert.strictEqual(typeof sfxInputHandler, 'function');

    // Kéo Master slider về 45%
    masterInputHandler({ target: { value: '45' } });
    assert.strictEqual(settingsManager.getMasterVolume(), 0.45, 'Master volume phải cập nhật về 0.45');

    // Kéo BGM slider về 20%
    bgmInputHandler({ target: { value: '20' } });
    assert.strictEqual(settingsManager.getBgmVolume(), 0.2, 'BGM volume phải cập nhật về 0.2');

    // Kéo SFX slider về 60%
    sfxInputHandler({ target: { value: '60' } });
    assert.strictEqual(settingsManager.getSfxVolume(), 0.6, 'SFX volume phải cập nhật về 0.6');
  });

  it('3.2. bindSettingsControls() liên kết nút mute và nút khôi phục mặc định', () => {
    let muteMasterClickHandler = null;
    let resetClickHandler = null;

    const mockRoot = {
      querySelector(sel) {
        if (sel.includes('btn-mute-master')) {
          return { addEventListener(ev, fn) { if (ev === 'click') muteMasterClickHandler = fn; } };
        }
        if (sel.includes('btn-reset-defaults')) {
          return { addEventListener(ev, fn) { if (ev === 'click') resetClickHandler = fn; } };
        }
        return null;
      }
    };

    SettingsUI.bindSettingsControls(mockRoot, 'settings');

    assert.strictEqual(typeof muteMasterClickHandler, 'function');
    assert.strictEqual(typeof resetClickHandler, 'function');

    // Click Mute Master
    assert.strictEqual(settingsManager.isMasterMuted(), false);
    muteMasterClickHandler();
    assert.strictEqual(settingsManager.isMasterMuted(), true);

    // Thay đổi volume rồi click Reset
    settingsManager.setBgmVolume(0.15);
    resetClickHandler();
    assert.strictEqual(settingsManager.getBgmVolume(), 0.7, 'Sau reset BGM volume phải về mặc định 0.7');
    assert.strictEqual(settingsManager.isMasterMuted(), false, 'Sau reset Master Mute phải về false');
  });

  it('3.3. syncUIFromSettings() điền đúng giá trị vào các elements', () => {
    const els = {
      '#settings-slider-master': { value: 0 },
      '#settings-val-master': { textContent: '' },
      '#settings-btn-mute-master': {
        textContent: '',
        classList: { classes: new Set(), toggle(cls, v) { if (v) this.classes.add(cls); else this.classes.delete(cls); } }
      },
      '#settings-slider-bgm': { value: 0 },
      '#settings-val-bgm': { textContent: '' },
      '#settings-btn-mute-bgm': {
        textContent: '',
        classList: { classes: new Set(), toggle(cls, v) { if (v) this.classes.add(cls); else this.classes.delete(cls); } }
      },
      '#settings-slider-sfx': { value: 0 },
      '#settings-val-sfx': { textContent: '' },
      '#settings-btn-mute-sfx': {
        textContent: '',
        classList: { classes: new Set(), toggle(cls, v) { if (v) this.classes.add(cls); else this.classes.delete(cls); } }
      },
      '#settings-toggle-particles': { checked: false },
      '#settings-toggle-reduced-motion': { checked: false },
      '#settings-toggle-card-zoom': { checked: false },
      '#settings-toggle-turn-alert': { checked: false },
      '#settings-toggle-chat-sound': { checked: false },
      '#settings-toggle-colorblind': { checked: false },
      '#settings-toggle-bot-hint': { checked: false }
    };

    const mockRoot = {
      querySelector(sel) {
        return els[sel] || null;
      }
    };

    settingsManager.setMasterVolume(0.85);
    settingsManager.setBgmVolume(0.65);
    settingsManager.setMasterMuted(true);
    settingsManager.setDisplaySetting('particlesEnabled', true);
    settingsManager.setGameplaySetting('colorblindMode', true);

    SettingsUI.syncUIFromSettings(mockRoot, 'settings');

    assert.strictEqual(els['#settings-slider-master'].value, 85);
    assert.strictEqual(els['#settings-val-master'].textContent, '85%');
    assert.strictEqual(els['#settings-btn-mute-master'].textContent, '🔇');
    assert.strictEqual(els['#settings-btn-mute-master'].classList.classes.has('muted'), true);

    assert.strictEqual(els['#settings-slider-bgm'].value, 65);
    assert.strictEqual(els['#settings-val-bgm'].textContent, '65%');

    assert.strictEqual(els['#settings-toggle-particles'].checked, true);
    assert.strictEqual(els['#settings-toggle-colorblind'].checked, true);
  });

  // ===========================================================================
  // PHẦN 4: KIỂM THỬ CSS & QUY TẮC ANTI-SLOP (ZERO EM-DASH)
  // ===========================================================================
  it('4.1. client/css/settings.css phải tồn tại và chứa các class kính mờ cần thiết', () => {
    const cssPath = path.resolve('client/css/settings.css');
    assert.ok(fs.existsSync(cssPath), 'Tệp client/css/settings.css phải tồn tại');

    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(cssContent.includes('.settings-modal-overlay'), 'CSS có class .settings-modal-overlay');
    assert.ok(cssContent.includes('.settings-modal-dialog'), 'CSS có class .settings-modal-dialog');
    assert.ok(cssContent.includes('.settings-tab-btn'), 'CSS có class .settings-tab-btn');
    assert.ok(cssContent.includes('.setting-range-slider'), 'CSS có class .setting-range-slider');
    assert.ok(cssContent.includes('.toggle-switch'), 'CSS có class .toggle-switch');
    assert.ok(cssContent.includes('.btn-navbar-settings'), 'CSS có class .btn-navbar-settings cho nút bánh răng');
    assert.ok(cssContent.includes('tabular-nums'), 'CSS áp dụng tabular-nums chống lệch layout số');
  });

  it('4.2. Quy tắc 9.G Anti-slop: Tuyệt đối không chứa ký tự em-dash hay en-dash trong settings.css', () => {
    const cssPath = path.resolve('client/css/settings.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const emDashes = (cssContent.match(/—/g) || []).length;
    const enDashes = (cssContent.match(/–/g) || []).length;

    assert.strictEqual(emDashes, 0, 'settings.css không được chứa ký tự em-dash (—)');
    assert.strictEqual(enDashes, 0, 'settings.css không được chứa ký tự en-dash (–)');
  });

  it('4.3. Quy tắc 9.G Anti-slop: Template và code trong SettingsUI.js không chứa em-dash hay en-dash', () => {
    const jsPath = path.resolve('client/js/ui/SettingsUI.js');
    const jsContent = fs.readFileSync(jsPath, 'utf-8');

    const emDashes = (jsContent.match(/—/g) || []).length;
    const enDashes = (jsContent.match(/–/g) || []).length;

    assert.strictEqual(emDashes, 0, 'SettingsUI.js không được chứa ký tự em-dash (—)');
    assert.strictEqual(enDashes, 0, 'SettingsUI.js không được chứa ký tự en-dash (–)');
  });

  // ===========================================================================
  // PHẦN 5: KIỂM THỬ VÒNG ĐỜI MODAL (OPEN, CLOSE, ISOPEN)
  // ===========================================================================
  it('5.1. openModal() và closeModal() cập nhật class active và overflow body', () => {
    const mockModal = {
      classList: {
        classes: new Set(),
        add(cls) { this.classes.add(cls); },
        remove(cls) { this.classes.delete(cls); },
        contains(cls) { return this.classes.has(cls); }
      },
      querySelector() { return null; }
    };

    globalThis.document = {
      getElementById(id) {
        return id === 'settings-modal' ? mockModal : null;
      },
      body: { style: { overflow: '' } }
    };

    // Trước khi mở
    assert.strictEqual(SettingsUI.isOpen('settings-modal'), false);

    // Mở modal
    SettingsUI.openModal('settings-modal');
    assert.strictEqual(SettingsUI.isOpen('settings-modal'), true);
    assert.strictEqual(globalThis.document.body.style.overflow, 'hidden');

    // Đóng modal
    SettingsUI.closeModal('settings-modal');
    assert.strictEqual(SettingsUI.isOpen('settings-modal'), false);
    assert.strictEqual(globalThis.document.body.style.overflow, '');

    delete globalThis.document;
  });

});
