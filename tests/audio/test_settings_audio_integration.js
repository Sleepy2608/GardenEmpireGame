/**
 * Test Suite: Settings Audio Integration & Two-Way Synchronization
 * Framework: Node.js Native Runner
 * Quy chuẩn: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 */

import assert from 'node:assert';

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

const { settingsManager } = await import('../../client/js/settings/SettingsManager.js');
const { SoundFX } = await import('../../client/js/ui/SoundFX.js');
const { SettingsUI } = await import('../../client/js/ui/SettingsUI.js');

console.log('\n🎵 ========================================================');
console.log('🧪 TEST SUITE: SETTINGS AUDIO INTEGRATION & TWO-WAY SYNC');
console.log('🎵 ========================================================\n');

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

function resetEnvironment() {
  global.localStorage.clear();
  settingsManager._bgmController = null;
  settingsManager._soundFx = null;
  settingsManager.resetToDefaults();
}

// -----------------------------------------------------------------------------
// Test Case 1: Tich hop dong bo hai chieu voi BGMController
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: Tich hop dong bo hai chieu voi BGMController');

runTest('BGMController nhan dung effective volume khi Master Volume hoac BGM Volume thay doi', () => {
  resetEnvironment();

  let bgmVolumeSet = null;
  let bgmMutedSet = null;

  const mockBgmController = {
    applySettingsVolume: (v, m) => {
      bgmVolumeSet = v;
      bgmMutedSet = m;
    }
  };

  settingsManager.attachBgmController(mockBgmController);

  // Assert luc attach: Master=0.8, BGM=0.7 -> Effective = 0.56
  assert.strictEqual(Math.abs(bgmVolumeSet - 0.56) < 0.001, true, 'Volume luc attach phai la 0.56');
  assert.strictEqual(bgmMutedSet, false, 'Trang thai muted luc attach phai la false');

  // Act: Thay doi Master Volume ve 0.5
  settingsManager.setMasterVolume(0.5);
  // Assert: Effective = 0.5 * 0.7 = 0.35
  assert.strictEqual(Math.abs(bgmVolumeSet - 0.35) < 0.001, true, 'Volume phai la 0.35 khi Master=0.5');

  // Act: Thay doi BGM Volume ve 0.4
  settingsManager.setBgmVolume(0.4);
  // Assert: Effective = 0.5 * 0.4 = 0.20
  assert.strictEqual(Math.abs(bgmVolumeSet - 0.20) < 0.001, true, 'Volume phai la 0.20 khi BGM=0.4');

  // Act: Mute rieng BGM
  settingsManager.setBgmMuted(true);
  assert.strictEqual(bgmVolumeSet, 0, 'Volume phai ve 0 khi BGM muted');
  assert.strictEqual(bgmMutedSet, true, 'bgmMuted phai la true');
});

// -----------------------------------------------------------------------------
// Test Case 2: Tich hop dong bo hai chieu voi SoundFX
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Tich hop dong bo hai chieu voi SoundFX');

runTest('SoundFX nhan dung effective volume va trang thai mute tu SettingsManager', () => {
  resetEnvironment();

  let sfxMasterSet = null;
  let sfxMutedSet = null;

  const mockSoundFx = {
    setMasterVolume: (v) => { sfxMasterSet = v; },
    setMuted: (m) => { sfxMutedSet = m; }
  };

  settingsManager.attachSoundFx(mockSoundFx);

  // Assert luc attach: Master=0.8, SFX=1.0 -> Effective = 0.8
  assert.strictEqual(Math.abs(sfxMasterSet - 0.8) < 0.001, true, 'Effective SFX volume phai la 0.8');
  assert.strictEqual(sfxMutedSet, false, 'SFX muted phai la false');

  // Act: Thay doi SFX Volume ve 0.6
  settingsManager.setSfxVolume(0.6);
  // Assert: Effective = 0.8 * 0.6 = 0.48
  assert.strictEqual(Math.abs(sfxMasterSet - 0.48) < 0.001, true, 'Effective SFX phai la 0.48');

  // Act: Mute Master -> ca BGM va SFX deu phai mute
  settingsManager.setMasterMuted(true);
  assert.strictEqual(sfxMasterSet, 0, 'SFX volume phai ve 0 khi Master muted');
  assert.strictEqual(sfxMutedSet, true, 'SFX phai bi mute khi Master muted');
});

