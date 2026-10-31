/**
 * GARDEN EMPIRE — PLAYER BOX UI & OPPONENTS TEST SUITE
 * Kiểm thử tự động component PlayerUI.renderOpponent & PlayerUI.renderTabletopSeats
 * Phủ Happy Path, Biên (Boundary), Active Turn, Responsive Classes & Tabletop Seating.
 */

import { PlayerUI } from '../client/js/ui/PlayerUI.js';
import { ResourceUI } from '../client/js/ui/ResourceUI.js';

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

// Mock DOM elements
function createMockElement(tag) {
  let classes = new Set();
  let children = [];
  let html = '';
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
    set innerHTML(val) { html = val; },
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

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: PLAYERS\' BOX UI & OPPONENT TOKENS');
console.log('🌿 ========================================================\n');

// -----------------------------------------------------------------------------
// TEST CASE 1: Happy Path — Render đầy đủ 5 phân khu theo Wireframe Ảnh 2
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: Happy Path — Cấu trúc 5 phân khu chuẩn Wireframe');
{
  const opponent = {
    id: 'opp-1',
    name: 'LamEmTron',
    isHost: false,
    prestigePoints: 8,
    purchasedCards: new Array(10).fill({}),
    reservedCards: new Array(1).fill({}),
    tokens: { DIRT: 1, WATER: 2, SUNLIGHT: 1, SEED: 0, NUTRIENTS: 3, WILD: 1 },
    bonuses: { DIRT: 1, WATER: 2, SUNLIGHT: 3, SEED: 3, NUTRIENTS: 1 },
    visitors: [{ id: 'v_02', name: 'Bướm Alexandra' }]
  };

  const el = PlayerUI.renderOpponent(opponent, false);
  const html = el.innerHTML;

  assert(el.className.includes('opponent-card'), 'Thẻ mang class opponent-card');
  assert(!el.className.includes('active-turn'), 'Không có active-turn khi chưa tới lượt');
  assert(html.includes('player-box-header'), 'Phân khu 1 (Header): Có mặt');
  assert(html.includes('LamEmTron'), 'Tên người chơi hiển thị chính xác');
  assert(html.includes('★ 8'), 'Điểm số hiển thị đúng');
  assert(html.includes('player-box-section-trees'), 'Phân khu 2 (Cây): Có mặt');
  assert(html.includes('🌳 Cây:'), 'Nhãn Cây có icon 🌳');
  assert(html.includes('>10<'), 'Số cây đã trồng là 10');
  assert(html.includes('player-box-section-tokens'), 'Phân khu 3 (Tài nguyên): Có mặt');
  assert(html.includes('🪙 Tài nguyên:'), 'Nhãn Tài nguyên có icon 🪙');
  assert(html.includes('8 / 10'), 'Tổng số token tính đúng (1+2+1+0+3+1 = 8/10)');
  assert(html.includes('player-box-section-reserved'), 'Phân khu 4 (Giữ bài): Có mặt');
  assert(html.includes('1 / 3'), 'Số bài giữ chỗ hiển thị đúng (1 / 3)');
  assert(html.includes('player-box-section-visitors'), 'Phân khu 5 (Khách): Có mặt');
  assert(html.includes('🦋 Khách:'), 'Nhãn Khách có icon 🦋');
  assert(html.includes('Bướm Alexandra'), 'Khách rước về có badge linh vật');
}

// -----------------------------------------------------------------------------
// TEST CASE 2: Chi tiết 6 Token cầm tay & Phân biệt Trạng thái Dimmed
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Chi tiết 6 loại Token cầm tay & Dimmed khi = 0');
{
  const opponent = {
    id: 'opp-2',
    name: 'Gardener_Bob',
    isHost: true,
    prestigePoints: 4,
    purchasedCards: [],
    reservedCards: [],
    tokens: { DIRT: 2, WATER: 0, SUNLIGHT: 0, SEED: 3, NUTRIENTS: 0, WILD: 2 },
    bonuses: {},
    visitors: []
  };

  const el = PlayerUI.renderOpponent(opponent, true);
  const html = el.innerHTML;

  assert(el.className.includes('active-turn'), 'Active turn aura áp dụng khi isCurrentTurn = true');
  assert(html.includes('👑'), 'Host hiển thị vương miện 👑');
  assert(html.includes('7 / 10'), 'Tổng token tính chính xác: 2+0+0+3+0+2 = 7/10');
  assert(html.includes('badge-dirt'), 'Có chip Đất');
  assert(html.includes('badge-water'), 'Có chip Nước');
  assert(html.includes('badge-sunlight'), 'Có chip Ánh Sáng');
  assert(html.includes('badge-seed'), 'Có chip Hạt Giống');
  assert(html.includes('badge-nutrients'), 'Có chip Dinh Dưỡng');
  assert(html.includes('badge-wild'), 'Có chip Phân Bón Vàng');
  assert(html.includes('chip-empty'), 'Token có số lượng 0 có class chip-empty để mờ nhẹ');
}

