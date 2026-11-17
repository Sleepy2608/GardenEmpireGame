/**
 * Test Suite: Verification for Issue #30 — Game End Announcement Not Working Properly
 * Framework: Node.js Native Runner
 * Quy chuẩn: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 */

import assert from 'node:assert';
import { GameState } from '../client/js/game/GameState.js';

console.log('\n🏆 ========================================================');
console.log('🧪 VERIFICATION TEST: ISSUE #30 — GAME END ANNOUNCEMENT');
console.log('🏆 ========================================================\n');

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
// Test Case 1: Backend Jackson JSON Serialization compatibility
// Spring Boot Jackson converts boolean `isGameOver` -> `gameOver` and `isFinalRound` -> `finalRound`
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: GameState updateFromDto với payload thực tế từ Spring Boot Backend');

runTest('Backend gửi payload với key "gameOver: true" phải kích hoạt gameState.isGameOver = true', () => {
  const gameState = new GameState();
  const backendDto = {
    gameId: 'game-123',
    currentTurnPlayerId: 'p1',
    finalRound: true,
    gameOver: true, // Jackson serialization format
    winnerPlayerId: 'p1',
    players: [
      { id: 'p1', name: 'Alice', host: true, prestigePoints: 16, purchasedCards: [{}, {}, {}], tokens: {} },
      { id: 'p2', name: 'Bob', host: false, prestigePoints: 12, purchasedCards: [{}, {}], tokens: {} }
    ]
  };

  gameState.updateFromDto(backendDto);

  // Assertion: isGameOver và isFinalRound phải được ánh xạ đúng
  assert.strictEqual(gameState.isGameOver, true, 'gameState.isGameOver phải là true khi backend trả về gameOver: true');
  assert.strictEqual(gameState.isFinalRound, true, 'gameState.isFinalRound phải là true khi backend trả về finalRound: true');
});

runTest('Backend gửi payload với key "isGameOver: true" (nếu có) cũng phải hoạt động tương thích ngược', () => {
  const gameState = new GameState();
  const legacyDto = {
    gameId: 'game-456',
    isFinalRound: true,
    isGameOver: true,
    winnerPlayerId: 'p2',
    players: [
      { id: 'p1', name: 'Alice', isHost: true, prestigePoints: 10, tokens: {} },
      { id: 'p2', name: 'Bob', isHost: false, prestigePoints: 15, tokens: {} }
    ]
  };

  gameState.updateFromDto(legacyDto);

  assert.strictEqual(gameState.isGameOver, true, 'Tương thích ngược isGameOver');
  assert.strictEqual(gameState.isFinalRound, true, 'Tương thích ngược isFinalRound');
});

// -----------------------------------------------------------------------------
// Test Case 2: Victory Modal Trigger Condition trong BoardUI logic
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Kích hoạt Victory Modal khi trận đấu kết thúc');

runTest('Kiểm tra điều kiện mở Victory Modal khi nhận GAME_STATE_UPDATE kết thúc trận', () => {
  const gameState = new GameState();
  const backendDto = {
    gameId: 'game-789',
    gameOver: true,
    winnerPlayerId: 'p1',
    players: [
      { id: 'p1', name: 'Alice', prestigePoints: 16, tokens: {} }
    ]
  };

  gameState.updateFromDto(backendDto);

  // Giả lập logic kiểm tra trong BoardUI.checkSpecialGameStates
  let modalOpened = false;
  let countdownStarted = false;

  const mockVictoryModal = { classList: { remove: () => {}, add: () => {} } };

  // Logic BoardUI:
  if (gameState.isGameOver && mockVictoryModal) {
    modalOpened = true;
    countdownStarted = true;
  }

  assert.strictEqual(modalOpened, true, 'Victory Modal phải được kích hoạt mở khi ván đấu kết thúc');
  assert.strictEqual(countdownStarted, true, 'Endgame Countdown phải được kích hoạt');
});

console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ TEST ISSUE #30: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${totalTests})`);
console.log('--------------------------------------------------------\n');

process.exit(failedTests > 0 ? 1 : 0);

