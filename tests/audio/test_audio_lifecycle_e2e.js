/**
 * GARDEN EMPIRE — END-TO-END AUDIO LIFECYCLE & MANUAL QA AUTOMATION (PHASE 4)
 * Mô phỏng toàn bộ hành trình trải nghiệm âm thanh của người chơi từ Cổng Chào Đón đến Bục Vinh Quang
 */

import { BGMController, BGM_PHASES, BGM_TRACKS } from '../client/js/ui/BGMController.js';
import { SoundFX } from '../client/js/ui/SoundFX.js';

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

// Mock LocalStorage
const memoryStorage = {};
global.localStorage = {
  getItem: (key) => memoryStorage[key] || null,
  setItem: (key, val) => { memoryStorage[key] = String(val); },
  removeItem: (key) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
};

// Mock Audio Element with event tracking
class LifecycleMockAudio {
  constructor() {
    this.src = '';
    this.loop = false;
    this.preload = '';
    this.volume = 1.0;
    this.paused = true;
    this.currentTime = 0;
    this.playHistory = [];
    this.pauseHistory = [];
  }

  play() {
    this.paused = false;
    this.playHistory.push({ time: Date.now(), src: this.src });
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.pauseHistory.push({ time: Date.now(), src: this.src });
  }

  addEventListener() {}
  removeEventListener() {}
}

global.Audio = LifecycleMockAudio;

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: COMPLETE AUDIO LIFECYCLE & QA AUTOMATION');
console.log('🌿 ========================================================\n');

