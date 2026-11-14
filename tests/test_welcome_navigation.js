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

runTest('getRouteUrl("play") và getRouteUrl("index") trên môi trường production/Vercel phải trả về "/play"', () => {
  // Giả lập window.location cho production
  global.window = {
    location: {
      hostname: 'garden-empire-game.vercel.app',
      port: '',
      pathname: '/',
      protocol: 'https:'
    }
  };

  const playUrl = getRouteUrl('play');
  const indexUrl = getRouteUrl('index');
  assert.strictEqual(playUrl, '/play', 'Route "play" phải trả về "/play"');
  assert.strictEqual(indexUrl, '/play', 'Route "index" phải trả về "/play" để không bị loop về "/"');
});

runTest('getRouteUrl("play") và getRouteUrl("index") trên local python static server phải trả về "play.html"', () => {
  global.window = {
    location: {
      hostname: 'localhost',
      port: '5500',
      pathname: '/',
      protocol: 'http:'
    }
  };

  const playUrl = getRouteUrl('play');
  const indexUrl = getRouteUrl('index');
  assert.strictEqual(playUrl, 'play.html', 'Route "play" trên local port 5500 phải trả về "play.html"');
  assert.strictEqual(indexUrl, 'play.html', 'Route "index" trên local port 5500 phải trả về "play.html"');
});

// -----------------------------------------------------------------------------
// Test Case 2: Vercel & Serve Rewrites Integrity
// -----------------------------------------------------------------------------
console.log('\n▶ Test Case 2: Cấu hình Vercel & Serve Rewrites cho "/play" và "/index"');

const vercelJson = JSON.parse(fs.readFileSync(path.resolve('./vercel.json'), 'utf-8'));
const serveJson = JSON.parse(fs.readFileSync(path.resolve('./client/serve.json'), 'utf-8'));

runTest('vercel.json phải có rewrite cho "/play" và "/index" trỏ tới "/client/play.html"', () => {
  const playRule = vercelJson.rewrites.find(r => r.source === '/play');
  const indexRule = vercelJson.rewrites.find(r => r.source === '/index');
  assert.ok(playRule, 'Phải có rewrite cho /play');
  assert.strictEqual(playRule.destination, '/client/play.html');
  assert.ok(indexRule, 'Phải có rewrite cho /index');
  assert.strictEqual(indexRule.destination, '/client/play.html');
});

runTest('vercel.json phải có rewrite cho "/play.html" và "/index.html" chống redirect loop', () => {
  const playHtmlRule = vercelJson.rewrites.find(r => r.source === '/play.html');
  const indexHtmlRule = vercelJson.rewrites.find(r => r.source === '/index.html');
  assert.ok(playHtmlRule, 'Phải có rewrite cho /play.html');
  assert.strictEqual(playHtmlRule.destination, '/client/play.html');
  assert.ok(indexHtmlRule, 'Phải có rewrite cho /index.html');
  assert.strictEqual(indexHtmlRule.destination, '/client/play.html');
});

runTest('client/serve.json phải có rewrite cho "/play" và "/index"', () => {
  const hasPlay = serveJson.rewrites.some(r => r.source === '/play' && r.destination === '/play.html');
  const hasIndex = serveJson.rewrites.some(r => r.source === '/index' && r.destination === '/play.html');
  assert.ok(hasPlay, 'serve.json phải có rewrite cho /play');
  assert.ok(hasIndex, 'serve.json phải có rewrite cho /index');
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
  assert.ok(welcomeJs.includes('play.html'), 'Có fallback điều hướng sang play.html trên môi trường local');
  assert.ok(welcomeJs.includes('/play'), 'Có điều hướng sang /play trên môi trường production');
});

console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ TEST NAVIGATION: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${totalTests})`);
console.log('--------------------------------------------------------\n');

process.exit(failedTests > 0 ? 1 : 0);

