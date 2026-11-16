/**
 * GARDEN EMPIRE - AUTOMATED TEST RUNNER (ALL SUITES)
 * Runs all standalone unit, DOM and UI test suites.
 * Exits with 0 if all pass, 1 if any fail.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testSuites = [
  'test_welcome_dashboard_ui.js',
  'test_welcome_navigation.js',
  'test_rules_ui.js',
  'test_player_box_ui.js',
  'test_plant_card_ui.js',
  'test_player_leave_notification_ui.js',
  'test_endgame_announcement_ui.js',
  'test_chat_toggle_ui.js',
  'test_issue_15_verification.js',
  'test_issue_30_verification.js',
  'test_game_log_toggle_3_recent.js',
  'test_waiting_room_turn_duration_ui.js',
  'test_board_turn_timer_ui.js',
  'test_afk_and_kick_flow.js',
  'test_bgm_controller.js',
  'test_music_integration.js'
];

console.log('\n🌿 ========================================================');
console.log('🧪 GARDEN EMPIRE — AUTOMATED FRONTEND TEST RUNNER');
console.log('🌿 ========================================================\n');

let failedSuites = [];

for (const suite of testSuites) {
  const suitePath = path.join(__dirname, suite);
  console.log(`\n▶ [RUNNING] node tests/${suite}`);
  const result = spawnSync(process.execPath, [suitePath], { stdio: 'inherit' });
  if (result.status !== 0) {
    failedSuites.push(suite);
  }
}

console.log('\n========================================================');
console.log('🏁 TỔNG KẾT TOÀN BỘ BỘ TEST FRONTEND');
console.log('========================================================');
console.log(`✅ Thành công: ${testSuites.length - failedSuites.length} / ${testSuites.length} test suites`);

if (failedSuites.length > 0) {
  console.error(`❌ Thất bại: ${failedSuites.length} suites (${failedSuites.join(', ')})`);
  process.exit(1);
} else {
  console.log(`🎉 TẤT CẢ ${testSuites.length} TEST SUITES FRONTEND ĐÃ VƯỢT QUA (100% PASS)!`);
  process.exit(0);
}