// -----------------------------------------------------------------------------
// Test Case 3: Tu dong cap nhat bieu tuong #sound-icon tren navbar
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 3: Dong bo trang thai bieu tuong #sound-icon tren navbar');

runTest('Bieu tuong #sound-icon phai doi giua loa bat va loa tat khi Master Mute thay doi', () => {
  resetEnvironment();

  let iconText = '🔊';
  const mockSoundIcon = {
    get textContent() { return iconText; },
    set textContent(val) { iconText = val; }
  };

  let modalAttached = false;
  const mockModal = {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    setAttribute: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  global.document = {
    getElementById: (id) => {
      if (id === 'sound-icon') return mockSoundIcon;
      if (modalAttached && id === 'test-sync-modal') return mockModal;
      return null;
    },
    createElement: () => mockModal,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: {
      appendChild: () => { modalAttached = true; },
      style: {}
    }
  };

  SettingsUI.setupModal({
    modalId: 'test-sync-modal',
    prefixId: 'test-sync'
  });

  // Ban dau chua mute -> icon la loa bat
  assert.strictEqual(iconText, '🔊', 'Icon ban dau phai la loa bat 🔊');

  // Act: Mute Master tu SettingsManager
  settingsManager.setMasterMuted(true);
  assert.strictEqual(iconText, '🔇', 'Icon phai tu dong chuyen sang loa tat 🔇');

  // Act: Unmute Master
  settingsManager.setMasterMuted(false);
  assert.strictEqual(iconText, '🔊', 'Icon phai tu dong chuyen ve loa bat 🔊');

  delete global.document;
});

// -----------------------------------------------------------------------------
// Test Case 4: Kiem tra am thanh Turn Alert va Chat Pop
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 4: Kiem tra am thanh Turn Alert va Chat Pop');

runTest('SoundFX.playTurnAlert phat hop am 3 not E5, A5, C6 va bi chan khi mute', () => {
  let tones = [];
  const origPlayTone = SoundFX.playTone.bind(SoundFX);

  SoundFX.playTone = (freq, type, dur, gain, delay) => {
    tones.push({ freq, type, dur, gain, delay });
  };

  SoundFX.setMuted(false);
  SoundFX.setMasterVolume(1.0);
  SoundFX.playTurnAlert();

  assert.strictEqual(tones.length, 3, 'Phai phat du 3 not');
  assert.strictEqual(tones[0].freq, 659.25, 'Not 1 la E5');
  assert.strictEqual(tones[1].freq, 880.00, 'Not 2 la A5');
  assert.strictEqual(tones[2].freq, 1046.50, 'Not 3 la C6');

  // Khi bi mute
  tones = [];
  SoundFX.setMuted(true);
  SoundFX.playTurnAlert();
  assert.strictEqual(tones.length, 0, 'Khong phat not nao khi bi mute');

  SoundFX.setMuted(false);
  SoundFX.playTone = origPlayTone;
});

runTest('SoundFX.playChatPop goi SoundFX.playChatSound thanh cong', () => {
  let called = false;
  const orig = SoundFX.playChatSound.bind(SoundFX);

  SoundFX.playChatSound = () => { called = true; };
  SoundFX.playChatPop();

  assert.strictEqual(called, true, 'playChatPop phai goi playChatSound');
  SoundFX.playChatSound = orig;
});

// -----------------------------------------------------------------------------
// Test Case 5: Tuong thich nguoc voi cac khoa legacy trong localStorage
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 5: Tuong thich nguoc voi khoa legacy trong localStorage');

runTest('Khoi tao dung gia tri tu khoa legacy garden_empire_sound_muted va garden_empire_bgm_volume', () => {
  global.localStorage.clear();
  global.localStorage.setItem('garden_empire_sound_muted', 'true');
  global.localStorage.setItem('garden_empire_bgm_volume', '0.45');

  // Tao instance SettingsManager moi de nap tu localStorage
  const freshManager = new settingsManager.constructor();
  const settings = freshManager.getSettings();

  assert.strictEqual(settings.audio.masterMuted, true, 'Master muted phai la true tu legacy key');
  assert.strictEqual(settings.audio.bgmVolume, 0.45, 'BGM volume phai la 0.45 tu legacy key');
});

// -----------------------------------------------------------------------------
// Tong ket
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------');
console.log(`🏁 KET QUA TEST SETTINGS AUDIO: ${passedTests} PASS / ${failedTests} FAIL (Tong so: ${totalTests})`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
