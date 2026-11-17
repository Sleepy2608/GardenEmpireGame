/**
 * GARDEN EMPIRE — SETTINGS MANAGER UNIT TEST SUITE (PHASE 1)
 * Kiểm thử toàn diện module SettingsManager quản lý cài đặt hệ thống:
 * - Khởi tạo giá trị mặc định, schema versioning
 * - Khôi phục và lưu trữ localStorage, tương thích ngược cờ âm thanh cũ
 * - Tính toán Effective BGM & SFX Volume (Master * Channel)
 * - Mute riêng biệt từng kênh và Mute toàn cục
 * - Đăng ký Event Listener và thông báo khi cấu hình thay đổi
 * - Tích hợp đồng bộ hai chiều với BGMController và SoundFX
 */

import { 
  SettingsManager, 
  DEFAULT_SETTINGS, 
  SETTINGS_STORAGE_KEY, 
  LEGACY_SOUND_MUTED_KEY, 
  LEGACY_BGM_VOLUME_KEY 
} from '../../client/js/settings/SettingsManager.js';

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

// Mock localStorage cho môi trường kiểm thử Node.js
let mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { mockStorage = {}; }
};

console.log('\n⚙️ ========================================================');
console.log('🧪 TEST SUITE: SETTINGS MANAGER & AUDIO SYNC (PHASE 1)');
console.log('⚙️ ========================================================\n');

// =============================================================================
// PHẦN 1: SCHEMA MẶC ĐỊNH & KHỞI TẠO BAN ĐẦU
// =============================================================================
console.log('▶ [PHẦN 1] Cấu Trúc Schema & Khởi Tạo Mặc Định');

{
  localStorage.clear();
  const manager = new SettingsManager();
  const s = manager.getSettings();

  assert(s.version === 1, 'Version schema mặc định là 1');
  assert(s.audio.masterVolume === 0.8, 'Master Volume mặc định là 0.8 (80%)');
  assert(s.audio.masterMuted === false, 'Master Muted mặc định là false');
  assert(s.audio.bgmVolume === 0.7, 'BGM Volume mặc định là 0.7 (70%)');
  assert(s.audio.bgmMuted === false, 'BGM Muted mặc định là false');
  assert(s.audio.sfxVolume === 1.0, 'SFX Volume mặc định là 1.0 (100%)');
  assert(s.audio.sfxMuted === false, 'SFX Muted mặc định là false');

  assert(s.display.particlesEnabled === true, 'Particles mặc định được bật');
  assert(s.display.reducedMotion === false, 'Reduced motion mặc định là false');
  assert(s.display.cardHoverZoom === true, 'Card hover zoom mặc định là true');

  assert(s.gameplay.turnAlertSound === true, 'Chuông báo tới lượt mặc định là true');
  assert(s.gameplay.chatMessageSound === true, 'Chuông báo tin nhắn chat mặc định là true');
  assert(s.gameplay.colorblindMode === false, 'Colorblind mode mặc định là false');
  assert(s.gameplay.botHintEnabled === false, 'Bot hint mặc định là false');
}

// =============================================================================
// PHẦN 2: LƯU TRỮ VÀ TƯƠNG THÍCH NGƯỢC LOCALSTORAGE
// =============================================================================
console.log('\n▶ [PHẦN 2] Đọc/Ghi LocalStorage & Tương Thích Ngược');

{
  // Kiểm tra lưu và khôi phục từ schema mới
  localStorage.clear();
  const manager1 = new SettingsManager();
  manager1.setMasterVolume(0.5);
  manager1.setBgmVolume(0.4);
  manager1.setDisplaySetting('particlesEnabled', false);

  assert(mockStorage[SETTINGS_STORAGE_KEY] !== undefined, 'Lưu dữ liệu vào SETTINGS_STORAGE_KEY');
  assert(mockStorage[LEGACY_SOUND_MUTED_KEY] === 'false', 'Đồng bộ cờ LEGACY_SOUND_MUTED_KEY');
  assert(mockStorage[LEGACY_BGM_VOLUME_KEY] === '0.4', 'Đồng bộ cờ LEGACY_BGM_VOLUME_KEY');

  const manager2 = new SettingsManager();
  const s2 = manager2.getSettings();
  assert(s2.audio.masterVolume === 0.5, 'Khôi phục đúng Master Volume sau khi tạo lại instance');
  assert(s2.audio.bgmVolume === 0.4, 'Khôi phục đúng BGM Volume');
  assert(s2.display.particlesEnabled === false, 'Khôi phục đúng Display Setting');
}

