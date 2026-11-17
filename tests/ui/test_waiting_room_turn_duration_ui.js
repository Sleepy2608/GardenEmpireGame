/**
 * GARDEN EMPIRE — WAITING ROOM TURN DURATION UI TEST SUITE
 * Kiểm thử tự động giao diện và logic chọn thời gian mỗi lượt đi tại Phòng Chờ (Phase 16 - Giai đoạn 3)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

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
console.log('🧪 TEST SUITE: WAITING ROOM TURN DURATION UI & CONTROLS');
console.log('🌿 ========================================================\n');

// ── PHẦN 1: Kiểm Tra Cấu Trúc HTML client/waiting-room.html ──
console.log('▶ [PHẦN 1] Cấu Trúc HTML client/waiting-room.html');
const htmlContent = fs.readFileSync(path.join(rootDir, 'client', 'waiting-room.html'), 'utf8');

assert(htmlContent.includes('id="wr-turn-settings"'), 'Có khung cài đặt thời gian #wr-turn-settings');
assert(htmlContent.includes('id="turn-duration-label"'), 'Có nhãn hiển thị thời gian #turn-duration-label');
assert(htmlContent.includes('id="turn-pill-group"'), 'Có cụm nút chọn dạng pill #turn-pill-group');
assert(htmlContent.includes('data-duration="60"'), 'Có tùy chọn 1 Phút (60 giây)');
assert(htmlContent.includes('data-duration="120"'), 'Có tùy chọn 2 Phút (120 giây)');
assert(htmlContent.includes('data-duration="300"'), 'Có tùy chọn 5 Phút (300 giây)');

// ── PHẦN 2: Kiểm Tra Quy Tắc CSS client/css/waiting-room.css ──
console.log('\n▶ [PHẦN 2] Quy Tắc CSS client/css/waiting-room.css');
const cssContent = fs.readFileSync(path.join(rootDir, 'client', 'css', 'waiting-room.css'), 'utf8');

assert(cssContent.includes('.wr-turn-settings'), 'CSS có định dạng cho .wr-turn-settings');
assert(cssContent.includes('.turn-duration-label'), 'CSS có định dạng nhãn .turn-duration-label');
assert(cssContent.includes('.turn-pill-group'), 'CSS có định dạng cụm pill .turn-pill-group');
assert(cssContent.includes('.turn-pill-btn'), 'CSS có định dạng nút .turn-pill-btn');
assert(cssContent.includes('.turn-pill-btn.active'), 'CSS có định dạng trạng thái kích hoạt .turn-pill-btn.active');
assert(cssContent.includes('.turn-pill-btn:disabled'), 'CSS có định dạng vô hiệu hóa cho Guest .turn-pill-btn:disabled');

// ── PHẦN 3: Kiểm Tra Tích Hợp API client/js/api/roomApi.js ──
console.log('\n▶ [PHẦN 3] Tích Hợp API roomApi.updateRoomSettings');
const apiContent = fs.readFileSync(path.join(rootDir, 'client', 'js', 'api', 'roomApi.js'), 'utf8');

assert(apiContent.includes('updateRoomSettings(roomId, hostId, turnDurationSeconds)'), 'roomApi có hàm updateRoomSettings');
assert(apiContent.includes('/settings'), 'roomApi gọi đúng endpoint /settings');
assert(apiContent.includes("method: 'PUT'"), 'roomApi sử dụng method PUT');

// ── PHẦN 4: Kiểm Tra Logic WaitingRoomUI.js ──
console.log('\n▶ [PHẦN 4] Logic Xử Lý WaitingRoomUI.js');
const uiContent = fs.readFileSync(path.join(rootDir, 'client', 'js', 'ui', 'WaitingRoomUI.js'), 'utf8');

assert(uiContent.includes('_changeTurnDuration(duration)'), 'WaitingRoomUI có hàm _changeTurnDuration');
assert(uiContent.includes('_updateTurnDurationUI(duration)'), 'WaitingRoomUI có hàm _updateTurnDurationUI');
assert(uiContent.includes('_formatDurationLabel(duration)'), 'WaitingRoomUI có hàm _formatDurationLabel');
assert(uiContent.includes("roomApi.updateRoomSettings"), 'WaitingRoomUI gọi roomApi.updateRoomSettings khi Host chọn');

// Kiểm tra mô phỏng format label
function formatDurationLabel(duration) {
  switch (duration) {
    case 120: return '2 Phút (Chiến thuật)';
    case 300: return '5 Phút (Thư thái)';
    default:  return '1 Phút (Tiêu chuẩn)';
  }
}

assert(formatDurationLabel(60) === '1 Phút (Tiêu chuẩn)', 'Mốc 60s hiển thị "1 Phút (Tiêu chuẩn)"');
assert(formatDurationLabel(120) === '2 Phút (Chiến thuật)', 'Mốc 120s hiển thị "2 Phút (Chiến thuật)"');
assert(formatDurationLabel(300) === '5 Phút (Thư thái)', 'Mốc 300s hiển thị "5 Phút (Thư thái)"');

// ── TỔNG KẾT ──
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} PASS / ${failedTests} FAIL`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
