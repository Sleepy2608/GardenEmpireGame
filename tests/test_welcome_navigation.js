/**
 * Test Suite: Welcome Navigation & Play Button Click Flow
 * Framework: Node.js Native Runner
 * Quy chuẩn: AAA (Arrange - Act - Assert) theo .agents/test/test_agents.md
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { getRouteUrl } from '../client/js/utils/navigation.js';

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: WELCOME NAVIGATION & PLAY BUTTON FLOW');
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
    console.error(`     Chi tiết: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// Test Case 1: Navigation Utility Route Mapping
// -----------------------------------------------------------------------------
console.log('▶ Test Case 1: Route mapping trong client/js/utils/navigation.js');

runTest('getRouteUrl("index") trên môi trường production/Vercel phải trả về "/index" (không được trả về "/")', () => {
  // Giả lập window.location cho production
  global.window = {
    location: {
      hostname: 'garden-empire-game.vercel.app',
      port: '',
      pathname: '/'
    }
  };

  const url = getRouteUrl('index');
  assert.strictEqual(url, '/index', 'Route "index" phải trả về "/index" để không bị loop về "/"');
});

runTest('getRouteUrl("index") trên local python static server phải trả về "index.html"', () => {
  global.window = {
    location: {
      hostname: 'localhost',
      port: '5500',
      pathname: '/'
    }
  };

  const url = getRouteUrl('index');
  assert.strictEqual(url, 'index.html', 'Route "index" trên local port 5500 phải trả về "index.html"');
});

// -----------------------------------------------------------------------------
// Test Case 2: Vercel & Serve Rewrites Integrity
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Cấu hình Vercel & Serve Rewrites cho "/index"');

const vercelJson = JSON.parse(fs.readFileSync(path.resolve('./vercel.json'), 'utf-8'));
const serveJson = JSON.parse(fs.readFileSync(path.resolve('./client/serve.json'), 'utf-8'));

runTest('vercel.json phải có rewrite rõ ràng cho "/index" trỏ tới "/client/index.html"', () => {
  const indexRule = vercelJson.rewrites.find(r => r.source === '/index');
  assert.ok(indexRule, 'Phải có rewrite cho /index');
  assert.strictEqual(indexRule.destination, '/client/index.html');
});

runTest('vercel.json phải có rewrite cho "/index.html" trỏ tới "/client/index.html" chống redirect loop', () => {
  const indexHtmlRule = vercelJson.rewrites.find(r => r.source === '/index.html');
  assert.ok(indexHtmlRule, 'Phải có rewrite cho /index.html');
  assert.strictEqual(indexHtmlRule.destination, '/client/index.html');
});

runTest('client/serve.json phải có rewrite cho "/index" và "/index.html"', () => {
  const hasIndex = serveJson.rewrites.some(r => r.source === '/index' && r.destination === '/index.html');
  const hasIndexHtml = serveJson.rewrites.some(r => r.source === '/index.html' && r.destination === '/index.html');
  assert.ok(hasIndex, 'serve.json phải có rewrite cho /index');
  assert.ok(hasIndexHtml, 'serve.json phải có rewrite cho /index.html');
});

// -----------------------------------------------------------------------------
// Test Case 3: Welcome JS Event Listeners for Play Buttons
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 3: Xử lý click nút Bắt Đầu Chơi trong welcome.js');

const welcomeJs = fs.readFileSync(path.resolve('./client/js/welcome.js'), 'utf-8');

runTest('welcome.js phải có hàm initPlayNavigation xử lý click cho tất cả nút bắt đầu chơi', () => {
  assert.ok(welcomeJs.includes('initPlayNavigation'), 'welcome.js phải định nghĩa initPlayNavigation');
  assert.ok(welcomeJs.includes('#nav-btn-play'), 'Xử lý nút #nav-btn-play');
  assert.ok(welcomeJs.includes('#hero-btn-start'), 'Xử lý nút #hero-btn-start');
  assert.ok(welcomeJs.includes('#footer-btn-enter'), 'Xử lý nút #footer-btn-enter');
  assert.ok(welcomeJs.includes('e.preventDefault()'), 'Phải preventDefault để tránh Vercel 308 cleanUrls loop');
});

console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ TEST NAVIGATION: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${totalTests})`);
console.log('--------------------------------------------------------\n');

process.exit(failedTests > 0 ? 1 : 0);

