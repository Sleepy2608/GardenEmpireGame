/**
 * GARDEN EMPIRE — BGM CONTROLLER UNIT TEST SUITE (PHASE 2)
 * Kiểm thử toàn diện module BGMController quản lý nhạc nền và hiệu ứng âm thanh
 */

import { BGMController, BGM_PHASES, BGM_TRACKS, bgmController } from '../client/js/ui/BGMController.js';

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

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Mock Audio element
class MockAudio {
  constructor() {
    this.src = '';
    this.loop = false;
    this.preload = '';
    this.volume = 1.0;
    this.paused = true;
    this.currentTime = 0;
    this.listeners = {};
    this.playCallCount = 0;
    this.pauseCallCount = 0;
    this.shouldRejectPlay = false;
  }

  addEventListener(event, fn) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== fn);
    }
  }

  play() {
    this.playCallCount++;
    if (this.shouldRejectPlay) {
      const err = new Error('Autoplay blocked');
      err.name = 'NotAllowedError';
      return Promise.reject(err);
    }
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.pauseCallCount++;
    this.paused = true;
  }
}

global.Audio = MockAudio;

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: BGM CONTROLLER (PHASE 2)');
console.log('🌿 ========================================================\n');

// ── PHẦN 1: Hằng Số & Cấu Trúc Khởi Tạo ──
console.log('▶ [PHẦN 1] Hằng Số Phase & Ánh Xạ Đường Dẫn Nhạc');
assert(BGM_PHASES.WELCOME === 'welcome', 'Phase WELCOME có giá trị "welcome"');
assert(BGM_PHASES.LOBBY === 'lobby', 'Phase LOBBY có giá trị "lobby"');
assert(BGM_PHASES.GAME_NORMAL === 'game-normal', 'Phase GAME_NORMAL có giá trị "game-normal"');
assert(BGM_PHASES.GAME_FINAL === 'game-final', 'Phase GAME_FINAL có giá trị "game-final"');
assert(BGM_PHASES.SILENCE === 'silence', 'Phase SILENCE có giá trị "silence"');

assert(BGM_TRACKS[BGM_PHASES.WELCOME] === 'assets/audio/bgm/welcome-bgm.mp3', 'Đường dẫn welcome-bgm.mp3 chính xác');
assert(BGM_TRACKS[BGM_PHASES.LOBBY] === 'assets/audio/bgm/lobby-bgm.mp3', 'Đường dẫn lobby-bgm.mp3 chính xác');
assert(BGM_TRACKS[BGM_PHASES.GAME_NORMAL] === 'assets/audio/bgm/game-normal-bgm.mp3', 'Đường dẫn game-normal-bgm.mp3 chính xác');
assert(BGM_TRACKS[BGM_PHASES.GAME_FINAL] === 'assets/audio/bgm/game-final-bgm.mp3', 'Đường dẫn game-final-bgm.mp3 chính xác');
assert(BGM_TRACKS[BGM_PHASES.SILENCE] === null, 'Phase SILENCE có track là null');

// ── PHẦN 2: Khởi Tạo Controller & Thuộc Tính Mặc Định ──
console.log('\n▶ [PHẦN 2] Khởi Tạo Controller & Options');
const ctrl = new BGMController({
  basePath: '/custom/',
  baseVolume: 0.3,
  duckVolume: 0.1,
  dangerVolume: 0.05
});

assert(ctrl.basePath === '/custom/', 'basePath được lưu đúng');
assert(ctrl.baseVolume === 0.3, 'baseVolume được lưu đúng');
assert(ctrl.duckVolume === 0.1, 'duckVolume được lưu đúng');
assert(ctrl.dangerVolume === 0.05, 'dangerVolume được lưu đúng');
assert(ctrl.currentPhase === BGM_PHASES.SILENCE, 'Khởi tạo mặc định ở phase SILENCE');

const mockAudio = new MockAudio();
ctrl.init(mockAudio);
assert(ctrl.audio === mockAudio, 'Audio element được gán thành công');
assert(mockAudio.loop === true, 'Audio được cấu hình loop = true');
assert(mockAudio.preload === 'auto', 'Audio được cấu hình preload = "auto"');
assert(ctrl.getTrackUrl(BGM_PHASES.WELCOME) === '/custom/assets/audio/bgm/welcome-bgm.mp3', 'getTrackUrl kết hợp đúng basePath');

// ── PHẦN 3: Quản Lý Âm Lượng & Mute ──
console.log('\n▶ [PHẦN 3] Quản Lý Âm Lượng (Volume) & Tắt Âm (Mute)');
ctrl.setVolume(0.4);
assert(ctrl.baseVolume === 0.4, 'setVolume cập nhật baseVolume thành 0.4');
assert(mockAudio.volume === 0.4, 'mockAudio.volume được đồng bộ thành 0.4');
assert(localStorage.getItem('garden_empire_bgm_volume') === '0.4', 'Âm lượng được lưu vào localStorage');

ctrl.setVolume(1.5);
assert(ctrl.baseVolume === 1.0, 'setVolume kẹp trần tối đa 1.0');
ctrl.setVolume(-0.5);
assert(ctrl.baseVolume === 0.0, 'setVolume kẹp đáy tối thiểu 0.0');

// Khôi phục volume chuẩn
ctrl.setVolume(0.25);

