/**
 * GARDEN EMPIRE — GAME BOARD TURN TIMER & AFK UI TEST SUITE
 * Kiểm thử tự động giao diện thanh thời gian lượt đi, cảnh báo AFK và modal truất quyền (Phase 16 - Giai đoạn 4)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
console.log('🧪 TEST SUITE: GAME BOARD TURN TIMER & AFK VISUALS (PHASE 4)');
console.log('🌿 ========================================================\n');

// ── PHẦN 1: Kiểm Tra Cấu Trúc HTML client/game.html ──
console.log('▶ [PHẦN 1] Cấu Trúc HTML client/game.html');
const gameHtml = fs.readFileSync(path.join(rootDir, 'client', 'game.html'), 'utf8');

assert(gameHtml.includes('id="turn-indicator-banner"'), 'Có banner lượt đấu #turn-indicator-banner');
assert(gameHtml.includes('id="turn-timer-badge"'), 'Có huy hiệu đếm ngược #turn-timer-badge');
assert(gameHtml.includes('id="turn-countdown-text"'), 'Có nhãn hiển thị số giây #turn-countdown-text');
assert(gameHtml.includes('id="turn-timer-track"'), 'Có thanh track tiến trình thời gian #turn-timer-track');
assert(gameHtml.includes('id="turn-timer-fill"'), 'Có thanh fill thời gian #turn-timer-fill');
assert(gameHtml.includes('tabular-nums'), 'Huy hiệu đếm ngược có áp dụng class tabular-nums');
assert(gameHtml.includes('id="afk-kicked-modal"'), 'Có modal thông báo truất quyền #afk-kicked-modal');
assert(gameHtml.includes('id="btn-afk-return-lobby"'), 'Có nút quay về sảnh #btn-afk-return-lobby');

// ── PHẦN 2: Kiểm Tra Quy Tắc CSS client/css/game.css ──
console.log('\n▶ [PHẦN 2] Quy Tắc CSS client/css/game.css');
const gameCss = fs.readFileSync(path.join(rootDir, 'client', 'css', 'game.css'), 'utf8');

assert(gameCss.includes('.turn-timer-badge'), 'CSS có định dạng cho .turn-timer-badge');
assert(gameCss.includes('tabular-nums'), 'CSS có quy định tabular-nums cho đồng hồ đếm ngược');
assert(gameCss.includes('.turn-timer-progress-track'), 'CSS có định dạng .turn-timer-progress-track');
assert(gameCss.includes('.turn-timer-progress-fill'), 'CSS có định dạng .turn-timer-progress-fill');
assert(gameCss.includes('.timer-safe'), 'CSS có trạng thái an toàn .timer-safe (#10b981)');
assert(gameCss.includes('.timer-warning'), 'CSS có trạng thái cảnh báo .timer-warning (#f59e0b)');
assert(gameCss.includes('.timer-danger'), 'CSS có trạng thái khẩn cấp .timer-danger (#ef4444)');
assert(gameCss.includes('charles-pulse-urgent'), 'CSS có animation charles-pulse-urgent nhịp tim khẩn cấp');
assert(gameCss.includes('.badge-afk-warning'), 'CSS có định dạng huy hiệu cảnh báo .badge-afk-warning');
assert(gameCss.includes('.badge-player-kicked-afk'), 'CSS có định dạng huy hiệu truất quyền .badge-player-kicked-afk');
assert(gameCss.includes('.afk-modal-card'), 'CSS có định dạng modal .afk-modal-card');

// ── PHẦN 3: Kiểm Tra Client Model GameState & Player ──
console.log('\n▶ [PHẦN 3] Client Model GameState.js & Player.js');
const gameStateJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'game', 'GameState.js'), 'utf8');
const playerJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'game', 'Player.js'), 'utf8');

assert(gameStateJs.includes('this.turnStartTime = 0;'), 'GameState khởi tạo turnStartTime = 0');
assert(gameStateJs.includes('this.turnDurationSeconds = 60;'), 'GameState khởi tạo turnDurationSeconds = 60');
assert(gameStateJs.includes('this.turnStartTime = Number(dto.turnStartTime)'), 'GameState updateFromDto cập nhật turnStartTime');
assert(gameStateJs.includes('this.turnDurationSeconds = Number(dto.turnDurationSeconds)'), 'GameState updateFromDto cập nhật turnDurationSeconds');

assert(playerJs.includes('this.consecutiveAfkCount = 0;'), 'Player khởi tạo consecutiveAfkCount = 0');
assert(playerJs.includes('this.totalAfkCount = 0;'), 'Player khởi tạo totalAfkCount = 0');

// ── PHẦN 4: Kiểm Tra Âm Thanh SoundFX.js ──
console.log('\n▶ [PHẦN 4] Âm Thanh Tương Tác SoundFX.js');
const soundFxJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'SoundFX.js'), 'utf8');

assert(soundFxJs.includes('playTickTock('), 'SoundFX có hàm playTickTock cho nhịp tim đếm ngược');
assert(soundFxJs.includes('playWhooshSkip('), 'SoundFX có hàm playWhooshSkip cho lượt tự động bỏ qua');
assert(soundFxJs.includes('playGavelStrike('), 'SoundFX có hàm playGavelStrike cho búa phán quyết truất quyền');

// ── PHẦN 5: Kiểm Tra Logic Hiển Thị PlayerUI.js ──
console.log('\n▶ [PHẦN 5] Logic Hiển Thị PlayerUI.js');
const playerUiJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'PlayerUI.js'), 'utf8');

assert(playerUiJs.includes('player.consecutiveAfkCount === 1'), 'PlayerUI kiểm tra cảnh báo AFK 1/2 cho người chơi hiện tại');
assert(playerUiJs.includes('badge-afk-warning'), 'PlayerUI sinh huy hiệu badge-afk-warning');
assert(playerUiJs.includes('badge-player-kicked-afk'), 'PlayerUI sinh huy hiệu badge-player-kicked-afk cho đối thủ bị kick');
assert(playerUiJs.includes('⏳ Truất Quyền AFK'), 'PlayerUI hiển thị nhãn "Truất Quyền AFK"');

// ── PHẦN 6: Kiểm Tra Logic BoardUI.js ──
console.log('\n▶ [PHẦN 6] Logic Bộ Đếm & Socket BoardUI.js');
const boardUiJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'BoardUI.js'), 'utf8');

assert(boardUiJs.includes('startTurnTimer()'), 'BoardUI có phương thức startTurnTimer');
assert(boardUiJs.includes('stopTurnTimer()'), 'BoardUI có phương thức stopTurnTimer');
assert(boardUiJs.includes('updateTurnTimerUI()'), 'BoardUI có phương thức updateTurnTimerUI');
assert(boardUiJs.includes('showAfkKickedModal()'), 'BoardUI có phương thức showAfkKickedModal');
assert(boardUiJs.includes("message.type === 'AFK_TIMEOUT_WARNING'"), 'BoardUI xử lý socket event AFK_TIMEOUT_WARNING');
assert(boardUiJs.includes("message.type === 'PLAYER_KICKED_AFK'"), 'BoardUI xử lý socket event PLAYER_KICKED_AFK');
assert(boardUiJs.includes('btn-afk-return-lobby'), 'BoardUI gắn sự kiện quay về sảnh cho btn-afk-return-lobby');
assert(boardUiJs.includes('SoundFX.playTickTock'), 'BoardUI phát âm thanh playTickTock khi <= 10s');
assert(boardUiJs.includes('SoundFX.playWhooshSkip'), 'BoardUI phát âm thanh playWhooshSkip khi bị cảnh báo timeout');
assert(boardUiJs.includes('SoundFX.playGavelStrike'), 'BoardUI phát âm thanh playGavelStrike khi bị kick');

// ── PHẦN 7: Mô Phỏng Tính Toán Thời Gian & Định Dạng MM:SS ──
console.log('\n▶ [PHẦN 7] Thuật Toán Định Dạng Thời Gian Đếm Ngược');
function formatCountdown(wholeSeconds) {
  if (wholeSeconds >= 60) {
    const m = Math.floor(wholeSeconds / 60);
    const s = String(wholeSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }
  return `${wholeSeconds}s`;
}

assert(formatCountdown(300) === '5:00', 'Định dạng 300s đúng thành 5:00');
assert(formatCountdown(120) === '2:00', 'Định dạng 120s đúng thành 2:00');
assert(formatCountdown(65) === '1:05', 'Định dạng 65s đúng thành 1:05');
assert(formatCountdown(60) === '1:00', 'Định dạng 60s đúng thành 1:00');
assert(formatCountdown(59) === '59s', 'Định dạng 59s đúng thành 59s');
assert(formatCountdown(10) === '10s', 'Định dạng 10s đúng thành 10s');
assert(formatCountdown(0) === '0s', 'Định dạng 0s đúng thành 0s');

// ── TỔNG KẾT ──
console.log('\n🌿 ========================================================');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} ĐẠT, ${failedTests} THẤT BẠI`);
console.log('🌿 ========================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
