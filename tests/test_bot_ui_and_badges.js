/**
 * GARDEN EMPIRE — BOT UI & BADGES TEST SUITE
 * Kiểm thử toàn diện giao diện hiển thị cho người chơi Bot:
 * - Huy hiệu 🤖 TRỢ LÝ BOT trên thanh điều khiển người chơi (Current Player Bar)
 * - Huy hiệu 🤖 BOT trên khung thẻ đối thủ (Opponent Cards)
 * - Hiển thị kết hợp linh hoạt: Host + Bot, Active Turn + Bot
 * - Phân biệt rành mạch giữa Bot, Người rời bàn (hasLeft) và Người bị truất quyền AFK (isAfkKicked)
 * - Xử lý thông báo tiếp quản ván đấu BOT_TAKEOVER
 * - Tuân thủ tuyệt đối quy tắc Anti-slop (Zero em-dash)
 */

import { PlayerUI } from '../client/js/ui/PlayerUI.js';
import { Player } from '../client/js/game/Player.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? ': ' + details : ''}`);
    failedTests++;
  }
}

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

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: BOT UI BADGES & VISUAL AFFORDANCES');
console.log('🌿 ========================================================\n');

// =============================================================================
// PHẦN 1: THANH ĐIỀU KHIỂN BẢN THÂN KHI ĐƯỢC BOT ĐIỀU KHIỂN (CURRENT PLAYER)
// =============================================================================
console.log('▶ [PHẦN 1] Hiển Thị Huy Hiệu Bot Trên Thanh Điều Khiển Bản Thân');

{
  // Test 1.1: Người chơi bình thường (không phải Bot)
  const humanPlayer = new Player('p1', 'Alice', true);
  PlayerUI.renderCurrentPlayer(null, humanPlayer);

  const roleEl = document.getElementById('my-player-role');
  assert(roleEl.textContent === 'Chủ Vườn', 'Người chơi người thật hiển thị đúng vai trò Chủ Vườn');
  assert(!roleEl.innerHTML.includes('badge-bot'), 'Người thật không có huy hiệu badge-bot');

  // Test 1.2: Người chơi được Bot điều khiển (isBot = true)
  const botPlayer = new Player('p2', 'Bot-Gia Định', false);
  botPlayer.isBot = true;
  PlayerUI.renderCurrentPlayer(null, botPlayer);

  assert(roleEl.innerHTML.includes('badge-bot'), 'Bot player phải render thẻ badge-bot');
  assert(roleEl.innerHTML.includes('🤖 TRỢ LÝ BOT'), 'Hiển thị chính xác text 🤖 TRỢ LÝ BOT');

  // Test 1.3: Hỗ trợ trường bot theo định dạng backend serializer
  const botCompatPlayer = { id: 'p3', name: 'Bot-Thăng Long', bot: true, prestigePoints: 5 };
  PlayerUI.renderCurrentPlayer(null, botCompatPlayer);

  assert(roleEl.innerHTML.includes('badge-bot'), 'Hỗ trợ thuộc tính bot (Jackson compatibility)');
}

// =============================================================================
// PHẦN 2: KHUNG ĐỐI THỦ LÀ BOT (OPPONENT CARD RENDERING)
// =============================================================================
console.log('\n▶ [PHẦN 2] Hiển Thị Huy Hiệu Bot Trên Khung Đối Thủ');

{
  const container = createMockElement('div');

  // Test 2.1: Đối thủ là Bot
  const opponentBot = {
    id: 'bot-1',
    name: 'Bot-Hoa Lư',
    isBot: true,
    isHost: false,
    prestigePoints: 7,
    tokens: { DIRT: 2, WATER: 1, SUNLIGHT: 0, SEED: 3, NUTRIENTS: 1, WILD: 1 },
    bonuses: { DIRT: 1, WATER: 0, SUNLIGHT: 2, SEED: 0, NUTRIENTS: 0 },
    purchasedCards: [{}, {}, {}],
    reservedCards: [{}],
    visitors: []
  };

  const cardEl = PlayerUI.renderOpponent(opponentBot, false);
  assert(cardEl !== null, 'Phải tạo thành công phần tử DOM card đối thủ');

  const cardHtml = cardEl.innerHTML;
  assert(cardHtml.includes('badge-bot'), 'Khung đối thủ Bot phải chứa class badge-bot');
  assert(cardHtml.includes('🤖 BOT'), 'Khung đối thủ hiển thị nhãn 🤖 BOT');
  assert(cardHtml.includes('Bot-Hoa Lư'), 'Hiển thị đúng tên của Bot');
  assert(cardHtml.includes('★ 7'), 'Hiển thị đúng số Điểm Uy Tín của Bot');

  // Test 2.2: Đối thủ Bot đang đến lượt đi (active turn)
  const activeCard = PlayerUI.renderOpponent(opponentBot, true);
  assert(activeCard.classList.contains('active-turn'), 'Card của Bot phải có class active-turn khi tới lượt');

  // Test 2.3: Đối thủ Bot là Chủ Phòng (Host + Bot)
  const hostBot = { ...opponentBot, isHost: true };
  const hostCard = PlayerUI.renderOpponent(hostBot, false);
  const hostHtml = hostCard.innerHTML;
  assert(hostHtml.includes('👑'), 'Bot làm chủ phòng vẫn hiển thị vương miện 👑');
  assert(hostHtml.includes('badge-bot'), 'Vẫn giữ huy hiệu badge-bot');
}

