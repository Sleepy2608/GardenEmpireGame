/**
 * Test Suite: Endgame Announcement & Countdown Timer (Issue #18)
 * Framework: Node.js Native Runner
 * Quy chuẩn: Arrange - Act - Assert (AAA) theo .agents/AGENTS.md
 */

import assert from 'node:assert';

// Giả lập môi trường DOM cơ bản (Headless mock) cho Node.js native testing
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(cls) { this.classes.add(cls); }
  remove(cls) { this.classes.delete(cls); }
  contains(cls) { return this.classes.has(cls); }
}

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName;
    this.id = id;
    this.classList = new MockClassList();
    this.style = {};
    this.children = [];
    this._textContent = '';
    this._innerHTML = '';
    this.disabled = false;
  }

  get textContent() {
    return this._textContent;
  }
  set textContent(val) {
    this._textContent = String(val);
  }

  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
  }

  appendChild(child) {
    this.children.push(child);
  }
}

// Logic helper giả lập xếp hạng & vinh danh để test độc lập logic thuần
function sortPlayers(players) {
  return [...players].sort((a, b) => {
    if ((b.prestigePoints || 0) !== (a.prestigePoints || 0)) {
      return (b.prestigePoints || 0) - (a.prestigePoints || 0);
    }
    return (a.purchasedCards?.length || 0) - (b.purchasedCards?.length || 0);
  });
}

function getWinner(players, winnerPlayerId) {
  const sorted = sortPlayers(players);
  if (winnerPlayerId) {
    const p = players.find(x => x.id === winnerPlayerId);
    if (p) return p;
  }
  return sorted[0];
}

function getPersonalStatus(sortedPlayers, guestId) {
  const myIndex = sortedPlayers.findIndex(p => p.id === guestId);
  const myPlayer = sortedPlayers.find(p => p.id === guestId);
  const rankLabels = ['Quán quân (#1)', 'Á quân (#2)', 'Hạng 3 (#3)', 'Hạng 4 (#4)'];
  if (myIndex === 0) {
    return {
      isWinner: true,
      text: `👑 Bạn là Quán quân (#1) với ${myPlayer?.prestigePoints || 0} Điểm Uy Tín!`
    };
  } else if (myIndex > 0) {
    return {
      isWinner: false,
      text: `🌿 Bạn đạt ${rankLabels[myIndex]} với ${myPlayer?.prestigePoints || 0} Điểm Uy Tín`
    };
  }
  return { isWinner: false, text: 'Ván đấu đã khép lại' };
}

console.log('\n🏆 ========================================================');
console.log('🧪 TEST SUITE: ENDGAME ANNOUNCEMENT & COUNTDOWN TIMER (#18)');
console.log('🏆 ========================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
  }
}

// ----------------------------------------------------
// TEST CASE 1: Happy Path — Vinh Danh Quán Quân & Bảng Xếp Hạng 4 Người
// ----------------------------------------------------
console.log('▶ Test Case 1: Happy Path — Vinh danh Quán quân & Xếp hạng chung cuộc');

const players4 = [
  { id: 'p1', name: 'Alice', avatar: '🌸', prestigePoints: 16, purchasedCards: [1, 2, 3, 4], tokens: { DIRT: 2, WATER: 1 }, claimedVisitors: [1] },
  { id: 'p2', name: 'Bob', avatar: '💧', prestigePoints: 12, purchasedCards: [1, 2, 3], tokens: { LIGHT: 3 }, claimedVisitors: [] },
  { id: 'p3', name: 'Charlie', avatar: '☀️', prestigePoints: 9, purchasedCards: [1, 2], tokens: {}, claimedVisitors: [] },
  { id: 'p4', name: 'Diana', avatar: '🌿', prestigePoints: 14, purchasedCards: [1, 2, 3, 4, 5], tokens: { NUTRIENT: 2 }, claimedVisitors: [1] }
];

runTest('Xác định chính xác Quán quân có điểm cao nhất (Alice 16★)', () => {
  const winner = getWinner(players4, null);
  assert.strictEqual(winner.id, 'p1');
  assert.strictEqual(winner.name, 'Alice');
  assert.strictEqual(winner.prestigePoints, 16);
});

