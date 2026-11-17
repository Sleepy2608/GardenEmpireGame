/**
 * GARDEN EMPIRE — IN-GAME CHAT TOGGLE & SHORTEN BUTTON TEST SUITE (Issue #25)
 * Kiểm thử tự động tính năng Thu gọn / Mở rộng Khung Chat trực tuyến:
 * 1. CSS Global Visibility: Quy tắc `.hidden { display: none !important; }` trong common.css/game.css
 * 2. Phục hồi sự cố "the shorten button in game chat is not working"
 * 3. Loại bỏ nút thu nhỏ bị trùng lặp "duplicated shorten button" trong chat-mini-ticker
 * 4. Tương tác đa kênh: Click nút mũi tên, click thanh Header, click Ticker bar, click Top Bar Chat
 * 5. Trợ năng Accessibility: Cập nhật aria-expanded, aria-label, title chuẩn UX
 *
 * Chuẩn: Arrange - Act - Assert (AAA) theo .agents/AGENTS.md
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

console.log('\n💬 ========================================================');
console.log('🧪 TEST SUITE: CHAT TOGGLE & SHORTEN BUTTON (ISSUE #25)');
console.log('💬 ========================================================\n');

// =============================================================================
// PHẦN 1: KIỂM TRA CSS GLOBAL VISIBILITY & CHAT WIDGET RULES
// =============================================================================
console.log('▶ [PHẦN 1] Kiểm tra Quy tắc CSS Ẩn/Hiện (.hidden & .is-collapsed)');

const commonCssPath = path.resolve('client/css/common.css');
const gameCssPath = path.resolve('client/css/game.css');
const gameHtmlPath = path.resolve('client/game.html');

const commonCss = fs.readFileSync(commonCssPath, 'utf8');
const gameCss = fs.readFileSync(gameCssPath, 'utf8');
const gameHtml = fs.readFileSync(gameHtmlPath, 'utf8');

runTest('1.1. CSS common.css hoặc game.css phải có quy tắc .hidden { display: none !important; }', () => {
  const hasHiddenRule = /\.hidden\s*\{[^}]*display\s*:\s*none\s*!important/i.test(commonCss) ||
                        /\.hidden\s*\{[^}]*display\s*:\s*none\s*!important/i.test(gameCss);
  assert.strictEqual(hasHiddenRule, true, 'Thiếu quy tắc CSS .hidden { display: none !important; } khiến chat-body và ticker không thể ẩn/hiện');
});

runTest('1.2. CSS game.css phải có quy tắc ẩn chat-body khi chat-widget có class is-collapsed', () => {
  const hasCollapsedBodyRule = /\.chat-widget\.is-collapsed\s+\.chat-body\s*\{[^}]*display\s*:\s*none/i.test(gameCss);
  assert.strictEqual(hasCollapsedBodyRule, true, 'Thiếu quy tắc .chat-widget.is-collapsed .chat-body { display: none !important; }');
});

runTest('1.3. CSS game.css phải có quy tắc ẩn chat-mini-ticker khi chat-widget chưa thu gọn (not is-collapsed)', () => {
  const hasExpandedTickerHidden = /\.chat-widget:not\(\.is-collapsed\)\s+\.chat-mini-ticker\s*\{[^}]*display\s*:\s*none/i.test(gameCss) ||
                                  /\.chat-mini-ticker\.hidden\s*\{[^}]*display\s*:\s*none/i.test(gameCss) ||
                                  /\.hidden\s*\{[^}]*display\s*:\s*none\s*!important/i.test(commonCss);
  assert.strictEqual(hasExpandedTickerHidden, true, 'chat-mini-ticker phải được ẩn khi chat đang mở rộng');
});

// =============================================================================
// PHẦN 2: KIỂM TRA TRÙNG LẶP NÚT THU NHỎ / MỞ RỘNG (DUPLICATED SHORTEN BUTTON)
// =============================================================================
console.log('\n▶ [PHẦN 2] Kiểm tra Loại Bỏ Nút Trùng Lặp (Duplicated Shorten Button)');

runTest('2.1. chat-mini-ticker trong game.html KHÔNG được chứa icon mũi tên trùng lặp (chat-ticker-expand-icon)', () => {
  const tickerStart = gameHtml.indexOf('id="chat-mini-ticker"');
  assert.ok(tickerStart !== -1, 'Không tìm thấy #chat-mini-ticker trong game.html');
  const nextSection = gameHtml.indexOf('id="chat-body"', tickerStart);
  const tickerBlock = gameHtml.substring(tickerStart, nextSection !== -1 ? nextSection : tickerStart + 400);
  const hasDuplicateArrow = /chat-ticker-expand-icon/i.test(tickerBlock) ||
                            /▲/i.test(tickerBlock);
  assert.strictEqual(hasDuplicateArrow, false, 'Phát hiện nút mũi tên thu nhỏ/mở rộng bị trùng lặp trong #chat-mini-ticker');
});

runTest('2.2. Nút thu gọn #btn-toggle-chat-collapse phải có aria-label và aria-expanded', () => {
  const btnMatch = gameHtml.match(/<button[^>]*id="btn-toggle-chat-collapse"[^>]*>/i);
  assert.ok(btnMatch, 'Không tìm thấy #btn-toggle-chat-collapse trong game.html');
  const btnTag = btnMatch[0];
  assert.ok(/aria-label=/i.test(btnTag), 'Nút thu gọn thiếu aria-label cho trợ năng');
  assert.ok(/aria-expanded=/i.test(btnTag), 'Nút thu gọn thiếu aria-expanded');
});

// =============================================================================
// PHẦN 3: KIỂM THỬ ĐƠN VỊ ĐIỀU HƯỚNG DOM & SỰ KIỆN CHATUI (AAA)
// =============================================================================
console.log('\n▶ [PHẦN 3] Kiểm thử DOM & Xử lý Sự kiện ChatUI');

// Giả lập DOM Headless
class MockClassList {
  constructor(initial = []) {
    this.classes = new Set(initial);
  }
  add(...names) { names.forEach(n => this.classes.add(n)); }
  remove(...names) { names.forEach(n => this.classes.delete(n)); }
  contains(name) { return this.classes.has(name); }
  toggle(name, force) {
    if (typeof force === 'boolean') {
      force ? this.classes.add(name) : this.classes.delete(name);
      return force;
    }
    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    }
    this.classes.add(name);
    return true;
  }
}

class MockElement {
  constructor(id = '', tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.textContent = '';
    this.title = '';
    this.value = '';
    this.scrollHeight = 200;
    this.scrollTop = 0;
    this.clientHeight = 150;
  }
  setAttribute(name, val) { this.attributes.set(name, String(val)); }
  getAttribute(name) { return this.attributes.get(name) || null; }
  hasAttribute(name) { return this.attributes.has(name); }
  addEventListener(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }
  click() {
    const handlers = this.listeners.get('click') || [];
    const event = { stopPropagation: () => {} };
    handlers.forEach(h => h(event));
  }
  focus() {}
  blur() {}
}

const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

global.window = {
  addEventListener: () => {}
};

global.requestAnimationFrame = (cb) => cb();

// Import động ChatUI
const { ChatUI } = await import('../client/js/ui/ChatUI.js');

function setupMockDOM() {
  const elements = {
    'chat-widget': new MockElement('chat-widget'),
    'chat-header': new MockElement('chat-header'),
    'chat-body': new MockElement('chat-body'),
    'chat-feed': new MockElement('chat-feed'),
    'chat-mini-ticker': new MockElement('chat-mini-ticker'),
    'chat-latest-text': new MockElement('chat-latest-text'),
    'btn-toggle-chat-collapse': new MockElement('btn-toggle-chat-collapse', 'button'),
    'chat-toggle-arrow': new MockElement('chat-toggle-arrow', 'span'),
    'chat-unread-badge': new MockElement('chat-unread-badge', 'span'),
    'chat-form': new MockElement('chat-form', 'form'),
    'chat-input': new MockElement('chat-input', 'input'),
    'btn-send-chat': new MockElement('btn-send-chat', 'button'),
    'btn-toggle-chat': new MockElement('btn-toggle-chat', 'button')
  };

  global.document = {
    getElementById: (id) => elements[id] || null,
    activeElement: null
  };

  return elements;
}

runTest('3.1. Trạng thái khởi tạo mặc định (Mở rộng): body hiển thị, ticker ẩn, mũi tên ▼', () => {
  mockStorage.clear();
  const els = setupMockDOM();
  const chat = new ChatUI();
  chat.init(() => {});

  assert.strictEqual(chat.isCollapsed, false, 'Mặc định chat không được thu gọn');
  assert.strictEqual(els['chat-widget'].classList.contains('is-collapsed'), false);
  assert.strictEqual(els['chat-body'].classList.contains('hidden'), false);
  assert.strictEqual(els['chat-mini-ticker'].classList.contains('hidden'), true);
  assert.strictEqual(els['chat-toggle-arrow'].textContent, '▼');
  assert.strictEqual(els['btn-toggle-chat-collapse'].getAttribute('aria-expanded'), 'true');
});

runTest('3.2. Bấm nút mũi tên #btn-toggle-chat-collapse thu gọn chat thành công', () => {
  mockStorage.clear();
  const els = setupMockDOM();
  const chat = new ChatUI();
  chat.init(() => {});

  // Act: Bấm nút mũi tên thu gọn
  els['btn-toggle-chat-collapse'].click();

  // Assert
  assert.strictEqual(chat.isCollapsed, true, 'Chat phải chuyển sang trạng thái isCollapsed = true');
  assert.strictEqual(els['chat-widget'].classList.contains('is-collapsed'), true);
  assert.strictEqual(els['chat-body'].classList.contains('hidden'), true, 'chat-body phải có class hidden');
  assert.strictEqual(els['chat-mini-ticker'].classList.contains('hidden'), false, 'chat-mini-ticker phải hiện');
  assert.strictEqual(els['chat-toggle-arrow'].textContent, '▲', 'Mũi tên phải đổi thành ▲');
  assert.strictEqual(els['btn-toggle-chat-collapse'].getAttribute('aria-expanded'), 'false');
  assert.strictEqual(mockStorage.get('garden_empire_chat_collapsed'), 'true');
});

runTest('3.3. Bấm vào Mini Ticker Bar mở rộng khung chat trở lại', () => {
  global.localStorage.setItem('garden_empire_chat_collapsed', 'true');
  const els = setupMockDOM();
  const chat = new ChatUI();
  chat.init(() => {});

  assert.strictEqual(chat.isCollapsed, true);

  // Act: Bấm vào ticker
  els['chat-mini-ticker'].click();

  // Assert
  assert.strictEqual(chat.isCollapsed, false, 'Bấm ticker phải mở rộng chat');
  assert.strictEqual(els['chat-widget'].classList.contains('is-collapsed'), false);
  assert.strictEqual(els['chat-body'].classList.contains('hidden'), false);
  assert.strictEqual(els['chat-mini-ticker'].classList.contains('hidden'), true);
  assert.strictEqual(els['chat-toggle-arrow'].textContent, '▼');
  assert.strictEqual(els['btn-toggle-chat-collapse'].getAttribute('aria-expanded'), 'true');
});

runTest('3.4. Bấm vào toàn bộ thanh Chat Header (#chat-header) cũng thu gọn / mở rộng được', () => {
  mockStorage.clear();
  const els = setupMockDOM();
  const chat = new ChatUI();
  chat.init(() => {});

  // Act 1: Click header để thu gọn
  els['chat-header'].click();
  assert.strictEqual(chat.isCollapsed, true, 'Click header phải thu gọn khung chat');

  // Act 2: Click header lần nữa để mở rộng
  els['chat-header'].click();
  assert.strictEqual(chat.isCollapsed, false, 'Click header lần 2 phải mở rộng khung chat');
});

runTest('3.5. Nút Trò Chuyện ở Top Bar (#btn-toggle-chat) toggle trạng thái thu gọn chuẩn xác', () => {
  mockStorage.clear();
  const els = setupMockDOM();
  const chat = new ChatUI();
  chat.init(() => {});

  // Act: Click nút ở Top Bar
  els['btn-toggle-chat'].click();
  assert.strictEqual(chat.isCollapsed, true, 'Click top bar chat button phải toggle trạng thái');

  els['btn-toggle-chat'].click();
  assert.strictEqual(chat.isCollapsed, false, 'Click top bar chat button lần 2 phải mở lại');
});

console.log('\n--------------------------------------------------------');
console.log(`📊 Tổng kết: ${passedTests} passed / ${failedTests} failed`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}