// =============================================================================
// PHẦN 3: PHÂN BIỆT RÀNH MẠCH TRẠNG THÁI BOT VÀ RỜI BÀN (EDGE CASES)
// =============================================================================
console.log('\n▶ [PHẦN 3] Phân Biệt Rành Mạch Bot, Rời Bàn & Bị Truất Quyền AFK');

{
  // Test 3.1: Đối thủ người thật đã rời bàn
  const leftPlayer = {
    id: 'p-left',
    name: 'Người Rời Đi',
    hasLeft: true,
    isBot: false,
    prestigePoints: 4,
    tokens: {},
    bonuses: {},
    purchasedCards: [],
    reservedCards: [],
    visitors: []
  };
  const leftCard = PlayerUI.renderOpponent(leftPlayer, false);
  assert(leftCard.innerHTML.includes('🍂 Đã Rời Ván'), 'Người rời bàn hiển thị badge 🍂 Đã Rời Ván');
  assert(!leftCard.innerHTML.includes('badge-bot'), 'Người rời bàn bình thường không gắn badge bot');

  // Test 3.2: Đối thủ người thật bị truất quyền vì 2 gậy AFK
  const afkKickedPlayer = {
    ...leftPlayer,
    consecutiveAfkCount: 2
  };
  const kickedCard = PlayerUI.renderOpponent(afkKickedPlayer, false);
  assert(kickedCard.innerHTML.includes('⏳ Truất Quyền AFK'), 'Bị 2 gậy AFK hiển thị badge ⏳ Truất Quyền AFK');

  // Test 3.3: Đối thủ được Bot tiếp quản thành công (hasLeft = false, isBot = true)
  const takenOverPlayer = {
    id: 'p-takeover',
    name: 'Bob (🤖 Bot)',
    hasLeft: false,
    isBot: true,
    prestigePoints: 6,
    tokens: { DIRT: 2, WILD: 1 },
    bonuses: { WATER: 1 },
    purchasedCards: [{}],
    reservedCards: [{}],
    visitors: []
  };
  const takenOverCard = PlayerUI.renderOpponent(takenOverPlayer, false);
  const takenOverHtml = takenOverCard.innerHTML;
  assert(takenOverHtml.includes('badge-bot'), 'Người được Bot tiếp quản phải có badge-bot');
  assert(!takenOverHtml.includes('🍂 Đã Rời Ván'), 'Không được hiển thị Đã Rời Ván vì ván đấu vẫn đang tiếp tục');
  assert(!takenOverHtml.includes('⏳ Truất Quyền AFK'), 'Không được hiển thị Truất Quyền AFK');
}

// =============================================================================
// PHẦN 4: TUÂN THỦ QUY TẮC ANTI-SLOP (ZERO EM-DASH)
// =============================================================================
console.log('\n▶ [PHẦN 4] Kiểm Thử Chuẩn Design Craft Anti-Slop (Zero Em-Dash)');

{
  const sampleBot = {
    id: 'bot-check',
    name: 'Bot-Kiểm Thử',
    isBot: true,
    prestigePoints: 10,
    tokens: { DIRT: 1, WATER: 2, SUNLIGHT: 3, SEED: 1, NUTRIENTS: 2, WILD: 1 },
    bonuses: { DIRT: 1, WATER: 1, SUNLIGHT: 1, SEED: 1, NUTRIENTS: 1 },
    purchasedCards: [{}, {}],
    reservedCards: [{}],
    visitors: []
  };

  const checkCard = PlayerUI.renderOpponent(sampleBot, false);
  const html = checkCard.innerHTML;

  const emDashCount = (html.match(/—/g) || []).length;
  assert(emDashCount === 0, 'Giao diện hiển thị Bot không được chứa ký tự em-dash (—)');
}

// =============================================================================
// TỔNG KẾT BỘ TEST
// =============================================================================
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ BOT UI: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${passedTests + failedTests})`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