runTest('Thứ tự xếp hạng 4 người chơi theo điểm giảm dần: Alice (16) > Diana (14) > Bob (12) > Charlie (9)', () => {
  const sorted = sortPlayers(players4);
  assert.strictEqual(sorted[0].id, 'p1');
  assert.strictEqual(sorted[1].id, 'p4');
  assert.strictEqual(sorted[2].id, 'p2');
  assert.strictEqual(sorted[3].id, 'p3');
});

runTest('Cá nhân hóa thông điệp khi chính mình là Quán quân (Viewer = Alice)', () => {
  const sorted = sortPlayers(players4);
  const status = getPersonalStatus(sorted, 'p1');
  assert.strictEqual(status.isWinner, true);
  assert.ok(status.text.includes('Bạn là Quán quân (#1)'));
  assert.ok(status.text.includes('16 Điểm Uy Tín'));
});

runTest('Cá nhân hóa thông điệp khi mình là Á quân (Viewer = Diana)', () => {
  const sorted = sortPlayers(players4);
  const status = getPersonalStatus(sorted, 'p4');
  assert.strictEqual(status.isWinner, false);
  assert.ok(status.text.includes('Á quân (#2)'));
  assert.ok(status.text.includes('14 Điểm Uy Tín'));
});

runTest('Tổng số token của từng người chơi tính toán chính xác', () => {
  const aliceTokens = Object.values(players4[0].tokens).reduce((a, b) => a + b, 0);
  const bobTokens = Object.values(players4[1].tokens).reduce((a, b) => a + b, 0);
  const charlieTokens = Object.values(players4[2].tokens).reduce((a, b) => a + b, 0);
  assert.strictEqual(aliceTokens, 3);
  assert.strictEqual(bobTokens, 3);
  assert.strictEqual(charlieTokens, 0);
});

// ----------------------------------------------------
// TEST CASE 2: Tiebreaker — Bằng Điểm Uy Tín (Ít thẻ hơn thắng)
// ----------------------------------------------------
console.log('\n▶ Test Case 2: Boundary & Tiebreaker — Hòa điểm uy tín');

const tiePlayers = [
  { id: 'p1', name: 'Player Many Cards', prestigePoints: 15, purchasedCards: [1, 2, 3, 4, 5, 6] },
  { id: 'p2', name: 'Player Few Cards', prestigePoints: 15, purchasedCards: [1, 2, 3] }
];

runTest('Khi bằng 15 điểm uy tín: Người ít thẻ hơn (3 vs 6) phải giành chiến thắng Quán quân', () => {
  const sorted = sortPlayers(tiePlayers);
  assert.strictEqual(sorted[0].id, 'p2', 'Player Few Cards (3 thẻ) phải xếp Hạng 1');
  assert.strictEqual(sorted[1].id, 'p1', 'Player Many Cards (6 thẻ) phải xếp Hạng 2');
});

runTest('Quán quân được nhận diện đúng khi hòa điểm', () => {
  const winner = getWinner(tiePlayers, null);
  assert.strictEqual(winner.id, 'p2');
  assert.strictEqual(winner.purchasedCards.length, 3);
});

// ----------------------------------------------------
// TEST CASE 3: Countdown Timer & Exit Lobby Mechanism
// ----------------------------------------------------
console.log('\n▶ Test Case 3: Countdown Timer & Exit Flow');

class CountdownManager {
  constructor(initialSeconds = 20, onExpire) {
    this.seconds = initialSeconds;
    this.initialSeconds = initialSeconds;
    this.onExpire = onExpire;
    this.isExited = false;
  }

  tick() {
    this.seconds--;
    if (this.seconds <= 0) {
      this.isExited = true;
      if (this.onExpire) this.onExpire();
    }
  }

  getProgressPct() {
    return Math.max(0, (this.seconds / this.initialSeconds) * 100);
  }

  manualExit() {
    this.isExited = true;
    if (this.onExpire) this.onExpire();
  }
}

runTest('Đồng hồ đếm ngược khởi tạo 20 giây và progress 100%', () => {
  const cd = new CountdownManager(20, () => {});
  assert.strictEqual(cd.seconds, 20);
  assert.strictEqual(cd.getProgressPct(), 100);
});