// -----------------------------------------------------------------------------
// TEST CASE 3: Biên (Boundary) — 0 Token, 0 Cây, 0 Khách, 0 Giữ bài
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 3: Biên — Người chơi mới vào ván (Tất cả = 0)');
{
  const emptyPlayer = {
    id: 'opp-3',
    name: 'Newbie',
    prestigePoints: 0,
    purchasedCards: [],
    reservedCards: [],
    tokens: {},
    bonuses: {},
    visitors: []
  };

  const el = PlayerUI.renderOpponent(emptyPlayer, false);
  const html = el.innerHTML;

  assert(html.includes('★ 0'), 'Điểm ban đầu là 0');
  assert(html.includes('>0<'), 'Số cây ban đầu là 0');
  assert(html.includes('0 / 10'), 'Tài nguyên ban đầu là 0 / 10');
  assert(html.includes('0 / 3'), 'Giữ bài ban đầu là 0 / 3');
  assert(!html.includes('warning'), 'Không có cảnh báo vượt quá giới hạn token');
  assert(!html.includes('reserved-max'), 'Không có cảnh báo full bài giữ');
}

// -----------------------------------------------------------------------------
// TEST CASE 4: Biên Cực Đại — Vượt quá 10 Token & Full 3 Thẻ Giữ
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 4: Biên Cực Đại — 11 Token (> 10) & Full 3 Giữ Bài');
{
  const maxPlayer = {
    id: 'opp-4',
    name: 'Hoarder_Player',
    prestigePoints: 15,
    purchasedCards: new Array(15).fill({}),
    reservedCards: new Array(3).fill({}),
    tokens: { DIRT: 3, WATER: 3, SUNLIGHT: 2, SEED: 2, NUTRIENTS: 1, WILD: 0 }, // Tổng 11
    bonuses: { DIRT: 2, WATER: 2, SUNLIGHT: 2, SEED: 2, NUTRIENTS: 2 },
    visitors: [{ id: 'v_01', name: 'Ong Chúa' }]
  };

  const el = PlayerUI.renderOpponent(maxPlayer, false);
  const html = el.innerHTML;

  assert(html.includes('11 / 10'), 'Tổng token vượt mốc: 11 / 10');
  assert(html.includes('warning'), 'Class warning xuất hiện khi token > 10');
  assert(html.includes('3 / 3'), 'Giữ bài đạt tối đa: 3 / 3');
  assert(html.includes('reserved-max'), 'Class reserved-max xuất hiện khi giữ đủ 3 thẻ');
  assert(html.includes('★ 15'), 'Điểm số chạm mốc 15 chiến thắng');
}

// -----------------------------------------------------------------------------
// TEST CASE 5: Sắp Xếp Ghế Trên Bàn Chơi (renderTabletopSeats: 2, 3, 4 người)
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 5: Bố cục ghế quanh bàn (renderTabletopSeats: 2, 3, 4 người)');
{
  const seatTop = global.document.getElementById('seat-top');
  const seatLeft = global.document.getElementById('seat-left');
  const seatRight = global.document.getElementById('seat-right');

  const p1 = { id: 'p1', name: 'Opp1', tokens: {}, bonuses: {} };
  const p2 = { id: 'p2', name: 'Opp2', tokens: {}, bonuses: {} };
  const p3 = { id: 'p3', name: 'Opp3', tokens: {}, bonuses: {} };

  // Ván 2 người: 1 đối thủ duy nhất ở seat-top
  PlayerUI.renderTabletopSeats([p1], 'p1');
  assert(!seatTop.classList.contains('hidden'), 'Ván 2 người: seat-top hiển thị');
  assert(seatLeft.classList.contains('hidden'), 'Ván 2 người: seat-left ẩn');
  assert(seatRight.classList.contains('hidden'), 'Ván 2 người: seat-right ẩn');

  // Ván 3 người: 2 đối thủ ở seat-left & seat-right
  PlayerUI.renderTabletopSeats([p1, p2], 'p2');
  assert(seatTop.classList.contains('hidden'), 'Ván 3 người: seat-top ẩn');
  assert(!seatLeft.classList.contains('hidden'), 'Ván 3 người: seat-left hiển thị');
  assert(!seatRight.classList.contains('hidden'), 'Ván 3 người: seat-right hiển thị');

  // Ván 4 người: 3 đối thủ ở cả 3 ghế
  PlayerUI.renderTabletopSeats([p1, p2, p3], 'p3');
  assert(!seatTop.classList.contains('hidden'), 'Ván 4 người: seat-top hiển thị');
  assert(!seatLeft.classList.contains('hidden'), 'Ván 4 người: seat-left hiển thị');
  assert(!seatRight.classList.contains('hidden'), 'Ván 4 người: seat-right hiển thị');
}

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} PASS / ${failedTests} FAIL`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