{
  // Kiểm tra tương thích ngược khi chỉ có key legacy
  localStorage.clear();
  mockStorage[LEGACY_SOUND_MUTED_KEY] = 'true';
  mockStorage[LEGACY_BGM_VOLUME_KEY] = '0.35';

  const managerLegacy = new SettingsManager();
  const sLegacy = managerLegacy.getSettings();
  assert(sLegacy.audio.masterMuted === true, 'Nhận diện đúng trạng thái mute từ key legacy');
  assert(sLegacy.audio.bgmVolume === 0.35, 'Nhận diện đúng BGM volume từ key legacy');
}

// =============================================================================
// PHẦN 3: TÍNH TOÁN ÂM LƯỢNG HIỆU LỰC (EFFECTIVE VOLUME MATRIX)
// =============================================================================
console.log('\n▶ [PHẦN 3] Ma Trận Âm Lượng Hiệu Lực (Effective Volume)');

{
  localStorage.clear();
  const manager = new SettingsManager();

  // Mặc định: Master = 0.8, BGM = 0.7 => Effective BGM = 0.8 * 0.7 = 0.56
  const effBgm = manager.getEffectiveBgmVolume();
  assert(Math.abs(effBgm - 0.56) < 0.001, 'Effective BGM = Master (0.8) * BGM (0.7) = 0.56', `Thực tế: ${effBgm}`);

  // Mặc định: Master = 0.8, SFX = 1.0 => Effective SFX = 0.8 * 1.0 = 0.8
  const effSfx = manager.getEffectiveSfxVolume();
  assert(Math.abs(effSfx - 0.8) < 0.001, 'Effective SFX = Master (0.8) * SFX (1.0) = 0.8', `Thực tế: ${effSfx}`);

  // Khi mute riêng BGM: BGM về 0, nhưng SFX vẫn giữ nguyên 0.8
  manager.setBgmMuted(true);
  assert(manager.getEffectiveBgmVolume() === 0, 'Effective BGM về 0 khi bgmMuted = true');
  assert(Math.abs(manager.getEffectiveSfxVolume() - 0.8) < 0.001, 'Effective SFX không bị ảnh hưởng khi chỉ mute BGM');

  // Khi bật lại BGM: Effective BGM phục hồi về 0.56
  manager.setBgmMuted(false);
  assert(Math.abs(manager.getEffectiveBgmVolume() - 0.56) < 0.001, 'Effective BGM phục hồi khi unmute BGM');

  // Khi mute riêng SFX: SFX về 0, nhưng BGM vẫn giữ nguyên 0.56
  manager.setSfxMuted(true);
  assert(manager.getEffectiveSfxVolume() === 0, 'Effective SFX về 0 khi sfxMuted = true');
  assert(Math.abs(manager.getEffectiveBgmVolume() - 0.56) < 0.001, 'Effective BGM không bị ảnh hưởng khi chỉ mute SFX');

  // Khi Master Muted = true: CẢ HAI ĐỀU VỀ 0
  manager.setMasterMuted(true);
  assert(manager.getEffectiveBgmVolume() === 0, 'Effective BGM về 0 khi masterMuted = true');
  assert(manager.getEffectiveSfxVolume() === 0, 'Effective SFX về 0 khi masterMuted = true');

  // Kiểm tra giới hạn kẹp biên clamp (0.0 đến 1.0)
  assert(manager.setMasterVolume(1.5) === 1.0, 'Kẹp trần Master Volume <= 1.0');
  assert(manager.setMasterVolume(-0.5) === 0.0, 'Kẹp sàn Master Volume >= 0.0');
  assert(manager.setBgmVolume(2.0) === 1.0, 'Kẹp trần BGM Volume <= 1.0');
  assert(manager.setSfxVolume(-1.0) === 0.0, 'Kẹp sàn SFX Volume >= 0.0');
}

// =============================================================================
// PHẦN 4: EVENT BUS & NOTIFICATIONS
// =============================================================================
console.log('\n▶ [PHẦN 4] Cơ Chế Đăng Ký Lắng Nghe Sự Kiện (Event Bus)');

