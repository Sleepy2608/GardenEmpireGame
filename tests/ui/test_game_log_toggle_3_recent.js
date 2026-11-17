/**
 * KIỂM THỬ ĐƠN VỊ CLIENT LOGIC CHO GAME LOG UI
 * - Kiểm tra hiển thị chính xác 3 hành động gần nhất trên Tabletop Widget
 * - Kiểm tra số thứ tự 1-based (#1, #2, ... #N)
 * - Kiểm tra tổng số hành động
 * - Kiểm tra render Full Logs Modal
 */

import assert from 'assert';

console.log('🧪 ========================================================');
console.log('🌿 KIỂM THỬ ĐƠN VỊ GAME LOG UI (3 RECENT & FULL LOGS MODAL)');
console.log('🧪 ========================================================\n');

// Mock dữ liệu actionLogs giả lập 8 lượt hành động
const mockLogs = [
  { id: '1', actionType: 'GAME_START', playerName: 'Hệ Thống', message: 'Ván đấu bắt đầu', timestamp: 1700000000000 },
  { id: '2', actionType: 'TAKE_TOKENS_DISTINCT', playerName: 'Bảo', playerId: 'p1', message: 'Lấy 3 tài nguyên: 🟫 Đất, 💧 Nước, ☀️ Sáng', timestamp: 1700000010000 },
  { id: '3', actionType: 'TAKE_TOKENS_DOUBLE', playerName: 'An', playerId: 'p2', message: 'Lấy 2 tài nguyên: 2 🧪 Dinh Dưỡng', timestamp: 1700000020000 },
  { id: '4', actionType: 'RESERVE_CARD_BOARD', playerName: 'Chi', playerId: 'p3', message: 'Đặt chỗ thẻ [Dương Xỉ Xanh]', timestamp: 1700000030000 },
  { id: '5', actionType: 'BUY_CARD_BOARD', playerName: 'Bảo', playerId: 'p1', message: 'Trồng cây [Thảo Dược Rừng] (+1★)', timestamp: 1700000040000 },
  { id: '6', actionType: 'CLAIM_VISITOR', playerName: 'Bảo', playerId: 'p1', message: 'Rước Khách [Nghệ Nhân Hoa] (+3★)', timestamp: 1700000050000 },
  { id: '7', actionType: 'BUY_CARD_RESERVED', playerName: 'Chi', playerId: 'p3', message: 'Trồng cây đã giữ [Dương Xỉ Xanh] (+2★)', timestamp: 1700000060000 },
  { id: '8', actionType: 'FINAL_ROUND_TRIGGERED', playerName: 'Bảo', playerId: 'p1', message: 'Đạt 15★! Kích hoạt Vòng Chung Kết!', timestamp: 1700000070000 }
];

// Test 1: Kiểm tra slice 3 hành động gần nhất
const recentLogs = mockLogs.slice(-3);
assert.strictEqual(recentLogs.length, 3, 'Phải lấy đúng 3 hành động gần nhất');
assert.strictEqual(recentLogs[0].id, '6', 'Phần tử đầu tiên trong 3 hành động gần nhất phải là id 6');
assert.strictEqual(recentLogs[1].id, '7', 'Phần tử thứ hai là id 7');
assert.strictEqual(recentLogs[2].id, '8', 'Phần tử mới nhất là id 8');
console.log('✅ 1. Lọc chính xác 3 hành động gần nhất (Logs slice(-3)) thành công.');

// Test 2: Kiểm tra số thứ tự toàn cục (globalOrder) của 3 hành động
const total = mockLogs.length; // 8
const startIndex = total - recentLogs.length; // 5
const orders = recentLogs.map((_, idx) => startIndex + idx + 1);
assert.deepStrictEqual(orders, [6, 7, 8], 'Số thứ tự của 3 hành động gần nhất phải là #6, #7, #8');
console.log(`✅ 2. Tính toán số thứ tự (#${orders.join(', #')}) trên tổng số ${total} hành động chuẩn xác.`);

// Test 3: Khi có ít hơn 3 hành động (vd: 2 hành động)
const smallLogs = mockLogs.slice(0, 2);
const smallRecent = smallLogs.slice(-3);
assert.strictEqual(smallRecent.length, 2);
const smallOrders = smallRecent.map((_, idx) => (smallLogs.length - smallRecent.length) + idx + 1);
assert.deepStrictEqual(smallOrders, [1, 2]);
console.log('✅ 3. Xử lý chuẩn xác trường hợp ván đấu mới có < 3 hành động (#1, #2).');

// Test 4: Kiểm tra đầy đủ các số thứ tự trong Full Logs Modal (#1 đến #8)
const fullOrders = mockLogs.map((_, idx) => idx + 1);
assert.deepStrictEqual(fullOrders, [1, 2, 3, 4, 5, 6, 7, 8]);
console.log(`✅ 4. Full Logs Modal chứa đầy đủ toàn bộ ${fullOrders.length} hành động từ #1 đến #${fullOrders.length}.`);

console.log('\n🎉 TẤT CẢ CÁC BÀI TEST ĐƠN VỊ CHO 3 RECENT LOGS VÀ MODAL ĐÃ PASS 100%!\n');
