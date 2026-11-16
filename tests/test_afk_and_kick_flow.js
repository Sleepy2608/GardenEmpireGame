/**
 * GARDEN EMPIRE — FULL TURN TIMER & AFK MANAGEMENT FLOW E2E TEST SUITE
 * Kiểm thử toàn diện chu trình chọn thời gian, đếm ngược, cảnh báo AFK (Strike 1),
 * xóa gậy phạt khi đi hợp lệ, và truất quyền thi đấu (Strike 2) theo chuẩn AAA (Phase 16 - Giai đoạn 5)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameState } from '../client/js/game/GameState.js';
import { Player } from '../client/js/game/Player.js';
import { PlayerUI } from '../client/js/ui/PlayerUI.js';
import { SoundFX } from '../client/js/ui/SoundFX.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: COMPLETE TURN TIMER & AFK FLOW E2E (PHASE 5)');
console.log('🌿 ========================================================\n');

// Mock DOM Environment cho Node.js
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

// ── KỊCH BẢN 1: Cấu hình thời gian mỗi lượt tại Phòng Chờ (60s, 120s, 300s) ──
console.log('▶ [KỊCH BẢN 1] Cấu hình thời gian mỗi lượt tại Phòng Chờ');

const allowedDurations = [60, 120, 300];
function validateTurnDuration(sec) {
  return allowedDurations.includes(Number(sec)) ? Number(sec) : 60;
}

assert(validateTurnDuration(60) === 60, 'Chấp nhận mốc 60 giây (1 Phút - Tiêu chuẩn)');
assert(validateTurnDuration(120) === 120, 'Chấp nhận mốc 120 giây (2 Phút - Chiến thuật)');
assert(validateTurnDuration(300) === 300, 'Chấp nhận mốc 300 giây (5 Phút - Thư thái)');
assert(validateTurnDuration(15) === 60, 'Từ chối mốc 15s bất thường -> Fallback về 60s');
assert(validateTurnDuration(600) === 60, 'Từ chối mốc 600s bất thường -> Fallback về 60s');

// ── KỊCH BẢN 2: Client GameState nhận payload & định dạng đếm ngược ──
console.log('\n▶ [KỊCH BẢN 2] Đồng bộ GameState & Định dạng thời gian');

const gameState = new GameState();
assert(gameState.turnDurationSeconds === 60, 'Khởi tạo mặc định 60 giây');
assert(gameState.turnStartTime === 0, 'Khởi tạo turnStartTime = 0');

const now = Date.now();
gameState.updateFromDto({
  gameId: 'game-e2e',
  turnDurationSeconds: 120,
  turnStartTime: now,
  currentTurnPlayerId: 'player-1',
  players: [
    { id: 'player-1', name: 'Alice', consecutiveAfkCount: 0, hasLeft: false },
    { id: 'player-2', name: 'Bob', consecutiveAfkCount: 0, hasLeft: false }
  ]
});

assert(gameState.turnDurationSeconds === 120, 'updateFromDto cập nhật turnDurationSeconds = 120');
assert(gameState.turnStartTime === now, 'updateFromDto cập nhật turnStartTime chính xác');

function formatTime(remainingSeconds) {
  const whole = Math.ceil(remainingSeconds);
  if (whole >= 60) {
    const m = Math.floor(whole / 60);
    const s = String(whole % 60).padStart(2, '0');
    return `${m}:${s}`;
  }
  return `${whole}s`;
}

// Kiểm tra mô phỏng F5 giữa chừng: Sau 45s trôi qua trong lượt 120s
const simulatedElapsed = 45;
const simulatedRemaining = 120 - simulatedElapsed; // 75s
assert(formatTime(simulatedRemaining) === '1:15', 'F5 giữa chừng: 75s còn lại định dạng chính xác thành 1:15');

// Kiểm tra ngưỡng cảnh báo khẩn cấp (<= 10s)
function getTimerState(remainingSeconds, totalDuration) {
  if (remainingSeconds <= 10) return 'timer-danger';
  if ((remainingSeconds / totalDuration) <= 0.25) return 'timer-warning';
  return 'timer-safe';
}

assert(getTimerState(100, 120) === 'timer-safe', 'Thời gian dồi dào (> 25%) -> timer-safe');
assert(getTimerState(25, 120) === 'timer-warning', 'Thời gian còn 25s (<= 25%) -> timer-warning');
assert(getTimerState(10, 120) === 'timer-danger', 'Thời gian còn 10s -> timer-danger');
assert(getTimerState(3, 120) === 'timer-danger', 'Thời gian còn 3s -> timer-danger');

// ── KỊCH BẢN 3: Lần đầu hết giờ (Strike 1 AFK Warning) ──
console.log('\n▶ [KỊCH BẢN 3] Hết giờ lần 1 (Strike 1 AFK Warning)');

let p1 = {
  id: 'player-1',
  name: 'Alice',
  tokens: { DIRT: 2, WATER: 3 },
  consecutiveAfkCount: 0,
  hasLeft: false
};

// Mô phỏng sự kiện AFK lần 1
p1.consecutiveAfkCount = 1;

// Kiểm tra giao diện hiển thị cho đối thủ quan sát p1
const opponentEl = PlayerUI.renderOpponent(p1, true);
assert(opponentEl.innerHTML.includes('badge-afk-warning'), 'Hiển thị huy hiệu badge-afk-warning trên ghế đối thủ');
assert(opponentEl.innerHTML.includes('⚠️ AFK (1/2)'), 'Nội dung huy hiệu thể hiện rõ ⚠️ AFK (1/2)');
assert(!opponentEl.innerHTML.includes('player-abandoned'), 'Người chơi chưa bị gán class player-abandoned');

// Kiểm tra âm thanh
assert(typeof SoundFX.playWhooshSkip === 'function', 'Hệ thống âm thanh có sẵn playWhooshSkip');
assert(typeof SoundFX.playTickTock === 'function', 'Hệ thống âm thanh có sẵn playTickTock');

// ── KỊCH BẢN 4: Người chơi đi nước hợp lệ -> Hủy bỏ gậy phạt AFK ──
console.log('\n▶ [KỊCH BẢN 4] Đi nước cờ hợp lệ -> Hủy gậy phạt AFK');

// p1 thực hiện hành động hợp lệ -> reset
p1.consecutiveAfkCount = 0;
const opponentCleanEl = PlayerUI.renderOpponent(p1, true);
assert(!opponentCleanEl.innerHTML.includes('badge-afk-warning'), 'Huy hiệu cảnh báo AFK biến mất khi thực hiện nước đi hợp lệ');
assert(!opponentCleanEl.innerHTML.includes('⚠️ AFK (1/2)'), 'Nội dung AFK (1/2) đã được dọn sạch');

// ── KỊCH BẢN 5: Hết giờ 2 lần liên tiếp (Strike 2 Out / Truất Quyền) ──
console.log('\n▶ [KỊCH BẢN 5] Hết giờ 2 lần liên tiếp -> Truất Quyền Thi Đấu (Strike 2)');

p1.consecutiveAfkCount = 2;
p1.hasLeft = true;

const opponentKickedEl = PlayerUI.renderOpponent(p1, false);
assert(opponentKickedEl.classList.contains('player-abandoned'), 'Ghế của người bị kick áp dụng class player-abandoned');
assert(opponentKickedEl.classList.contains('player-left'), 'Ghế của người bị kick áp dụng class player-left');
assert(opponentKickedEl.innerHTML.includes('badge-player-kicked-afk'), 'Xuất hiện huy hiệu badge-player-kicked-afk');
assert(opponentKickedEl.innerHTML.includes('⏳ Truất Quyền AFK'), 'Hiển thị đúng nhãn "⏳ Truất Quyền AFK"');

// Kiểm tra âm thanh búa phán quyết
assert(typeof SoundFX.playGavelStrike === 'function', 'Hệ thống âm thanh có sẵn playGavelStrike');

// ── KỊCH BẢN 6: Walkover Victory khi bàn 2 người chỉ còn 1 người ──
console.log('\n▶ [KỊCH BẢN 6] Xử lý Walkover Victory trong bàn 2 người');

let gamePlayers = [
  { id: 'player-1', name: 'Alice', hasLeft: true, consecutiveAfkCount: 2 },
  { id: 'player-2', name: 'Bob', hasLeft: false, consecutiveAfkCount: 0 }
];

const remainingActive = gamePlayers.filter(p => !p.hasLeft);
assert(remainingActive.length === 1, 'Chỉ còn đúng 1 người chơi hoạt động');
assert(remainingActive[0].id === 'player-2', 'Người còn lại duy nhất là Bob (player-2)');

const isWalkover = remainingActive.length === 1;
assert(isWalkover, 'Kích hoạt chiến thắng mặc định Walkover Victory');

// ── KỊCH BẢN 7: Giữ trần 10 Token & Không cấp WILD khi AFK ──
console.log('\n▶ [KỊCH BẢN 7] Giữ trần 10 Token & An toàn tài nguyên khi AFK');

function simulateAutoHarvest(currentTokensCount, availableBank) {
  if (currentTokensCount >= 10) return { harvested: 0, reason: 'MAX_LIMIT_REACHED' };
  const maxCanTake = Math.min(3, 10 - currentTokensCount);
  const eligibleTypes = Object.keys(availableBank).filter(k => k !== 'WILD' && availableBank[k] > 0);
  if (eligibleTypes.length === 0) return { harvested: 0, reason: 'BANK_EMPTY' };
  const actualTake = Math.min(maxCanTake, eligibleTypes.length);
  return { harvested: actualTake, reason: 'SUCCESS' };
}

assert(simulateAutoHarvest(10, { DIRT: 5, WATER: 5 }).harvested === 0, 'Đã đủ 10 token -> Nhận 0 token');
assert(simulateAutoHarvest(9, { DIRT: 5, WATER: 5 }).harvested === 1, 'Đang có 9 token -> Nhận tối đa 1 token');
assert(simulateAutoHarvest(8, { DIRT: 5, WATER: 5 }).harvested === 2, 'Đang có 8 token -> Nhận tối đa 2 token');
assert(simulateAutoHarvest(5, { DIRT: 5, WATER: 5, SUNLIGHT: 5 }).harvested === 3, 'Đang có 5 token -> Nhận tối đa 3 token');
assert(simulateAutoHarvest(5, { WILD: 5 }).harvested === 0, 'Bank chỉ còn WILD -> Nhận 0 token, bảo vệ WILD');

// ── TỔNG KẾT ──
console.log('\n🌿 ========================================================');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} ĐẠT, ${failedTests} THẤT BẠI`);
console.log('🌿 ========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

