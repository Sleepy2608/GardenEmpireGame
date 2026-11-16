/**
 * GARDEN EMPIRE — MUSIC & BGM INTEGRATION TEST SUITE (PHASE 3)
 * Kiểm thử tích hợp hệ thống âm thanh, BGMController vào HTML và các UI controller
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
console.log('🧪 TEST SUITE: MUSIC & BGM INTEGRATION (PHASE 3)');
console.log('🌿 ========================================================\n');

// ── PHẦN 1: Tích Hợp HTML & Audio Tag ──
console.log('▶ [PHẦN 1] Cấu Trúc HTML Các Trang (Audio Player & Sound Toggle)');
const welcomeHtml = fs.readFileSync(path.join(rootDir, 'client', 'welcome.html'), 'utf8');
const lobbyHtml = fs.readFileSync(path.join(rootDir, 'client', 'lobby.html'), 'utf8');
const waitingRoomHtml = fs.readFileSync(path.join(rootDir, 'client', 'waiting-room.html'), 'utf8');
const gameHtml = fs.readFileSync(path.join(rootDir, 'client', 'game.html'), 'utf8');

assert(welcomeHtml.includes('id="bgm-player"'), 'welcome.html có thẻ #bgm-player');
assert(welcomeHtml.includes('id="btn-toggle-sound"'), 'welcome.html có nút #btn-toggle-sound');
assert(welcomeHtml.includes('id="sound-icon"'), 'welcome.html có icon #sound-icon');
assert(welcomeHtml.includes('BGMController.js'), 'welcome.html import module BGMController');

assert(lobbyHtml.includes('id="bgm-player"'), 'lobby.html có thẻ #bgm-player');
assert(lobbyHtml.includes('id="btn-toggle-sound"'), 'lobby.html có nút #btn-toggle-sound');
assert(lobbyHtml.includes('id="sound-icon"'), 'lobby.html có icon #sound-icon');

assert(waitingRoomHtml.includes('id="bgm-player"'), 'waiting-room.html có thẻ #bgm-player');
assert(waitingRoomHtml.includes('id="btn-toggle-sound"'), 'waiting-room.html có nút #btn-toggle-sound');
assert(waitingRoomHtml.includes('id="sound-icon"'), 'waiting-room.html có icon #sound-icon');

assert(gameHtml.includes('id="bgm-player"'), 'game.html có thẻ #bgm-player');
assert(gameHtml.includes('id="btn-toggle-sound"'), 'game.html có nút #btn-toggle-sound');
assert(gameHtml.includes('id="sound-icon"'), 'game.html có icon #sound-icon');

// ── PHẦN 2: Tích Hợp BoardUI.js ──
console.log('\n▶ [PHẦN 2] Tích Hợp BGM Trên Bàn Đấu BoardUI.js');
const boardUiJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'BoardUI.js'), 'utf8');

assert(boardUiJs.includes("from './BGMController.js'"), 'BoardUI.js import BGMController');
assert(boardUiJs.includes('BGM_PHASES.GAME_NORMAL'), 'BoardUI khởi tạo BGM với phase GAME_NORMAL');
assert(boardUiJs.includes('BGM_PHASES.GAME_FINAL'), 'BoardUI chuyển BGM sang GAME_FINAL khi vòng chung kết');
assert(boardUiJs.includes('bgmController.toggleMute()'), 'BoardUI đồng bộ mute BGM khi click #btn-toggle-sound');
assert(boardUiJs.includes('bgmController.duck(0.05)'), 'BoardUI duck BGM khi đồng hồ lượt đi <= 10s');
assert(boardUiJs.includes('bgmController.unduck()'), 'BoardUI unduck BGM khi đồng hồ dừng');
assert(boardUiJs.includes('bgmController.pause()'), 'BoardUI pause BGM trước khi phát Victory Sound');

// ── PHẦN 3: Tích Hợp LobbyUI & WaitingRoomUI ──
console.log('\n▶ [PHẦN 3] Tích Hợp BGM Trên LobbyUI.js & WaitingRoomUI.js');
const lobbyUiJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'LobbyUI.js'), 'utf8');
const wrUiJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'WaitingRoomUI.js'), 'utf8');

assert(lobbyUiJs.includes("from './BGMController.js'"), 'LobbyUI.js import BGMController');
assert(lobbyUiJs.includes('BGM_PHASES.LOBBY'), 'LobbyUI.js kích hoạt BGM phase LOBBY');
assert(lobbyUiJs.includes('bgmController.toggleMute()'), 'LobbyUI.js xử lý sự kiện toggle mute');

assert(wrUiJs.includes("from './BGMController.js'"), 'WaitingRoomUI.js import BGMController');
assert(wrUiJs.includes('BGM_PHASES.LOBBY'), 'WaitingRoomUI.js kích hoạt BGM phase LOBBY');
assert(wrUiJs.includes('bgmController.toggleMute()'), 'WaitingRoomUI.js xử lý sự kiện toggle mute');

// ── PHẦN 4: Tích Hợp SoundFX.js Fanfare & Mute Sync ──
console.log('\n▶ [PHẦN 4] Tích Hợp SoundFX.js Fanfare & Mute Sync');
const soundFxJs = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'SoundFX.js'), 'utf8');

assert(soundFxJs.includes('victory-fanfare.mp3'), 'SoundFX.js tích hợp tệp victory-fanfare.mp3');
assert(soundFxJs.includes('window.bgmController.toggleMute()'), 'SoundFX.toggleMute đồng bộ với bgmController');

// ── PHẦN 5: CSS Nút Âm Thanh ──
console.log('\n▶ [PHẦN 5] CSS Định Dạng Nút Âm Thanh');
const welcomeCss = fs.readFileSync(path.join(rootDir, 'client', 'css', 'welcome.css'), 'utf8');
assert(welcomeCss.includes('.welcome-btn-sound'), 'welcome.css có style .welcome-btn-sound');

console.log('\n🌿 ========================================================');
console.log(`🏁 KẾT QUẢ KIỂM THỬ TÍCH HỢP: ${passedTests} ĐẠT, ${failedTests} THẤT BẠI`);
console.log('🌿 ========================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