async function runE2ETests() {
  const audio = new LifecycleMockAudio();
  const bgm = new BGMController({ baseVolume: 0.25, duckVolume: 0.08, dangerVolume: 0.05 });
  bgm.init(audio);

  // ── BƯỚC 1: Người chơi truy cập Welcome Portal ──
  console.log('▶ [BƯỚC 1] Khởi Động Tại Cổng Chào Đón (Welcome Portal)');
  await bgm.setPhase(BGM_PHASES.WELCOME, 30);
  assert(bgm.currentPhase === BGM_PHASES.WELCOME, 'BGM ở phase WELCOME');
  assert(audio.src.includes('welcome-bgm.mp3'), 'Nguồn âm thanh là welcome-bgm.mp3');
  assert(audio.paused === false, 'Nhạc nền đang tự động phát');
  assert(audio.volume === 0.25, 'Âm lượng khởi điểm là 0.25');

  // ── BƯỚC 2: Điều hướng vào Sảnh Chờ (Lobby) ──
  console.log('\n▶ [BƯỚC 2] Điều Hướng Vào Sảnh Chờ (Lobby)');
  await bgm.setPhase(BGM_PHASES.LOBBY, 30);
  assert(bgm.currentPhase === BGM_PHASES.LOBBY, 'BGM chuyển sang phase LOBBY');
  assert(audio.src.includes('lobby-bgm.mp3'), 'Nguồn âm thanh chuyển sang lobby-bgm.mp3');
  assert(audio.paused === false, 'Nhạc nền sảnh tiếp tục phát');

  // ── BƯỚC 3: Vào Phòng Chờ (Waiting Room) ──
  console.log('\n▶ [BƯỚC 3] Tham Gia Phòng Chờ (Waiting Room)');
  // Phase LOBBY được dùng chung cho cả lobby & waiting room
  await bgm.setPhase(BGM_PHASES.LOBBY, 30);
  assert(bgm.currentPhase === BGM_PHASES.LOBBY, 'Duy trì phase LOBBY mượt mà, không load lại bài nếu cùng phase');
  assert(audio.src.includes('lobby-bgm.mp3'), 'Vẫn giữ lobby-bgm.mp3');

  // ── BƯỚC 4: Bắt Đầu Ván Đấu (Tabletop In-Game) ──
  console.log('\n▶ [BƯỚC 4] Bắt Đầu Trận Đấu Bàn Cờ (Game Normal Turn)');
  await bgm.setPhase(BGM_PHASES.GAME_NORMAL, 30);
  assert(bgm.currentPhase === BGM_PHASES.GAME_NORMAL, 'BGM chuyển sang phase GAME_NORMAL');
  assert(audio.src.includes('game-normal-bgm.mp3'), 'Nguồn âm thanh chuyển sang game-normal-bgm.mp3');
  assert(audio.volume === 0.25, 'Âm lượng nền tập trung chiến thuật 0.25');

  // ── BƯỚC 5: Đồng Hồ Lượt Đi Đếm Ngược Nguy Hiểm <= 10s ──
  console.log('\n▶ [BƯỚC 5] Cảnh Báo Hết Giờ (Turn Timer Danger <= 10s)');
  await bgm.duck(0.05, 30);
  assert(audio.volume <= 0.055, `BGM hạ âm lượng xuống mức nguy hiểm 0.05 (thực tế: ${audio.volume})`);

  // ── BƯỚC 6: Người Chơi Hoàn Thành Lượt Đi ──
  console.log('\n▶ [BƯỚC 6] Kết Thúc Lượt Đi (Stop Timer & Unduck)');
  await bgm.unduck(30);
  assert(audio.volume >= 0.24, `BGM phục hồi êm ái về âm lượng chuẩn 0.25 (thực tế: ${audio.volume})`);

  // ── BƯỚC 7: Kích Hoạt Vòng Chung Kết (Final Round) ──
  console.log('\n▶ [BƯỚC 7] Kích Hoạt Vòng Chung Kết (Final Round >= 15 Điểm)');
  await bgm.setPhase(BGM_PHASES.GAME_FINAL, 30);
  assert(bgm.currentPhase === BGM_PHASES.GAME_FINAL, 'BGM chuyển sang phase GAME_FINAL');
  assert(audio.src.includes('game-final-bgm.mp3'), 'Nguồn âm thanh chuyển sang game-final-bgm.mp3');
  assert(audio.paused === false, 'Nhạc nền chung kết phát liên tục');

  // ── BƯỚC 8: Kết Thúc Trận Đấu & Bục Vinh Danh ──
  console.log('\n▶ [BƯỚC 8] Trận Đấu Kết Thúc (Victory Fanfare)');
  bgm.pause();
  assert(audio.paused === true, 'BGM dừng phát để nhường chỗ cho kèn chiến thắng');
  
  // Phát fanfare
  let fanfareTriggered = false;
  try {
    SoundFX.playVictorySound();
    fanfareTriggered = true;
  } catch (_) {}
  assert(fanfareTriggered === true, 'SoundFX.playVictorySound() phát lệnh kèn thành công');

  // ── BƯỚC 9: Đồng Bộ Tắt/Bật Mute Toàn Hệ Thống ──
  console.log('\n▶ [BƯỚC 9] Đồng Bộ Tắt/Bật Âm Thanh Toàn Hệ Thống');
  const muted = bgm.toggleMute();
  assert(muted === true, 'BGM chuyển sang trạng thái Muted');
  assert(audio.volume === 0, 'Âm lượng thực tế của thẻ Audio bằng 0');
  assert(localStorage.getItem('garden_empire_sound_muted') === 'true', 'Lưu mute = true vào localStorage');

  // ── BƯỚC 10: Khởi Tạo Lại (Giả Lập F5 Tải Lại Trang) ──
  console.log('\n▶ [BƯỚC 10] Khởi Tạo Lại Trang (Persist Preference Sau F5)');
  const reloadedAudio = new LifecycleMockAudio();
  const reloadedBgm = new BGMController();
  reloadedBgm.init(reloadedAudio);

  assert(reloadedBgm.isMuted === true, 'Sau khi tải lại trang, trạng thái Muted vẫn được bảo toàn');
  assert(reloadedAudio.volume === 0, 'Audio element khởi tạo với volume = 0 khi đang muted');

  console.log('\n🌿 ========================================================');
  console.log(`🏁 KẾT QUẢ KIỂM THỬ LIFECYCLE: ${passedTests} ĐẠT, ${failedTests} THẤT BẠI`);
  console.log('🌿 ========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runE2ETests();
