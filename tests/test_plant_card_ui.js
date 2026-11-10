/**
 * GARDEN EMPIRE — PLANT CARD UI & BOTANICAL REAL PHOTOS TEST SUITE
 * Kiểm thử tự động tính năng Hình ảnh minh hoạ Thẻ Cây Thực Tế (Full 40 Thẻ Tier 1 + 30 Thẻ Tier 2):
 * 1. Kiểm tra sự tồn tại và tính hợp lệ của toàn bộ 40 ảnh thực tế Tier 1 và 30 ảnh thực tế Tier 2 (.webp và .png)
 * 2. Kiểm tra quy tắc CSS Deep Forest Glassmorphism (background-blend-mode, card-art-thumb)
 * 3. Kiểm tra logic phương thức getTierImage() và getCardImage() của PlantCardUI cho cả 2 Tier
 * 4. Kiểm tra render DOM thẻ bài: Tự động gắn ảnh thực tế riêng theo từng ID thẻ
 * 5. Kiểm tra cơ chế Fallback an toàn (onerror, card không có ID)
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
console.log('🧪 TEST SUITE: FULL TIER 1 & TIER 2 REAL PLANT PHOTOS');
console.log('🌿 ========================================================\n');

// =============================================================================
// PHẦN 1: KIỂM TRA TÀI NGUYÊN ẢNH THỰC TẾ TRÊN ĐĨA (TIER 1 & TIER 2)
// =============================================================================
console.log('▶ [PHẦN 1] Kiểm tra file ảnh chụp thực tế trên đĩa (client/assets/images/plants/)');

const plantsDir = path.resolve('client/assets/images/plants');

runTest('1.1. Thư mục client/assets/images/plants/ tồn tại', () => {
  assert.strictEqual(fs.existsSync(plantsDir), true, 'Thư mục plants phải tồn tại');
});

runTest('1.2. Các ảnh mẫu đại diện 3 Tier (Mầm non, Cây hoa, Cổ thụ) tồn tại và hợp lệ', () => {
  ['tier1_sprout.webp', 'tier2_flower.webp', 'tier3_tree.webp'].forEach(file => {
    const p = path.join(plantsDir, file);
    assert.strictEqual(fs.existsSync(p), true, `Phải có ${file}`);
    assert.ok(fs.statSync(p).size > 10000, `${file} kích thước phải > 10KB`);
  });
});

const TIER_1_IDS = [
  't1_e1', 't1_e2', 't1_e3', 't1_e4', 't1_e5', 't1_e6', 't1_e7', 't1_e8',
  't1_s1', 't1_s2', 't1_s3', 't1_s4', 't1_s5', 't1_s6', 't1_s7', 't1_s8',
  't1_su1', 't1_su2', 't1_su3', 't1_su4', 't1_su5', 't1_su6', 't1_su7', 't1_su8',
  't1_w1', 't1_w2', 't1_w3', 't1_w4', 't1_w5', 't1_w6', 't1_w7', 't1_w8',
  't1_n1', 't1_n2', 't1_n3', 't1_n4', 't1_n5', 't1_n6', 't1_n7', 't1_n8'
];

const TIER_2_IDS = [
  't2_e1', 't2_e2', 't2_e3', 't2_e4', 't2_e5', 't2_e6',
  't2_s1', 't2_s2', 't2_s3', 't2_s4', 't2_s5', 't2_s6',
  't2_su1', 't2_su2', 't2_su3', 't2_su4', 't2_su5', 't2_su6',
  't2_w1', 't2_w2', 't2_w3', 't2_w4', 't2_w5', 't2_w6',
  't2_n1', 't2_n2', 't2_n3', 't2_n4', 't2_n5', 't2_n6'
];

runTest('1.3. Đầy đủ toàn bộ 40 file WebP & 40 file PNG ảnh thực tế cho thẻ Tier 1', () => {
  assert.strictEqual(TIER_1_IDS.length, 40, 'Tier 1 phải có đúng 40 thẻ bài');
  TIER_1_IDS.forEach(id => {
    const webpPath = path.join(plantsDir, `${id}.webp`);
    const pngPath = path.join(plantsDir, `${id}.png`);
    assert.strictEqual(fs.existsSync(webpPath), true, `Thiếu file: ${id}.webp`);
    assert.strictEqual(fs.existsSync(pngPath), true, `Thiếu file: ${id}.png`);
  });
});

runTest('1.4. Đầy đủ toàn bộ 30 file WebP & 30 file PNG ảnh thực tế cho thẻ Tier 2', () => {
  assert.strictEqual(TIER_2_IDS.length, 30, 'Tier 2 phải có đúng 30 thẻ bài');
  TIER_2_IDS.forEach(id => {
    const webpPath = path.join(plantsDir, `${id}.webp`);
    const pngPath = path.join(plantsDir, `${id}.png`);
    assert.strictEqual(fs.existsSync(webpPath), true, `Thiếu file: ${id}.webp`);
    assert.strictEqual(fs.existsSync(pngPath), true, `Thiếu file: ${id}.png`);
  });
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

runTest('3.3. getCardImage() trả về đúng ảnh thực tế riêng cho 40 thẻ Tier 1 (t1_e1 -> t1_n8)', () => {
  TIER_1_IDS.forEach(id => {
    const card = { id, tier: 1 };
    assert.strictEqual(PlantCardUI.getCardImage(card), `assets/images/plants/${id}.webp`, `Thẻ ${id} phải trả về ảnh thực tế ${id}.webp`);
  });
});

runTest('3.4. getCardImage() trả về đúng ảnh thực tế riêng cho 30 thẻ Tier 2 (t2_e1 -> t2_n6)', () => {
  TIER_2_IDS.forEach(id => {
    const card = { id, tier: 2 };
    assert.strictEqual(PlantCardUI.getCardImage(card), `assets/images/plants/${id}.webp`, `Thẻ ${id} phải trả về ảnh thực tế ${id}.webp`);
  });
});

runTest('3.5. getCardImage() ưu tiên card.image nếu thẻ có ảnh chỉ định riêng', () => {
  const cardWithCustomImg = { id: 't2_n1', tier: 2, image: 'assets/images/plants/custom.png' };
  assert.strictEqual(PlantCardUI.getCardImage(cardWithCustomImg), 'assets/images/plants/custom.png');
});

runTest('3.6. getCardImage() tự động fallback về ảnh Tier khi không có ID trong danh mục', () => {
  const cardUnknownT2 = { tier: 2 };
  assert.strictEqual(PlantCardUI.getCardImage(cardUnknownT2), 'assets/images/plants/tier2_flower.webp');

  const cardTier3 = { id: 't3_e1', name: 'Đại Thụ Baobab', tier: 3 };
  assert.strictEqual(PlantCardUI.getCardImage(cardTier3), 'assets/images/plants/tier3_tree.webp');

  const cardUnknown = { tier: 1 };
  assert.strictEqual(PlantCardUI.getCardImage(cardUnknown), 'assets/images/plants/tier1_sprout.webp');
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

runTest('4.1. renderCard() hiển thị ảnh thực tế riêng cho thẻ t1_e1 (Cỏ May Mắn)', () => {
  const card = {
    id: 't1_e1',
    name: 'Cỏ May Mắn',
    tier: 1,
    cost: { DIRT: 1, SUNLIGHT: 1 },
    prestigePoints: 0,
    bonusResource: 'DIRT'
  };

  const el = PlantCardUI.renderCard(card);
  assert.ok(el.className.includes('tier-1'), 'Element phải có class tier-1');
  assert.ok(el.innerHTML.includes('<img class="card-art-thumb"'), 'Phải chứa thẻ img card-art-thumb');
  assert.ok(el.innerHTML.includes('assets/images/plants/t1_e1.webp'), 'Phải có src trỏ tới t1_e1.webp');
  assert.ok(el.innerHTML.includes('Cỏ May Mắn'), 'Phải hiển thị tên cây');
});

runTest('4.2. renderCard() hiển thị ảnh thực tế riêng cho thẻ t2_n1 (Hoa Hồng Nhung)', () => {
  const card = {
    id: 't2_n1',
    name: 'Hoa Hồng Nhung',
    tier: 2,
    cost: { SEED: 3, SUNLIGHT: 3, NUTRIENTS: 2 },
    prestigePoints: 1,
    bonusResource: 'NUTRIENTS'
  };

  const el = PlantCardUI.renderCard(card);
  assert.ok(el.className.includes('tier-2'), 'Element phải có class tier-2');
  assert.ok(el.innerHTML.includes('assets/images/plants/t2_n1.webp'), 'Phải có src trỏ tới t2_n1.webp');
  assert.ok(el.innerHTML.includes('Hoa Hồng Nhung'), 'Phải hiển thị tên Hoa Hồng Nhung');
  assert.ok(el.innerHTML.includes('★ 1'), 'Phải hiển thị prestige point ★ 1');
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
  console.log('🎉 TẤT CẢ BÀI TEST ẢNH THỰC TẾ FULL TIER 1 & TIER 2 ĐỀU ĐẠT CHUẨN PASS 100%!');
  process.exit(0);
}