// Test Toggle Mute
const initialMute = ctrl.isMuted;
const newMute = ctrl.toggleMute();
assert(newMute === !initialMute, 'toggleMute đổi trạng thái mute');
assert(ctrl.isMuted === newMute, 'Getter isMuted trả về trạng thái mới');
assert(mockAudio.volume === 0, 'Khi mute, mockAudio.volume bị hạ về 0');
assert(localStorage.getItem('garden_empire_sound_muted') === String(newMute), 'Mute state được lưu vào localStorage');

// Toggle lại để un-mute
ctrl.toggleMute();
assert(ctrl.isMuted === false, 'Un-mute thành công');
assert(mockAudio.volume === 0.25, 'Khôi phục volume chuẩn 0.25 sau khi un-mute');

// ── PHẦN 4: Chuyển Đổi Giai Đoạn (Phase Transitions) ──
console.log('\n▶ [PHẦN 4] Chuyển Đổi Giai Đoạn (setPhase)');
async function testTransitions() {
  await ctrl.setPhase(BGM_PHASES.WELCOME, 50);
  assert(ctrl.currentPhase === BGM_PHASES.WELCOME, 'Chuyển sang phase WELCOME thành công');
  assert(mockAudio.src.includes('welcome-bgm.mp3'), 'Audio src chứa welcome-bgm.mp3');
  assert(mockAudio.paused === false, 'Audio đang phát (play called)');

  await ctrl.setPhase(BGM_PHASES.LOBBY, 50);
  assert(ctrl.currentPhase === BGM_PHASES.LOBBY, 'Chuyển sang phase LOBBY thành công');
  assert(mockAudio.src.includes('lobby-bgm.mp3'), 'Audio src chứa lobby-bgm.mp3');

  await ctrl.setPhase(BGM_PHASES.GAME_NORMAL, 50);
  assert(ctrl.currentPhase === BGM_PHASES.GAME_NORMAL, 'Chuyển sang phase GAME_NORMAL thành công');
  assert(mockAudio.src.includes('game-normal-bgm.mp3'), 'Audio src chứa game-normal-bgm.mp3');

  await ctrl.setPhase(BGM_PHASES.GAME_FINAL, 50);
  assert(ctrl.currentPhase === BGM_PHASES.GAME_FINAL, 'Chuyển sang phase GAME_FINAL thành công');
  assert(mockAudio.src.includes('game-final-bgm.mp3'), 'Audio src chứa game-final-bgm.mp3');

  await ctrl.setPhase(BGM_PHASES.SILENCE, 50);
  assert(ctrl.currentPhase === BGM_PHASES.SILENCE, 'Chuyển sang phase SILENCE thành công');
  assert(mockAudio.paused === true, 'Audio tạm dừng khi ở phase SILENCE');
}

// ── PHẦN 5: Ducking & Unducking Âm Lượng ──
console.log('\n▶ [PHẦN 5] Ducking Âm Lượng Khi Phát SFX');
async function testDucking() {
  await ctrl.setPhase(BGM_PHASES.GAME_NORMAL, 50);
  assert(mockAudio.volume === 0.25, 'Volume trước ducking là 0.25');

  await ctrl.duck(0.08, 50);
  assert(mockAudio.volume <= 0.085, `Volume sau khi duck giảm xuống xấp xỉ 0.08 (thực tế: ${mockAudio.volume})`);

  await ctrl.unduck(50);
  assert(mockAudio.volume >= 0.24, `Volume sau khi unduck phục hồi xấp xỉ 0.25 (thực tế: ${mockAudio.volume})`);
}

// ── PHẦN 6: Khả Năng Kháng Lỗi Trình Duyệt Autoplay Policy ──
console.log('\n▶ [PHẦN 6] Xử Lý Autoplay Policy (NotAllowedError)');
async function testAutoplayResilience() {
  const resilientAudio = new MockAudio();
  resilientAudio.shouldRejectPlay = true; // Giả lập trình duyệt chặn autoplay
  
  const resilientCtrl = new BGMController();
  resilientCtrl.init(resilientAudio);

  let thrown = false;
  try {
    await resilientCtrl.play();
  } catch (e) {
    thrown = true;
  }

  assert(!thrown, 'play() không ném Exception khi bị chặn bởi autoplay policy');
  assert(resilientCtrl._pendingPlay === true, 'Đánh dấu cờ _pendingPlay để đợi tương tác người dùng');

  // Giả lập người dùng tương tác mở khóa
  resilientAudio.shouldRejectPlay = false;
  resilientCtrl._handleUserInteraction();
  assert(resilientAudio.playCallCount >= 2, 'Gọi lại play() tự động sau cử chỉ người dùng');
}

// ── PHẦN 7: Dọn Dẹp Tài Nguyên (Cleanup) ──
console.log('\n▶ [PHẦN 7] Dọn Dẹp & Giải Phóng (cleanup)');
function testCleanup() {
  ctrl.cleanup();
  assert(ctrl.currentPhase === BGM_PHASES.SILENCE, 'cleanup() đặt lại phase về SILENCE');
  assert(ctrl.isPlaying === false, 'cleanup() dừng phát âm thanh');
  assert(mockAudio.src === '', 'cleanup() giải phóng nguồn âm thanh');
}

// Chạy chuỗi kiểm thử bất đồng bộ
async function runAllTests() {
  await testTransitions();
  await testDucking();
  await testAutoplayResilience();
  testCleanup();

  console.log('\n🌿 ========================================================');
  console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} ĐẠT, ${failedTests} THẤT BẠI`);
  console.log('🌿 ========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