runTest('Sau 5 giây tick, số giây còn lại là 15s và progress là 75%', () => {
  const cd = new CountdownManager(20, () => {});
  for (let i = 0; i < 5; i++) cd.tick();
  assert.strictEqual(cd.seconds, 15);
  assert.strictEqual(cd.getProgressPct(), 75);
});

runTest('Khi đếm ngược về 0s, tự động kích hoạt callback thoát phòng (onExpire)', () => {
  let expired = false;
  const cd = new CountdownManager(3, () => { expired = true; });
  cd.tick(); // 2
  cd.tick(); // 1
  assert.strictEqual(expired, false);
  cd.tick(); // 0 -> Expired
  assert.strictEqual(expired, true);
  assert.strictEqual(cd.isExited, true);
});

runTest('Bấm nút Quay Về Sảnh Ngay lập tức kích hoạt thoát phòng mà không cần đợi hết giờ', () => {
  let manualTriggered = false;
  const cd = new CountdownManager(20, () => { manualTriggered = true; });
  cd.manualExit();
  assert.strictEqual(manualTriggered, true);
  assert.strictEqual(cd.isExited, true);
});

// ----------------------------------------------------
// TEST CASE 4: Toggle & Minimize — Xem Lại Bàn Cờ & Floating Bar
// ----------------------------------------------------
console.log('\n▶ Test Case 4: Toggle Modal & Floating Bar');

class ModalStateManager {
  constructor() {
    this.isVictoryModalOpen = true;
    this.isFloatingBarOpen = false;
  }

  minimizeToBoard() {
    this.isVictoryModalOpen = false;
    this.isFloatingBarOpen = true;
  }

  restoreModal() {
    this.isVictoryModalOpen = true;
    this.isFloatingBarOpen = false;
  }
}

runTest('Ban đầu: Victory Modal mở, Floating Bar ẩn', () => {
  const state = new ModalStateManager();
  assert.strictEqual(state.isVictoryModalOpen, true);
  assert.strictEqual(state.isFloatingBarOpen, false);
});

runTest('Bấm Xem Lại Bàn Cờ: Victory Modal ẩn, Floating Bar hiện', () => {
  const state = new ModalStateManager();
  state.minimizeToBoard();
  assert.strictEqual(state.isVictoryModalOpen, false);
  assert.strictEqual(state.isFloatingBarOpen, true);
});

runTest('Bấm Xem Bảng Điểm trên Floating Bar: Victory Modal hiện lại, Floating Bar ẩn', () => {
  const state = new ModalStateManager();
  state.minimizeToBoard();
  state.restoreModal();
  assert.strictEqual(state.isVictoryModalOpen, true);
  assert.strictEqual(state.isFloatingBarOpen, false);
});

// ----------------------------------------------------
// TEST CASE 5: WebSocket Event ROOM_CLOSED Sync
// ----------------------------------------------------
console.log('\n▶ Test Case 5: WebSocket Event ROOM_CLOSED Synchronization');

class SocketMessageHandler {
  constructor(onRoomClosed) {
    this.onRoomClosed = onRoomClosed;
  }

  handleMessage(msg) {
    if (msg.type === 'ROOM_CLOSED') {
      if (this.onRoomClosed) this.onRoomClosed(msg.reason);
      return true;
    }
    return false;
  }
}

runTest('Nhận sự kiện ROOM_CLOSED từ WebSocket kích hoạt giải phóng và rời phòng', () => {
  let receivedReason = null;
  const handler = new SocketMessageHandler((reason) => {
    receivedReason = reason;
  });

  const handled = handler.handleMessage({
    type: 'ROOM_CLOSED',
    roomId: 'room-123',
    reason: 'Phòng đã kết thúc và được đóng bởi chủ phòng.'
  });

  assert.strictEqual(handled, true);
  assert.strictEqual(receivedReason, 'Phòng đã kết thúc và được đóng bởi chủ phòng.');
});

// ----------------------------------------------------
// TỔNG KẾT BỘ TEST
// ----------------------------------------------------
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} PASS / ${totalTests - passedTests} FAIL`);
console.log('--------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

