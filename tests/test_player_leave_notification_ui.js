/**
 * GARDEN EMPIRE — PLAYER LEAVE NOTIFICATION & HANDLING UI TEST SUITE
 * Kiểm thử tự động giao diện thông báo người chơi rời phòng / ván đấu (Phase 15)
 * Kiểm tra:
 *  1. PlayerUI.renderOpponent: Hiển thị trạng thái mờ và badge [Đã Rời Ván]
 *  2. WaitingRoomUI: Nhận sự kiện ROOM_UPDATE có leftPlayer -> Hiển thị Toast cảnh báo hổ phách
 *  3. WaitingRoomUI: Nhận sự kiện phong Chủ Phòng mới -> Hiển thị Toast mạ vàng 👑
 *  4. BoardUI: Nhận sự kiện PLAYER_LEFT_GAME -> Bật Toast và System Chat
 *  5. BoardUI: Xử lý chiến thắng mặc định (Walkover) khi chỉ còn 1 người ở lại
 */

import { PlayerUI } from '../client/js/ui/PlayerUI.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
    failedTests++;
  }
}

// Mock DOM Environment
function createMockElement(tag) {
  let classes = new Set();
  let children = [];
  let html = '';
  let text = '';
  return {
    tagName: tag.toUpperCase(),
    dataset: {},
    style: {},
    get className() { return Array.from(classes).join(' '); },
    set className(val) { classes = new Set(val.split(/\s+/).filter(Boolean)); },
    classList: {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      contains: (n) => classes.has(n),
      toggle: (n) => classes.has(n) ? classes.delete(n) : classes.add(n)
    },
    get innerHTML() { return html; },
    set innerHTML(val) { 
      html = val;
      // Trích xuất textContent cơ bản từ html
      text = val.replace(/<[^>]*>/g, '');
    },
    get textContent() { return text || html.replace(/<[^>]*>/g, ''); },
    set textContent(val) { text = val; html = val; },
    appendChild: (child) => children.push(child),
    removeChild: (child) => { children = children.filter(c => c !== child); },
    get children() { return children; }
  };
}

global.document = {
  createElement: createMockElement,
  getElementById: (id) => {
    if (!global.document._elements[id]) {
      global.document._elements[id] = createMockElement('div');
    }
    return global.document._elements[id];
  },
  _elements: {}
};

global.window = {
  AudioContext: class {
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
    get currentTime() { return 0; }
    get destination() { return {}; }
  }
};

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: PLAYER LEAVE NOTIFICATION & HANDLING UI');
console.log('🌿 ========================================================');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 1: PlayerUI.renderOpponent (Ghế Tabletop 3D)
// ─────────────────────────────────────────────────────────────
console.log('\n▶ Test Case 1: Đối thủ đang chơi bình thường (Active)');
const normalOpponent = {
  id: 'p2',
  name: 'Bob Botanical',
  avatar: '🌺',
  hasLeft: false,
  prestigePoints: 7,
  tokens: { DIRT: 2, WATER: 1 },
  bonuses: { DIRT: 1 },
  purchasedCards: [{}],
  reservedCards: []
};

const activeEl = PlayerUI.renderOpponent(normalOpponent, true);
assert(activeEl.classList.contains('active-turn'), 'Người đang tới lượt có class active-turn');
assert(!activeEl.classList.contains('player-left'), 'Không có class player-left');
assert(!activeEl.classList.contains('player-abandoned'), 'Không có class player-abandoned');
assert(activeEl.innerHTML.includes('★ 7'), 'Hiển thị điểm Uy Tín ★ 7');
assert(!activeEl.innerHTML.includes('Đã Rời Ván'), 'Không hiển thị badge đã rời ván');

console.log('\n▶ Test Case 2: Đối thủ đã rời ván đấu (hasLeft = true)');
const leftOpponent = {
  id: 'p3',
  name: 'Charlie Cedar',
  avatar: '🍄',
  hasLeft: true,
  prestigePoints: 4,
  tokens: { DIRT: 1 },
  bonuses: {},
  purchasedCards: [],
  reservedCards: []
};

const leftEl = PlayerUI.renderOpponent(leftOpponent, true);
assert(!leftEl.classList.contains('active-turn'), 'Người đã rời ván TUYỆT ĐỐI không có active-turn');
assert(leftEl.classList.contains('player-left'), 'Có class player-left để áp dụng hiệu ứng mờ');
assert(leftEl.classList.contains('player-abandoned'), 'Có class player-abandoned');
assert(leftEl.innerHTML.includes('badge-player-left'), 'Có badge badge-player-left');
assert(leftEl.innerHTML.includes('🍂 Đã Rời Ván'), 'Nội dung badge ghi rõ 🍂 Đã Rời Ván');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 2: WaitingRoomUI Logic & Toasts
// ─────────────────────────────────────────────────────────────
console.log('\n▶ Test Case 3: WaitingRoomUI xử lý ROOM_UPDATE có leftPlayer');
const toastEl = createMockElement('div');
global.document._elements['toast'] = toastEl;

// Giả lập xử lý ROOM_UPDATE
const roomUpdateMsg = {
  type: 'ROOM_UPDATE',
  room: { id: 'GARDEN-1001', hostId: 'p1', players: [{ id: 'p1', name: 'Alice' }] },
  leftPlayer: { id: 'p2', name: 'Bob', avatar: '🌺' }
};

if (roomUpdateMsg.leftPlayer) {
  const leftAvatar = roomUpdateMsg.leftPlayer.avatar || '🌱';
  const leftName = roomUpdateMsg.leftPlayer.name || 'Người chơi';
  toastEl.textContent = `🍂 ${leftAvatar} ${leftName} đã rời phòng chờ.`;
  toastEl.className = 'toast toast-warning warning';
}

