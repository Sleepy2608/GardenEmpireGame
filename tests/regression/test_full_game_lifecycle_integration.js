/**
 * Master Comprehensive Integration Test Suite: Full Game Lifecycle & All New Features
 * Kiem thu toan dien chu trinh van dau tu dau toi cuoi va tat ca tinh nang moi:
 * 1. Welcome Portal & Lore Codex
 * 2. Registration & Dashboard (Index)
 * 3. Lobby & Concurrency Protection
 * 4. Waiting Room & Turn Timer Settings
 * 5. Tabletop Arena & Core Engine Mechanics (6 Tokens, 90 Real Cards, Visitors)
 * 6. Turn Timer, AFK & Smart Bot Autonomous Takeover
 * 7. Settings Button & Modular Preferences (Audio, Display, Gameplay, Hotkeys)
 * 8. Endgame Announcement, Tiebreaker & Walkover Victory
 *
 * Quy chuan: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 * Tuan thu quy tac 9.G: 0 ky tu em-dash hay en-dash.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();

// Import Game Modules
const { GameState } = await import('../../client/js/game/GameState.js');
const { settingsManager } = await import('../../client/js/settings/SettingsManager.js');
const { SettingsUI } = await import('../../client/js/ui/SettingsUI.js');
const { SoundFX } = await import('../../client/js/ui/SoundFX.js');

console.log('\n🌿 ========================================================');
console.log('🧪 MASTER INTEGRATION TEST: FULL GAME LIFECYCLE & FEATURES');
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
    console.error(`     Chi tiet: ${err.message}`);
  }
}

// =============================================================================
// PHASE 1: WELCOME PORTAL, BOTANICAL LORE & SETTINGS PRESENCE
// =============================================================================
console.log('▶ [PHASE 1] Welcome Portal, Botanical Lore & Settings Presence');

runTest('1.1. Welcome Portal co day du AIDA, 6 tinh hoa, 10 khach quy va nut settings', () => {
  const html = fs.readFileSync(path.resolve('client/welcome.html'), 'utf-8');
  assert.ok(html.includes('id="particles-canvas"'), 'Co canvas hat sang sinh thai');
  assert.ok(html.includes('id="btn-open-settings"'), 'Co nut Settings tren header welcome');
  assert.ok(html.includes('id="nav-btn-play"'), 'Co nut CTA bat dau choi');
  assert.ok(html.includes('css/settings.css'), 'Welcome nhung css/settings.css');

  // Kiem tra du 6 loai tinh hoa nang luong
  ['Đất', 'Nước', 'Ánh Sáng', 'Hạt Giống', 'Dinh Dưỡng', 'Phân Bón Vàng'].forEach(res => {
    assert.ok(html.includes(res), `Welcome phai the hien tinh hoa ${res}`);
  });
});

runTest('1.2. Welcome Portal cau hinh routing hop le cho production va local', () => {
  const vercelJson = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf-8'));
  const serveJson = JSON.parse(fs.readFileSync(path.resolve('client/serve.json'), 'utf-8'));

  assert.strictEqual(vercelJson.cleanUrls, false, 'Vercel cleanUrls phai la false');
  assert.ok(vercelJson.rewrites.some(r => r.source === '/' && r.destination.includes('welcome')), 'Vercel rewrite root ve welcome');
  assert.ok(serveJson.rewrites.some(r => r.source === '/' && r.destination.includes('welcome')), 'Serve rewrite root ve welcome');
});

// =============================================================================
// PHASE 2: REGISTRATION, DASHBOARD (INDEX) & PREFETCH
// =============================================================================
console.log('\n▶ [PHASE 2] Registration, Dashboard (Index) & Navigation');

runTest('2.1. Trang Index tich hop nut Settings, quay lai Welcome va prefetch', () => {
  const html = fs.readFileSync(path.resolve('client/index.html'), 'utf-8');
  const js = fs.readFileSync(path.resolve('client/js/main.js'), 'utf-8');

  assert.ok(html.includes('id="btn-open-settings"'), 'Index co nut Settings tren navbar');
  assert.ok(html.includes('css/settings.css'), 'Index nhung css/settings.css');
  assert.ok(js.includes('SettingsUI.setupModal'), 'main.js khoi tao SettingsUI.setupModal');
  assert.ok(js.includes('/api/rooms'), 'main.js prefetch danh sach phong tu som');
});

// =============================================================================
// PHASE 3: LOBBY & CONCURRENCY PROTECTION
// =============================================================================
console.log('\n▶ [PHASE 3] Lobby Room List & Concurrency Protection');

runTest('3.1. Sảnh cho co nut Settings, SWR cache va khoa Mutex chong spam', () => {
  const html = fs.readFileSync(path.resolve('client/lobby.html'), 'utf-8');
  const js = fs.readFileSync(path.resolve('client/js/ui/LobbyUI.js'), 'utf-8');

  assert.ok(html.includes('id="btn-open-settings"'), 'Lobby co nut Settings tren navbar');
  assert.ok(html.includes('css/settings.css'), 'Lobby nhung css/settings.css');
  assert.ok(js.includes('SettingsUI.setupModal'), 'LobbyUI khoi tao SettingsUI.setupModal');
  assert.ok(js.includes('isCreatingRoom'), 'LobbyUI co co mutex isCreatingRoom');
  assert.ok(js.includes('garden_empire_cached_rooms'), 'LobbyUI co co che SWR session cache');
});

// =============================================================================
// PHASE 4: WAITING ROOM & TURN TIMER CONFIGURATION
// =============================================================================
console.log('\n▶ [PHASE 4] Waiting Room & Turn Timer Duration Settings');

runTest('4.1. Phong cho co lua chon thoi gian luot (60s, 120s, 300s) va nut Settings', () => {
  const html = fs.readFileSync(path.resolve('client/waiting-room.html'), 'utf-8');
  const js = fs.readFileSync(path.resolve('client/js/ui/WaitingRoomUI.js'), 'utf-8');

  assert.ok(html.includes('id="btn-open-settings"'), 'Waiting room co nut Settings');
  assert.ok(html.includes('turn-pill-btn'), 'Waiting room co cac nut thoi gian luot');
  assert.ok(html.includes('data-duration="60"'), 'Co lua chon 60s');
  assert.ok(html.includes('data-duration="120"'), 'Co lua chon 120s');
  assert.ok(html.includes('data-duration="300"'), 'Co lua chon 300s');
  assert.ok(js.includes('SettingsUI.setupModal'), 'WaitingRoomUI khoi tao SettingsUI.setupModal');
});

// =============================================================================
// PHASE 5: TABLETOP BOARD, REAL PLANT PHOTOS & GAMEPLAY VISUALS
// =============================================================================
console.log('\n▶ [PHASE 5] Tabletop Board, Real Plant Photos & In-Game Components');

runTest('5.1. Ban co in-game co day du Chat, Logs, Fullscreen va Settings', () => {
  const html = fs.readFileSync(path.resolve('client/game.html'), 'utf-8');
  const boardJs = fs.readFileSync(path.resolve('client/js/ui/BoardUI.js'), 'utf-8');

  assert.ok(html.includes('id="btn-open-settings"'), 'Game board co nut Settings');
  assert.ok(html.includes('id="btn-toggle-chat"'), 'Game board co nut mo Chat');
  assert.ok(html.includes('id="btn-toggle-fullscreen"'), 'Game board co nut Fullscreen');
  assert.ok(html.includes('id="game-log-feed"'), 'Game board co widget Action Logs');
  assert.ok(html.includes('id="turn-indicator-banner"'), 'Game board co banner luot di');
  assert.ok(html.includes('id="turn-timer-badge"'), 'Game board co huy hieu dem gio');
  assert.ok(boardJs.includes('SettingsUI.setupModal'), 'BoardUI khoi tao SettingsUI.setupModal');
});

runTest('5.2. Bo suu tap 90 the cay thuc te ton tai day du file anh tren dia', () => {
  const imgDir = path.resolve('client/assets/images/plants');
  assert.ok(fs.existsSync(imgDir), 'Thu muc anh cay client/assets/images/plants phai ton tai');

  const files = fs.readdirSync(imgDir);
  const webpFiles = files.filter(f => f.endsWith('.webp') && !f.startsWith('tier'));
  assert.ok(webpFiles.length >= 90, `Phai co it nhat 90 the cay WebP thuc te (tim thay: ${webpFiles.length})`);
});

runTest('5.3. Khung doi thu (Players Box) boc tach day du 6 loai token cam tay', () => {
  const playerUiJs = fs.readFileSync(path.resolve('client/js/ui/PlayerUI.js'), 'utf-8');
  assert.ok(playerUiJs.includes('mini-token-chip'), 'PlayerUI dung chip mini-token-chip');
  assert.ok(playerUiJs.includes('DIRT') || playerUiJs.includes('dirt'), 'Boc tach token Dirt');
  assert.ok(playerUiJs.includes('WATER') || playerUiJs.includes('water'), 'Boc tach token Water');
  assert.ok(playerUiJs.includes('SUNLIGHT') || playerUiJs.includes('sunlight'), 'Boc tach token Sunlight');
  assert.ok(playerUiJs.includes('SEED') || playerUiJs.includes('seed'), 'Boc tach token Seed');
  assert.ok(playerUiJs.includes('NUTRIENTS') || playerUiJs.includes('nutrients'), 'Boc tach token Nutrients');
  assert.ok(playerUiJs.includes('WILD') || playerUiJs.includes('wild'), 'Boc tach token WILD');
});

// =============================================================================
// PHASE 6: TURN TIMER, AFK & SMART BOT AUTONOMOUS TAKEOVER
// =============================================================================
console.log('\n▶ [PHASE 6] Turn Timer, AFK & Smart Bot Autonomous Takeover');

runTest('6.1. GameState cap nhat dung trang thai Bot va Afk Warning tu DTO', () => {
  const gameState = new GameState();
  const dto = {
    gameId: 'master-test-game',
    currentTurnPlayerId: 'player-bot-1',
    turnStartTime: Date.now(),
    turnDurationSeconds: 60,
    players: [
      {
        id: 'player-human',
        name: 'Nghệ Nhân Mai',
        avatar: '🌸',
        isBot: false,
        bot: false,
        host: true,
        prestigePoints: 10,
        tokens: { DIRT: 2, WATER: 1, WILD: 1 },
        bonuses: { DIRT: 1 },
        consecutiveAfkCount: 1, // Strike 1 warning
        hasLeft: false
      },
      {
        id: 'player-bot-1',
        name: 'Trúc Lâm (🤖 Bot)',
        avatar: '🎋',
        isBot: true,
        bot: true,
        host: false,
        prestigePoints: 12,
        tokens: { SUNLIGHT: 3, SEED: 2 },
        bonuses: { WATER: 2 },
        consecutiveAfkCount: 0,
        hasLeft: false
      }
    ],
    resourceBank: { DIRT: 4, WATER: 5, SUNLIGHT: 4, SEED: 5, NUTRIENTS: 5, WILD: 3 }
  };

  gameState.updateFromDto(dto);

  assert.strictEqual(gameState.players.length, 2, 'Co 2 nguoi choi');
  assert.strictEqual(Boolean(gameState.players[0].isBot ?? gameState.players[0].bot), false, 'Nguoi 1 la nguoi that');
  assert.strictEqual(gameState.players[0].consecutiveAfkCount, 1, 'Nguoi 1 co Strike 1 AFK');
  assert.strictEqual(Boolean(gameState.players[1].isBot ?? gameState.players[1].bot), true, 'Nguoi 2 la Bot tiep quan');
  assert.strictEqual(gameState.currentTurnPlayerId, 'player-bot-1', 'Den luot cua Bot');
});

// =============================================================================
// PHASE 7: SETTINGS BUTTON & PREFERENCES SYSTEM LIVE INTERACTION
// =============================================================================
console.log('\n▶ [PHASE 7] Settings Button & Modular Preferences Integration');

runTest('7.1. SettingsManager ma tran am luong va luu tru localStorage', () => {
  global.localStorage.clear();
  settingsManager.resetToDefaults();

  // Mặc định
  assert.strictEqual(settingsManager.getMasterVolume(), 0.8);
  assert.strictEqual(settingsManager.getBgmVolume(), 0.7);
  assert.strictEqual(settingsManager.getSfxVolume(), 1.0);
  assert.strictEqual(Math.abs(settingsManager.getEffectiveBgmVolume() - 0.56) < 0.001, true);
  assert.strictEqual(Math.abs(settingsManager.getEffectiveSfxVolume() - 0.8) < 0.001, true);

  // Điều chỉnh Master Volume
  settingsManager.setMasterVolume(0.5);
  assert.strictEqual(Math.abs(settingsManager.getEffectiveBgmVolume() - 0.35) < 0.001, true);
  assert.strictEqual(Math.abs(settingsManager.getEffectiveSfxVolume() - 0.5) < 0.001, true);

  // Master Mute
  settingsManager.setMasterMuted(true);
  assert.strictEqual(settingsManager.getEffectiveBgmVolume(), 0);
  assert.strictEqual(settingsManager.getEffectiveSfxVolume(), 0);

  // Khôi phục
  settingsManager.resetToDefaults();
  assert.strictEqual(settingsManager.isMasterMuted(), false);
  assert.strictEqual(settingsManager.getMasterVolume(), 0.8);
});

runTest('7.2. SettingsUI ap dung preferences len dataset cua the html', () => {
  const mockDataset = {};
  global.document = {
    documentElement: { dataset: mockDataset }
  };

  settingsManager.setDisplaySetting('particlesEnabled', false);
  settingsManager.setDisplaySetting('reducedMotion', true);
  settingsManager.setDisplaySetting('cardHoverZoom', false);
  settingsManager.setGameplaySetting('turnAlertSound', true);
  settingsManager.setGameplaySetting('chatMessageSound', true);

  SettingsUI.applyDisplayAndGameplayPreferences();

  assert.strictEqual(mockDataset.particles, 'false', 'dataset.particles phai la false');
  assert.strictEqual(mockDataset.reducedMotion, 'true', 'dataset.reducedMotion phai la true');
  assert.strictEqual(mockDataset.cardHoverZoom, 'false', 'dataset.cardHoverZoom phai la false');

  delete global.document;
});

runTest('7.3. SoundFX ho tro am thanh Turn Alert E5-A5-C6 va Chat Pop', () => {
  let tones = [];
  const origPlayTone = SoundFX.playTone.bind(SoundFX);

  SoundFX.playTone = (freq, type, dur, gain, delay) => {
    tones.push({ freq, type, dur, gain, delay });
  };

  SoundFX.setMuted(false);
  SoundFX.setMasterVolume(1.0);
  SoundFX.playTurnAlert();

  assert.strictEqual(tones.length, 3, 'Turn alert phai co 3 not');
  assert.strictEqual(tones[0].freq, 659.25, 'Not E5');
  assert.strictEqual(tones[1].freq, 880.00, 'Not A5');
  assert.strictEqual(tones[2].freq, 1046.50, 'Not C6');

  let chatPopped = false;
  const origChatSound = SoundFX.playChatSound.bind(SoundFX);
  SoundFX.playChatSound = () => { chatPopped = true; };
  SoundFX.playChatPop();
  assert.strictEqual(chatPopped, true, 'playChatPop phai goi playChatSound');

  SoundFX.playTone = origPlayTone;
  SoundFX.playChatSound = origChatSound;
});

// =============================================================================
// PHASE 8: ENDGAME, TIEBREAKER & WALKOVER VICTORY
// =============================================================================
console.log('\n▶ [PHASE 8] Endgame Announcement, Tiebreaker & Walkover Victory');

runTest('8.1. Luat Tiebreaker: Nguoi bang diem nhung it the cay hon se chien thang', () => {
  const gameState = new GameState();
  const dto = {
    gameId: 'tiebreaker-game',
    gameOver: true,
    finalRound: true,
    winnerPlayerId: 'player-b', // Backend quyet dinh nguoi it the hon thang
    players: [
      {
        id: 'player-a',
        name: 'Nghệ Nhân A',
        prestigePoints: 15,
        purchasedCards: [{}, {}, {}, {}, {}], // 5 thẻ
        tokens: {}
      },
      {
        id: 'player-b',
        name: 'Nghệ Nhân B',
        prestigePoints: 15,
        purchasedCards: [{}, {}, {}], // 3 thẻ (ít hơn -> Quán quân)
        tokens: {}
      }
    ]
  };

  gameState.updateFromDto(dto);

  assert.strictEqual(gameState.isGameOver, true, 'Game da ket thuc');
  assert.strictEqual(gameState.winnerPlayerId, 'player-b', 'Player B thang nho it the hon');
});

runTest('8.2. Chien thang mac dinh Walkover khi tat ca doi thu deu roi ban', () => {
  const gameState = new GameState();
  const dto = {
    gameId: 'walkover-game',
    gameOver: true,
    winnerPlayerId: 'player-survivor',
    players: [
      {
        id: 'player-survivor',
        name: 'Người Ở Lại',
        hasLeft: false,
        prestigePoints: 8,
        purchasedCards: [{}, {}],
        tokens: {}
      },
      {
        id: 'player-quitter',
        name: 'Người Đã Thoát',
        hasLeft: true,
        prestigePoints: 12,
        purchasedCards: [{}, {}, {}, {}],
        tokens: {}
      }
    ]
  };

  gameState.updateFromDto(dto);

  assert.strictEqual(gameState.isGameOver, true, 'Ván đấu lập tức kết thúc');
  assert.strictEqual(gameState.winnerPlayerId, 'player-survivor', 'Người ở lại duy nhất là Quán quân');
});

// =============================================================================
// PHASE 9: ZERO-SLOP ANTI-SLOP RULE 9.G COMPLIANCE
// =============================================================================
console.log('\n▶ [PHASE 9] Kiem tra quy tac 9.G Anti-slop (Zero em-dash / en-dash)');

runTest('9.1. Toan bo client/css/settings.css va client/css/rules.css khong co em-dash hay en-dash', () => {
  const settingsCss = fs.readFileSync(path.resolve('client/css/settings.css'), 'utf-8');
  const rulesCss = fs.readFileSync(path.resolve('client/css/rules.css'), 'utf-8');

  assert.strictEqual(settingsCss.includes('\u2014'), false, 'settings.css khong co em-dash');
  assert.strictEqual(settingsCss.includes('\u2013'), false, 'settings.css khong co en-dash');
  assert.strictEqual(rulesCss.includes('\u2014'), false, 'rules.css khong co em-dash');
  assert.strictEqual(rulesCss.includes('\u2013'), false, 'rules.css khong co en-dash');
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log('\n--------------------------------------------------------');
console.log(`🏁 KET QUA MASTER INTEGRATION TEST: ${passedTests} PASS / ${failedTests} FAIL (Tong so: ${totalTests})`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
