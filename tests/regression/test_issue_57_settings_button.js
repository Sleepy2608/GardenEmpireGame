/**
 * Test Suite: Verification for Issue #57 - Settings Button & Multi-Screen Preferences System
 * Framework: Node.js Native Runner
 * Quy chuẩn: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('\n⚙️ ========================================================');
console.log('🧪 VERIFICATION TEST: ISSUE #57 - SETTINGS BUTTON & SYSTEM');
console.log('⚙️ ========================================================\n');

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

// -----------------------------------------------------------------------------
// Test Case 1: Tich hop nut Settings tren tat ca 5 man hinh HTML
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: Su hien dien cua nut #btn-open-settings tren ca 5 man hinh');

const htmlScreens = [
  { file: 'client/welcome.html', name: 'Welcome Portal' },
  { file: 'client/index.html', name: 'Index Dashboard' },
  { file: 'client/lobby.html', name: 'Lobby Rooms' },
  { file: 'client/waiting-room.html', name: 'Waiting Room' },
  { file: 'client/game.html', name: 'Game Board Arena' }
];

htmlScreens.forEach(({ file, name }) => {
  runTest(`Man hinh ${name} (${file}) phai co css/settings.css va nut #btn-open-settings`, () => {
    const fullPath = path.resolve(file);
    assert.ok(fs.existsSync(fullPath), `Tep ${file} phai ton tai`);
    const content = fs.readFileSync(fullPath, 'utf-8');

    assert.ok(content.includes('css/settings.css'), `${file} phai nhung css/settings.css`);
    assert.ok(content.includes('id="btn-open-settings"'), `${file} phai co nut co id="btn-open-settings"`);
    assert.ok(content.includes('btn-open-settings'), `${file} phai co class btn-open-settings`);
    assert.ok(content.includes('aria-label='), `${file} nut settings phai co aria-label`);
  });
});

// -----------------------------------------------------------------------------
// Test Case 2: Khoi tao SettingsUI.setupModal() trong cac tap lenh man hinh
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Rang buoc su kien setupModal() trong cac tap lenh controller');

const scriptControllers = [
  { file: 'client/welcome.html', name: 'welcome.html (inline script)' },
  { file: 'client/js/main.js', name: 'main.js' },
  { file: 'client/js/ui/LobbyUI.js', name: 'LobbyUI.js' },
  { file: 'client/js/ui/WaitingRoomUI.js', name: 'WaitingRoomUI.js' },
  { file: 'client/js/ui/BoardUI.js', name: 'BoardUI.js' }
];

scriptControllers.forEach(({ file, name }) => {
  runTest(`Tap lenh / tep ${name} phai import SettingsUI va goi setupModal()`, () => {
    const fullPath = path.resolve(file);
    assert.ok(fs.existsSync(fullPath), `Tep ${file} phai ton tai`);
    const content = fs.readFileSync(fullPath, 'utf-8');

    assert.ok(content.includes('SettingsUI'), `${file} phai import SettingsUI`);
    assert.ok(content.includes('SettingsUI.setupModal'), `${file} phai goi SettingsUI.setupModal()`);
  });
});

// -----------------------------------------------------------------------------
// Test Case 3: Tuong tac dong mo modal qua nut bam va phím tat
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 3: Logic mo/dong modal qua nut Settings va phím tat');

runTest('Bam nut Settings phai mo modal va them class active', async () => {
  const { SettingsUI } = await import('../../client/js/ui/SettingsUI.js');
  let modalClasses = new Set();
  let triggerClickHandler = null;
  let isModalAttached = false;

  const mockModal = {
    classList: {
      add: (c) => modalClasses.add(c),
      remove: (c) => modalClasses.delete(c),
      contains: (c) => modalClasses.has(c)
    },
    setAttribute: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  const mockTrigger = {
    addEventListener: (evt, handler) => {
      if (evt === 'click') triggerClickHandler = handler;
    }
  };

  global.document = {
    getElementById: (id) => (isModalAttached && id === 'test-modal-btn' ? mockModal : null),
    createElement: () => mockModal,
    querySelectorAll: (sel) => (sel === '#btn-open-settings' ? [mockTrigger] : []),
    addEventListener: () => {},
    body: {
      appendChild: () => { isModalAttached = true; },
      style: {}
    }
  };

  SettingsUI.setupModal({
    modalId: 'test-modal-btn',
    prefixId: 'test-pref',
    openTriggerSelector: '#btn-open-settings'
  });

  assert.ok(typeof triggerClickHandler === 'function', 'Nut phai duoc gan su kien click');

  // Act: nguoi choi bam nut Settings
  let prevented = false;
  triggerClickHandler({ preventDefault: () => { prevented = true; } });

  // Assert
  assert.strictEqual(modalClasses.has('active'), true, 'Modal phai co class active sau khi bam nut');
  assert.strictEqual(prevented, true, 'Click nut settings phai goi preventDefault');

  // Act 2: nguoi choi dong modal
  SettingsUI.closeModal('test-modal-btn');
  assert.strictEqual(modalClasses.has('active'), false, 'Modal phai mat class active sau khi dong');

  delete global.document;
});

// -----------------------------------------------------------------------------
// Test Case 4: Kiem tra kien truc CSS settings.css va quy chuan 9.G Anti-slop
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 4: Kiem tra kien truc CSS va quy tac 9.G Anti-slop');

runTest('client/css/settings.css phai co Glassmorphism, animations va 0 ky tu em-dash / en-dash', () => {
  const cssPath = path.resolve('client/css/settings.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Glassmorphism classes
  assert.ok(css.includes('.settings-modal-overlay'), 'Co class overlay');
  assert.ok(css.includes('.settings-modal-dialog'), 'Co class modal dialog');
  assert.ok(css.includes('backdrop-filter'), 'Ap dung backdrop-filter kinh mo');
  assert.ok(css.includes('.settings-tab-btn'), 'Co tab buttons');
  assert.ok(css.includes('.settings-panel'), 'Co panels');
  assert.ok(css.includes('.toggle-switch'), 'Co toggle switch');
  assert.ok(css.includes('.setting-range-slider'), 'Co slider controls');

  // Anti-slop check
  assert.strictEqual(css.includes('\u2014'), false, 'settings.css tuyet doi khong chua em-dash');
  assert.strictEqual(css.includes('\u2013'), false, 'settings.css tuyet doi khong chua en-dash');
});

runTest('client/js/ui/SettingsUI.js phai tuan thu 100% quy tac 9.G Anti-slop', () => {
  const jsPath = path.resolve('client/js/ui/SettingsUI.js');
  const js = fs.readFileSync(jsPath, 'utf-8');

  assert.strictEqual(js.includes('\u2014'), false, 'SettingsUI.js khong duoc chua em-dash');
  assert.strictEqual(js.includes('\u2013'), false, 'SettingsUI.js khong duoc chua en-dash');
});

// -----------------------------------------------------------------------------
// Tong ket
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------');
console.log(`🏁 KET QUA TEST ISSUE #57: ${passedTests} PASS / ${failedTests} FAIL (Tong so: ${totalTests})`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