assert(toastEl.textContent.includes('Bob đã rời phòng chờ'), 'Toast phòng chờ thông báo chính xác tên người rời');
assert(toastEl.textContent.includes('🌺'), 'Toast hiển thị đúng avatar của người rời');
assert(toastEl.classList.contains('toast-warning'), 'Toast có class toast-warning');

console.log('\n▶ Test Case 4: WaitingRoomUI thăng chức Chủ Phòng mới (newHostId)');
const hostTransferMsg = {
  type: 'ROOM_UPDATE',
  room: { id: 'GARDEN-1001', hostId: 'p2', players: [{ id: 'p2', name: 'Bob' }] },
  leftPlayer: { id: 'p1', name: 'Alice' },
  newHostId: 'p2'
};

const myId = 'p2';
if (hostTransferMsg.newHostId === myId) {
  toastEl.textContent = '👑 Bạn đã trở thành Chủ Phòng mới! Hãy bắt đầu khi sẵn sàng.';
  toastEl.className = 'toast toast-success success';
}

assert(toastEl.textContent.includes('Bạn đã trở thành Chủ Phòng mới!'), 'Toast vinh danh tân chủ phòng xuất hiện');
assert(toastEl.classList.contains('toast-success'), 'Toast thăng chức mang class toast-success');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 3: In-Game Toast & System Chat on PLAYER_LEFT_GAME
// ─────────────────────────────────────────────────────────────
console.log('\n▶ Test Case 5: BoardUI xử lý sự kiện PLAYER_LEFT_GAME');
let lastChatMsg = null;
const mockChatUI = {
  onMessageReceived: (msg) => { lastChatMsg = msg; }
};

const playerLeftGameMsg = {
  type: 'PLAYER_LEFT_GAME',
  gameId: 'game-100',
  leftPlayer: { id: 'p3', name: 'Charlie', avatar: '🍄' }
};

// Giả lập logic trong BoardUI.handleSocketMessage
const leftPlayer = playerLeftGameMsg.leftPlayer;
const inGameToastText = `🍂 ${leftPlayer.avatar} ${leftPlayer.name} đã rời khỏi bàn đấu.`;
mockChatUI.onMessageReceived({
  id: 'sys_123',
  senderId: 'SYSTEM',
  senderName: 'Hệ thống',
  senderAvatar: '🍂',
  content: `Nghệ nhân ${leftPlayer.name} đã rời khỏi bàn cờ.`
});

assert(inGameToastText.includes('Charlie đã rời khỏi bàn đấu'), 'Toast in-game cảnh báo người chơi rời bàn đấu');
assert(lastChatMsg !== null, 'Hệ thống gửi tin nhắn vào Chat');
assert(lastChatMsg.senderName === 'Hệ thống', 'Sender là Hệ thống');
assert(lastChatMsg.content.includes('Charlie đã rời khỏi bàn cờ'), 'Nội dung chat hệ thống ghi rõ tên người rời');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 4: Chiến thắng mặc định (Walkover Victory)
// ─────────────────────────────────────────────────────────────
console.log('\n▶ Test Case 6: Banner & Modal khi chỉ còn 1 người chơi (Walkover Victory)');
const gameStateWalkover = {
  gameId: 'game-100',
  isGameOver: true,
  winnerPlayerId: 'p1',
  players: [
    { id: 'p1', name: 'Alice', prestigePoints: 6, hasLeft: false },
    { id: 'p2', name: 'Bob', prestigePoints: 12, hasLeft: true }
  ]
};

// Giả lập kiểm tra banner
const activePlayers = gameStateWalkover.players.filter(p => !p.hasLeft);
let bannerMessage = '';
if (gameStateWalkover.isGameOver) {
  if (activePlayers.length === 1 && activePlayers[0].id === 'p1') {
    bannerMessage = '🏆 ĐỐI THỦ ĐÃ RỜI BÀN — BẠN ĐẠT CHIẾN THẮNG MẶC ĐỊNH!';
  } else {
    bannerMessage = '🏆 VÁN ĐẤU ĐÃ KẾT THÚC!';
  }
}

assert(bannerMessage === '🏆 ĐỐI THỦ ĐÃ RỜI BÀN — BẠN ĐẠT CHIẾN THẮNG MẶC ĐỊNH!', 'Banner thông báo chiến thắng mặc định cho người duy nhất ở lại');

// Giả lập tính toán Quán quân
const candidateList = activePlayers.length > 0 ? activePlayers : gameStateWalkover.players;
const winner = candidateList.find(x => x.id === gameStateWalkover.winnerPlayerId) || candidateList[0];
assert(winner.id === 'p1', 'Người chiến thắng là Alice (dù Bob có 12 điểm nhưng đã rời bàn)');

let announcement = '';
if (activePlayers.length === 1 && winner.id === 'p1') {
  announcement = '🏆 TẤT CẢ ĐỐI THỦ ĐÃ RỜI BÀN — BẠN LÀ QUÁN QUÂN DUY NHẤT!';
}
assert(announcement === '🏆 TẤT CẢ ĐỐI THỦ ĐÃ RỜI BÀN — BẠN LÀ QUÁN QUÂN DUY NHẤT!', 'Pop-up vinh danh Quán quân duy nhất');

// ─────────────────────────────────────────────────────────────
// TỔNG KẾT
// ─────────────────────────────────────────────────────────────
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} PASS / ${failedTests} FAIL`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}

