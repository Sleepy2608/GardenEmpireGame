/**
 * GARDEN EMPIRE — AUTOMATED RECURSIVE TEST RUNNER
 * Tự động quét và thực thi đệ quy toàn bộ test suites trong tests/
 * Hỗ trợ các module: welcome/, ui/, bot/, audio/, regression/, e2e/
 * Exits with 0 if all pass, 1 if any fail.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const includeLiveE2E = process.argv.includes('--e2e') || process.argv.includes('--all');

/**
 * Quét đệ quy tìm kiếm tất cả các tệp kiểm thử test_*.js
 */
function findTestSuitesRecursively(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'screenshots' || entry.name === 'node_modules') {
        continue;
      }
      if (entry.name === 'e2e' && !includeLiveE2E) {
        continue;
      }
      results = results.concat(findTestSuitesRecursively(fullPath));
    } else if (entry.isFile()) {
      if (entry.name.startsWith('test_') && entry.name.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// Thứ tự ưu tiên module để hiển thị báo cáo mạch lạc
const folderPriority = ['welcome', 'ui', 'bot', 'audio', 'regression', 'e2e'];

function getPriority(filePath) {
  const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
  const folder = relPath.split('/')[0];
  const idx = folderPriority.indexOf(folder);
  return idx !== -1 ? idx : 99;
}

const testSuites = findTestSuitesRecursively(__dirname).sort((a, b) => {
  const pA = getPriority(a);
  const pB = getPriority(b);
  if (pA !== pB) return pA - pB;
  return a.localeCompare(b);
});

console.log('\n🌿 ========================================================');
console.log('🧪 GARDEN EMPIRE — AUTOMATED RECURSIVE TEST RUNNER');
console.log('🌿 ========================================================');
console.log(`🔍 Tự động phát hiện: ${testSuites.length} test suites`);
if (!includeLiveE2E) {
  console.log('💡 Ghi chú: Đang bỏ qua các bài test Live WebSocket (dùng --e2e để chạy cùng server).');
}
console.log('');

let failedSuites = [];
const startTime = Date.now();

for (const suitePath of testSuites) {
  const relPath = path.relative(__dirname, suitePath).replace(/\\/g, '/');
  const category = relPath.split('/')[0].toUpperCase();
  console.log(`\n▶ [${category}] node tests/${relPath}`);

  const result = spawnSync(process.execPath, [suitePath], { stdio: 'inherit' });
  if (result.status !== 0) {
    failedSuites.push(relPath);
  }
}

const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n========================================================');
console.log('🏁 TỔNG KẾT TOÀN BỘ BỘ TEST FRONTEND (RECURSIVE)');
console.log('========================================================');
console.log(`⏱️ Thời gian thực thi: ${elapsedSeconds}s`);
console.log(`✅ Thành công: ${testSuites.length - failedSuites.length} / ${testSuites.length} test suites`);

if (failedSuites.length > 0) {
  console.error(`❌ Thất bại: ${failedSuites.length} suites (${failedSuites.join(', ')})`);
  process.exit(1);
} else {
  console.log(`🎉 TẤT CẢ ${testSuites.length} TEST SUITES FRONTEND ĐÃ VƯỢT QUA (100% PASS)!`);
  process.exit(0);
}
