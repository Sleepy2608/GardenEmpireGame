/**
 * Test Suite: Verification for Issue #15 — Boxes' player not flexible and collapse with the words
 * Framework: Node.js Native Runner
 * Quy chuẩn: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Giả lập môi trường DOM cơ bản cho Node.js
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
  getElementById: () => createMockElement('div')
};

const { PlayerUI } = await import('../client/js/ui/PlayerUI.js');

console.log('\n🌿 ========================================================');
console.log('🧪 VERIFICATION TEST: ISSUE #15 — PLAYER BOXES FLEXIBILITY & WORD COLLAPSE');
console.log('🌿 ========================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Chi tiết: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// Test Case 1: Backend Player host property mapping
// Jackson serializes boolean `isHost` to `host: true`
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: Host indicator trên Opponent Player Box');

runTest('Player box phải hiển thị vương miện 👑 khi backend trả về "host: true"', () => {
  const opponentFromBackend = {
    id: 'opp-host',
    name: 'Chủ Phòng',
    host: true, // Jackson field
    prestigePoints: 5,
    tokens: {},
    bonuses: {},
    purchasedCards: [],
    reservedCards: []
  };

  const card = PlayerUI.renderOpponent(opponentFromBackend, false);
  const html = card.innerHTML;

  assert.ok(html.includes('👑'), 'Host player phải có icon vương miện 👑 khi backend gửi host: true');
});

// -----------------------------------------------------------------------------
// Test Case 2: CSS Layout & Text Wrapping Rules for Player Boxes in game.css
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Kiểm tra CSS Rules chống sập/đè chữ (word collapse) trong game.css');

const cssContent = fs.readFileSync(path.resolve('./client/css/game.css'), 'utf-8');

runTest('game.css phải có CSS rule chống tràn và cắt chữ (ellipsis) cho #my-player-name / .player-meta h3', () => {
  const playerMetaMatch = cssContent.match(/\.player-meta\s*h3\s*\{([^}]+)\}/);
  assert.ok(playerMetaMatch, 'Phải tìm thấy CSS selector cho .player-meta h3');
  const rules = playerMetaMatch[1];
  
  const hasTextOverflow = rules.includes('text-overflow');
  const hasWhiteSpace = rules.includes('white-space');
  const hasOverflow = rules.includes('overflow');

  assert.ok(hasTextOverflow && hasWhiteSpace && hasOverflow, 
    'Tên người chơi trong .player-meta h3 phải có white-space: nowrap, overflow: hidden và text-overflow: ellipsis để không bị gãy dòng đè lên badge điểm');
});

runTest('game.css phải có CSS rule chống tràn chữ (overflow safety) trong .inventory-token-slot', () => {
  const slotMatch = cssContent.match(/\.inventory-token-slot\s*\{([^}]+)\}/);
  assert.ok(slotMatch, 'Phải tìm thấy CSS selector cho .inventory-token-slot');
  const rules = slotMatch[1];

  const hasMinW = rules.includes('min-width');
  assert.ok(hasMinW, '.inventory-token-slot phải có min-width: 0 để tránh vỡ flex/grid layout khi co giãn');
});

runTest('game.css phải có Responsive Breakpoints cho .player-master-dashboard trên màn hình nhỏ/vừa', () => {
  // Tìm xem có @media block nào bao bọc selector .player-master-dashboard
  const hasDashboardMediaQuery = /@media[^{]+\{[\s\S]*?\.player-master-dashboard\s*\{[\s\S]*?\}/.test(cssContent);
  assert.ok(hasDashboardMediaQuery, 'Phải có media query responsive cho .player-master-dashboard để tránh sập layout 4 cột trên màn hình nhỏ');
});

runTest('Opponent card header phải có min-width: 0 và flex-shrink hợp lý để tránh sập với badge điểm và nhãn đã rời ván', () => {
  const headerMatch = cssContent.match(/\.player-box-name,\s*\.opponent-name\s*\{([^}]+)\}/);
  assert.ok(headerMatch, 'Phải tìm thấy CSS selector cho .player-box-name, .opponent-name');
  const rules = headerMatch[1];

  const hasFlexShrink = rules.includes('min-width') || rules.includes('flex');
  assert.ok(hasFlexShrink, '.opponent-name phải có min-width: 0 hoặc flex property để co giãn linh hoạt với badge cạnh bên');
});

console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ TEST ISSUE #15: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${totalTests})`);
console.log('--------------------------------------------------------\n');

process.exit(failedTests > 0 ? 1 : 0);