{
  localStorage.clear();
  const manager = new SettingsManager();

  let eventFired = false;
  let receivedDetails = null;

  const unsubscribe = manager.addListener((details, allSettings) => {
    eventFired = true;
    receivedDetails = details;
  });

  manager.setMasterVolume(0.65);
  assert(eventFired === true, 'Listener được kích hoạt khi setMasterVolume');
  assert(receivedDetails.section === 'audio', 'Section là audio');
  assert(receivedDetails.key === 'masterVolume', 'Key là masterVolume');
  assert(receivedDetails.value === 0.65, 'Value là 0.65');

  // Thử hủy đăng ký
  eventFired = false;
  unsubscribe();
  manager.setMasterVolume(0.9);
  assert(eventFired === false, 'Listener không còn được gọi sau khi hủy đăng ký');
}

// =============================================================================
// PHẦN 5: TÍCH HỢP ĐỒNG BỘ VỚI BGMCONTROLLER & SOUNDFX
// =============================================================================
console.log('\n▶ [PHẦN 5] Tích Hợp Đồng Bộ Hai Chiều Với Audio Engines');

{
  localStorage.clear();
  const manager = new SettingsManager();

  // Mock BGMController
  const mockBgm = {
    appliedVol: null,
    isMutedVal: null,
    applySettingsVolume(vol, isMuted) {
      this.appliedVol = vol;
      this.isMutedVal = isMuted;
    }
  };

  // Mock SoundFX
  const mockSfx = {
    masterVol: null,
    mutedVal: null,
    setMasterVolume(vol) { this.masterVol = vol; },
    setMuted(muted) { this.mutedVal = muted; }
  };

  manager.attachBgmController(mockBgm);
  manager.attachSoundFx(mockSfx);

  // Kiểm tra khởi tạo
  assert(Math.abs(mockBgm.appliedVol - 0.56) < 0.001, 'BGM nhận đúng effective volume 0.56 khi attach');
  assert(mockBgm.isMutedVal === false, 'BGM nhận đúng trạng thái không mute');
  assert(Math.abs(mockSfx.masterVol - 0.8) < 0.001, 'SoundFX nhận đúng effective volume 0.8 khi attach');
  assert(mockSfx.mutedVal === false, 'SoundFX nhận đúng trạng thái không mute');

  // Đổi Master Volume
  manager.setMasterVolume(0.5);
  // BGM = 0.5 * 0.7 = 0.35, SFX = 0.5 * 1.0 = 0.5
  assert(Math.abs(mockBgm.appliedVol - 0.35) < 0.001, 'BGM cập nhật tức thì khi Master đổi thành 0.5');
  assert(Math.abs(mockSfx.masterVol - 0.5) < 0.001, 'SoundFX cập nhật tức thì khi Master đổi thành 0.5');

  // Mute riêng BGM
  manager.setBgmMuted(true);
  assert(mockBgm.appliedVol === 0, 'BGM lập tức hạ về 0 khi bgmMuted = true');
  assert(mockBgm.isMutedVal === true, 'BGM nhận cờ mute = true');
  assert(Math.abs(mockSfx.masterVol - 0.5) < 0.001, 'SoundFX vẫn phát bình thường khi chỉ mute BGM');

  // Reset to defaults
  manager.resetToDefaults();
  const resetS = manager.getSettings();
  assert(resetS.audio.masterVolume === 0.8, 'Master phục hồi về 0.8 sau resetToDefaults');
  assert(resetS.audio.bgmVolume === 0.7, 'BGM phục hồi về 0.7 sau resetToDefaults');
  assert(Math.abs(mockBgm.appliedVol - 0.56) < 0.001, 'BGM phục hồi về 0.56 sau resetToDefaults');
}

// =============================================================================
// TỔNG KẾT
// =============================================================================
console.log('\n========================================================');
console.log('🏁 TỔNG KẾT KIỂM THỬ SETTINGS MANAGER (PHASE 1)');
console.log('========================================================');
console.log(`✅ Thành công: ${passedTests} assertions`);

if (failedTests > 0) {
  console.error(`❌ Thất bại: ${failedTests} assertions`);
  process.exit(1);
} else {
  console.log(`🎉 TẤT CẢ ${passedTests} ASSERTIONS ĐÃ VƯỢT QUA (100% PASS)!`);
  process.exit(0);
}
