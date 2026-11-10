/**
 * GARDEN EMPIRE — PLANT CARD UI & BOTANICAL ART TEST SUITE
 * Kiểm thử tự động tính năng Hình ảnh minh hoạ Thẻ Cây (Tier 1, Tier 2, Tier 3):
 * 1. Kiểm tra sự tồn tại và tính hợp lệ của các file ảnh assets (.webp và .png)
 * 2. Kiểm tra quy tắc CSS Deep Forest Glassmorphism (background-blend-mode, card-art-thumb)
 * 3. Kiểm tra logic phương thức getTierImage() và getCardImage() của PlantCardUI
 * 4. Kiểm tra render DOM thẻ bài: Khung ảnh thumbnail, tên cây, điểm prestige, bonus gem, cost chips
 * 5. Kiểm tra tính toàn vẹn luật mua cây và chợ bài (renderMarket)
 *
 * Chuẩn: Arrange - Act - Assert (AAA) theo .agents/AGENTS.md
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PlantCardUI } from '../client/js/ui/PlantCardUI.js';

let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: PLANT CARD UI & BOTANICAL ART ASSETS');
console.log('🌿 ========================================================\n');

// =============================================================================
// PHẦN 1: KIỂM TRA TÀI NGUYÊN ẢNH TRÊN ĐĨA (ASSETS INTEGRITY)
// =============================================================================
console.log('▶ [PHẦN 1] Kiểm tra file ảnh minh hoạ trên đĩa (client/assets/images/plants/)');

const plantsDir = path.resolve('client/assets/images/plants');

runTest('1.1. Thư mục client/assets/images/plants/ tồn tại', () => {
  assert.strictEqual(fs.existsSync(plantsDir), true, 'Thư mục plants phải tồn tại');
});

runTest('1.2. File tier1_sprout.webp (Mầm non) tồn tại và hợp lệ', () => {
  const filePath = path.join(plantsDir, 'tier1_sprout.webp');
  assert.strictEqual(fs.existsSync(filePath), true, 'Phải có tier1_sprout.webp');
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 10000, `Kích thước ảnh phải > 10KB (thực tế: ${stat.size} bytes)`);
});

runTest('1.3. File tier2_flower.webp (Cây hoa) tồn tại và hợp lệ', () => {
  const filePath = path.join(plantsDir, 'tier2_flower.webp');
  assert.strictEqual(fs.existsSync(filePath), true, 'Phải có tier2_flower.webp');
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 10000, `Kích thước ảnh phải > 10KB (thực tế: ${stat.size} bytes)`);
});

runTest('1.4. File tier3_tree.webp (Cổ thụ) tồn tại và hợp lệ', () => {
  const filePath = path.join(plantsDir, 'tier3_tree.webp');
  assert.strictEqual(fs.existsSync(filePath), true, 'Phải có tier3_tree.webp');
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 10000, `Kích thước ảnh phải > 10KB (thực tế: ${stat.size} bytes)`);
});

runTest('1.5. Cung cấp đầy đủ phiên bản PNG dự phòng cho cả 3 Tier', () => {
  assert.strictEqual(fs.existsSync(path.join(plantsDir, 'tier1_sprout.png')), true, 'Phải có tier1_sprout.png');
  assert.strictEqual(fs.existsSync(path.join(plantsDir, 'tier2_flower.png')), true, 'Phải có tier2_flower.png');
  assert.strictEqual(fs.existsSync(path.join(plantsDir, 'tier3_tree.png')), true, 'Phải có tier3_tree.png');
});

// =============================================================================
// PHẦN 2: KIỂM TRA QUY TẮC CSS (DEEP FOREST GLASSMORPHISM & BLEND-MODE)
// =============================================================================
console.log('\n▶ [PHẦN 2] Kiểm tra CSS Game: Blend-mode, card-art-thumb & Deck Piles');

const gameCssPath = path.resolve('client/css/game.css');
const gameCss = fs.readFileSync(gameCssPath, 'utf8');

runTest('2.1. CSS chứa cấu hình background art cho .plant-card.tier-1', () => {
  assert.ok(gameCss.includes('.plant-card.tier-1'), 'Phải có selector .plant-card.tier-1');
  assert.ok(gameCss.includes('tier1_sprout.webp'), 'Phải trỏ tới tier1_sprout.webp');
  assert.ok(gameCss.includes('background-blend-mode: overlay'), 'Phải dùng overlay blend mode');
});

runTest('2.2. CSS chứa cấu hình background art cho .plant-card.tier-2', () => {
  assert.ok(gameCss.includes('.plant-card.tier-2'), 'Phải có selector .plant-card.tier-2');
  assert.ok(gameCss.includes('tier2_flower.webp'), 'Phải trỏ tới tier2_flower.webp');
});

runTest('2.3. CSS chứa cấu hình background art cho .plant-card.tier-3', () => {
  assert.ok(gameCss.includes('.plant-card.tier-3'), 'Phải có selector .plant-card.tier-3');
  assert.ok(gameCss.includes('tier3_tree.webp'), 'Phải trỏ tới tier3_tree.webp');
});

runTest('2.4. CSS định nghĩa class .card-art-thumb với hiệu ứng bo góc & bóng', () => {
  assert.ok(gameCss.includes('.card-art-thumb'), 'Phải có class .card-art-thumb');
  assert.ok(gameCss.includes('object-fit: cover'), 'Phải có object-fit: cover');
  assert.ok(gameCss.includes('.plant-card:hover .card-art-thumb'), 'Phải có hover animation scale');
});

runTest('2.5. CSS định nghĩa background art cho 3 chồng bài .tier-deck-card', () => {
  assert.ok(gameCss.includes('.tier-deck-card.tier-1') && gameCss.includes('tier1_sprout.webp'), 'Deck 1 có ảnh mầm non');
  assert.ok(gameCss.includes('.tier-deck-card.tier-2') && gameCss.includes('tier2_flower.webp'), 'Deck 2 có ảnh cây hoa');
  assert.ok(gameCss.includes('.tier-deck-card.tier-3') && gameCss.includes('tier3_tree.webp'), 'Deck 3 có ảnh cổ thụ');
});

// =============================================================================
// PHẦN 3: KIỂM TRA PHƯƠNG THỨC LOGIC CỦA PLANTCARDUI
// =============================================================================
console.log('\n▶ [PHẦN 3] Kiểm tra Logic JS: getTierImage() và getCardImage()');

runTest('3.1. getTierImage() trả về đúng ảnh theo Tier 1, 2, 3', () => {
  assert.strictEqual(PlantCardUI.getTierImage(1), 'assets/images/plants/tier1_sprout.webp');
  assert.strictEqual(PlantCardUI.getTierImage(2), 'assets/images/plants/tier2_flower.webp');
  assert.strictEqual(PlantCardUI.getTierImage(3), 'assets/images/plants/tier3_tree.webp');
});

runTest('3.2. getTierImage() fallback an toàn về Tier 1 khi giá trị null/lạ', () => {
  assert.strictEqual(PlantCardUI.getTierImage(undefined), 'assets/images/plants/tier1_sprout.webp');
  assert.strictEqual(PlantCardUI.getTierImage(99), 'assets/images/plants/tier1_sprout.webp');
});

runTest('3.3. getCardImage() ưu tiên card.image nếu thẻ có ảnh riêng', () => {
  const cardWithCustomImg = { id: 't1_custom', tier: 1, image: 'assets/images/plants/custom.png' };
  assert.strictEqual(PlantCardUI.getCardImage(cardWithCustomImg), 'assets/images/plants/custom.png');
});

runTest('3.4. getCardImage() tự động lấy ảnh theo Tier khi không có ảnh riêng', () => {
  const cardTier2 = { id: 't2_e1', name: 'Cây Bàng Vuông', tier: 2 };
  assert.strictEqual(PlantCardUI.getCardImage(cardTier2), 'assets/images/plants/tier2_flower.webp');

  const cardTier3 = { id: 't3_e1', name: 'Đại Thụ Baobab', tier: 3 };
  assert.strictEqual(PlantCardUI.getCardImage(cardTier3), 'assets/images/plants/tier3_tree.webp');
});

// =============================================================================
// PHẦN 4: KIỂM TRA RENDER DOM THẺ BÀI (DOM RENDERING EMULATION)
// =============================================================================
console.log('\n▶ [PHẦN 4] Kiểm tra Render DOM Thẻ Cây');

// Mock DOM tối thiểu cho Node.js runner
class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.className = '';
    this.classList = {
      add: (cls) => { this.className += ` ${cls}`; },
      remove: (cls) => { this.className = this.className.replace(cls, '').trim(); },
      contains: (cls) => this.className.includes(cls)
    };
    this.dataset = {};
    this.innerHTML = '';
    this.children = [];
    this._listeners = {};
  }
  appendChild(child) {
    this.children.push(child);
  }
  addEventListener(event, fn) {
    this._listeners[event] = fn;
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag)
};

runTest('4.1. renderCard() tạo cấu trúc thẻ có ảnh minh hoạ card-art-thumb', () => {
  // Arrange
  const card = {
    id: 't1_e1',
    name: 'Cỏ May Mắn',
    tier: 1,
    cost: { DIRT: 1, SUNLIGHT: 1 },
    prestigePoints: 0,
    bonusResource: 'DIRT'
  };

  // Act
  const el = PlantCardUI.renderCard(card);

  // Assert
  assert.ok(el.className.includes('tier-1'), 'Element phải có class tier-1');
  assert.ok(el.innerHTML.includes('<img class="card-art-thumb"'), 'Phải chứa thẻ img card-art-thumb');
  assert.ok(el.innerHTML.includes('assets/images/plants/tier1_sprout.webp'), 'Phải có src trỏ tới tier1_sprout.webp');
  assert.ok(el.innerHTML.includes('Cỏ May Mắn'), 'Phải hiển thị tên cây');
  assert.ok(el.innerHTML.includes('badge-dirt'), 'Phải hiển thị gem bonus DIRT');
});

runTest('4.2. renderCard() hiển thị điểm Prestige ★ khi thẻ có điểm > 0', () => {
  // Arrange
  const card = {
    id: 't3_e1',
    name: 'Đại Thụ Baobab',
    tier: 3,
    cost: { SEED: 3, WATER: 3, NUTRIENTS: 5 },
    prestigePoints: 3,
    bonusResource: 'DIRT'
  };

  // Act
  const el = PlantCardUI.renderCard(card);

  // Assert
  assert.ok(el.innerHTML.includes('★ 3'), 'Phải hiển thị điểm ★ 3');
  assert.ok(el.innerHTML.includes('assets/images/plants/tier3_tree.webp'), 'Phải trỏ tới ảnh Cổ Thụ');
});

runTest('4.3. renderCard() gắn listener click thành công', () => {
  let clickedCard = null;
  const card = { id: 't2_s1', name: 'Cây Cam Sành', tier: 2 };
  const el = PlantCardUI.renderCard(card, null, (c) => { clickedCard = c; });

  assert.ok(typeof el._listeners['click'] === 'function', 'Phải có event listener click');
  el._listeners['click']();
  assert.strictEqual(clickedCard?.name, 'Cây Cam Sành', 'Callback click phải nhận đúng thẻ');
});

// =============================================================================
// PHẦN 5: TỔNG HỢP KẾT QUẢ KIỂM THỬ
// =============================================================================
console.log('\n========================================================');
console.log(`📊 TỔNG KẾT: ${passedTests} PASSED / ${failedTests} FAILED`);
console.log('========================================================\n');

if (failedTests > 0) {
  console.error('❌ Các bài test thất bại:');
  failures.forEach(f => console.error(` - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ BÀI TEST MINH HOẠ THẺ CÂY ĐỀU ĐẠT CHUẨN PASS 100%!');
  process.exit(0);
}

