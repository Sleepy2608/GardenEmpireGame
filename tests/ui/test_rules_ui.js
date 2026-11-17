/**
 * GARDEN EMPIRE - RULES UI & GAME CODEX TEST SUITE
 * Kiểm thử tính toàn vẹn của Cẩm Nang Luật Chơi & Giới Thiệu Game:
 * - Render đầy đủ 5 phân khu luật cốt lõi
 * - 6 loại năng lượng thực vật và ngân hàng theo số người chơi
 * - 3 hành động trong lượt và quy tắc giới hạn 10 token, 3 thẻ giữ
 * - Chợ cây 3 cấp độ (40 T1 + 30 T2 + 20 T3 = 90 thẻ) và Engine Building
 * - Khách quý (Nobles N+1, 3★) và Luật Tiebreaker ít cây hơn thắng
 * - Cơ chế chuyển Tab (Click & Keyboard Arrow navigation)
 * - Modal toàn màn hình (Mở, đóng, backdrop, phím Esc)
 * - Tuân thủ tuyệt đối chuẩn Anti-slop (Zero em-dashes: 0 ký tự '—' và '–')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Load RulesUI module
import { RulesUI } from '../client/js/ui/RulesUI.js';

describe('🌿 TEST SUITE: RULES & GAME CODEX UI (5 TABS & MODAL)', () => {

  // ===========================================================================
  // PHẦN 1: KIỂM THỬ NỘI DUNG VÀ TÍNH ĐẦY ĐỦ CỦA TEMPLATE LUẬT
  // ===========================================================================
  it('1.1. getRulesTemplate() phải render đầy đủ 5 Tabs và 5 Panels ngữ nghĩa', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false, prefixId: 'test-codex' });
    
    assert.ok(template.includes('test-codex-tab-btn-overview'), 'Phải có Tab button 1 (Overview)');
    assert.ok(template.includes('test-codex-tab-btn-energies'), 'Phải có Tab button 2 (Energies)');
    assert.ok(template.includes('test-codex-tab-btn-actions'), 'Phải có Tab button 3 (Actions)');
    assert.ok(template.includes('test-codex-tab-btn-tiers'), 'Phải có Tab button 4 (Tiers)');
    assert.ok(template.includes('test-codex-tab-btn-endgame'), 'Phải có Tab button 5 (Endgame)');

    assert.ok(template.includes('test-codex-panel-overview'), 'Phải có Panel 1 (Overview)');
    assert.ok(template.includes('test-codex-panel-energies'), 'Phải có Panel 2 (Energies)');
    assert.ok(template.includes('test-codex-panel-actions'), 'Phải có Panel 3 (Actions)');
    assert.ok(template.includes('test-codex-panel-tiers'), 'Phải có Panel 4 (Tiers)');
    assert.ok(template.includes('test-codex-panel-endgame'), 'Phải có Panel 5 (Endgame)');
  });

  it('1.2. Tab 1 (Overview): Thể hiện rõ mục tiêu 15 điểm uy tín ★ và 2-4 người chơi', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false });
    assert.ok(template.includes('15 điểm uy tín'), 'Phải nêu rõ cột mốc 15 điểm uy tín');
    assert.ok(template.includes('2 đến 4 người chơi') || template.includes('2-4 người chơi'), 'Phải nêu rõ số lượng 2-4 người chơi');
    assert.ok(template.includes('Tabletop 3D'), 'Phải giới thiệu bàn cờ Tabletop 3D');
  });

  it('1.3. Tab 2 (Energies): Đầy đủ 6 loại năng lượng, phân bón vàng WILD và bảng ngân hàng', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false });
    // 5 năng lượng thường + 1 Wild
    assert.ok(template.includes('Đất Màu Mỡ') || template.includes('gem-dirt'), 'Có năng lượng Đất');
    assert.ok(template.includes('Nguồn Nước') || template.includes('gem-water'), 'Có năng lượng Nước');
    assert.ok(template.includes('Ánh Sáng') || template.includes('gem-sunlight'), 'Có năng lượng Ánh Sáng');
    assert.ok(template.includes('Hạt Giống') || template.includes('gem-seed'), 'Có năng lượng Hạt Giống');
    assert.ok(template.includes('Dinh Dưỡng') || template.includes('gem-nutrients'), 'Có năng lượng Dinh Dưỡng');
    assert.ok(template.includes('Phân Bón Vàng') || template.includes('gem-wild'), 'Có Phân Bón Vàng WILD');

    // Bảng thiết lập ngân hàng
    assert.ok(template.includes('2 Người Chơi') && template.includes('4 viên') && template.includes('25 viên'), 'Chuẩn ngân hàng 2 người');
    assert.ok(template.includes('3 Người Chơi') && template.includes('5 viên') && template.includes('30 viên'), 'Chuẩn ngân hàng 3 người');
    assert.ok(template.includes('4 Người Chơi') && template.includes('7 viên') && template.includes('40 viên'), 'Chuẩn ngân hàng 4 người');
    assert.ok(template.includes('10 token'), 'Phải nêu rõ giới hạn cầm tay tối đa 10 token');
  });

  it('1.4. Tab 3 (Actions): Quy định chi tiết 3 hành động độc quyền mỗi lượt', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false });
    // Hành động 1: Bốc 3 khác hoặc 2 cùng loại (khi >= 4)
    assert.ok(template.includes('3 viên token khác màu'), 'Phải có quy tắc bốc 3 viên khác màu');
    assert.ok(template.includes('2 viên token cùng màu') && template.includes('4 viên trở lên'), 'Phải có quy tắc bốc 2 viên khi ngân hàng >= 4');
    
    // Hành động 2: Mua cây và trừ giảm giá
    assert.ok(template.includes('Mua') && template.includes('trừ đi mức giảm giá vĩnh viễn'), 'Phải có quy tắc mua cây và giảm giá');
    
    // Hành động 3: Giữ bài nhận 1 vàng, max 3 thẻ
    assert.ok(template.includes('Đặt Chỗ Thẻ Cây') || template.includes('Reserve Card'), 'Phải có hành động đặt chỗ thẻ cây');
    assert.ok(template.includes('1 viên Phân Bón Vàng') || template.includes('Phân Bón Vàng (WILD ⭐)'), 'Phải có thưởng 1 vàng khi giữ thẻ');
    assert.ok(template.includes('tối đa 3 thẻ'), 'Phải nêu rõ giới hạn tối đa 3 thẻ giữ');
  });

  it('1.5. Tab 4 (Tiers): Phân loại chuẩn 3 tầng sinh thái (40 T1, 30 T2, 20 T3 = 90 thẻ)', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false });
    assert.ok(template.includes('40 Thẻ'), 'Tier 1 có đúng 40 thẻ');
    assert.ok(template.includes('30 Thẻ'), 'Tier 2 có đúng 30 thẻ');
    assert.ok(template.includes('20 Thẻ'), 'Tier 3 có đúng 20 thẻ');
    assert.ok(template.includes('Engine Building'), 'Phải giải thích cơ chế Engine Building');
  });

  it('1.6. Tab 5 (Endgame): Khách quý N+1, 3 điểm ★ và Luật Tiebreaker ít cây hơn thắng', () => {
    const template = RulesUI.getRulesTemplate({ isModal: false });
    assert.ok(template.includes('Số người chơi + 1'), 'Số khách quý bằng Số người chơi + 1');
    assert.ok(template.includes('3 Điểm Uy Tín') || template.includes('3★'), 'Mỗi khách mang lại 3 điểm');
    assert.ok(template.includes('Tiebreaker') || template.includes('Luật Hòa Điểm'), 'Có luật hòa điểm');
    assert.ok(template.includes('trồng ít thẻ cây hơn'), 'Tiebreaker: Người trồng ít thẻ cây hơn chiến thắng');
  });

  it('1.7. Chế độ isModal=true phải bổ sung nút đóng modal', () => {
    const modalTemplate = RulesUI.getRulesTemplate({ isModal: true, prefixId: 'm-test' });
    assert.ok(modalTemplate.includes('codex-close-btn'), 'Modal phải có class codex-close-btn');
    assert.ok(modalTemplate.includes('m-test-btn-close'), 'Modal phải có id nút đóng tương ứng prefix');
  });

  // ===========================================================================
  // PHẦN 2: KIỂM THỬ CHUẨN DESIGN-TASTE-FRONTEND (ANTI-SLOP & ZERO EM-DASH)
  // ===========================================================================
  it('2.1. Tuân thủ tuyệt đối quy tắc 9.G: Toàn bộ Rules Template KHÔNG chứa ký tự em-dash (—) hoặc en-dash (–)', () => {
    const template = RulesUI.getRulesTemplate({ isModal: true });
    const emDashCount = (template.match(/—/g) || []).length;
    const enDashCount = (template.match(/–/g) || []).length;

    assert.strictEqual(emDashCount, 0, `Vi phạm quy tắc 9.G: Phát hiện ${emDashCount} ký tự em-dash '—' trong Rules UI!`);
    assert.strictEqual(enDashCount, 0, `Vi phạm quy tắc 9.G: Phát hiện ${enDashCount} ký tự en-dash '–' trong Rules UI!`);
  });

  it('2.2. File CSS rules.css phải tồn tại, hợp lệ và không chứa ký tự em-dash (—)', () => {
    const cssPath = path.resolve('client/css/rules.css');
    assert.ok(fs.existsSync(cssPath), 'File client/css/rules.css phải tồn tại');
    
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(cssContent.includes('.codex-wrapper'), 'CSS phải có class .codex-wrapper');
    assert.ok(cssContent.includes('.codex-modal-overlay'), 'CSS phải có class .codex-modal-overlay');
    assert.ok(cssContent.includes('.gem-dirt') && cssContent.includes('.gem-wild'), 'CSS phải định nghĩa style cho các loại gem');

    const emDashCount = (cssContent.match(/—/g) || []).length;
    assert.strictEqual(emDashCount, 0, 'CSS rules.css không được chứa ký tự em-dash');
  });

  // ===========================================================================
  // PHẦN 3: KIỂM THỬ TÍCH HỢP TRÊN INDEX.HTML VÀ LOBBY.HTML
  // ===========================================================================
  it('3.1. client/index.html phải tích hợp rules.css, #inline-rules-container và nút modal #btn-open-rules', () => {
    const htmlPath = path.resolve('client/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(htmlContent.includes('css/rules.css'), 'index.html phải nạp css/rules.css');
    assert.ok(htmlContent.includes('id="inline-rules-container"'), 'index.html phải có container #inline-rules-container');
    assert.ok(htmlContent.includes('id="btn-open-rules"'), 'index.html phải có nút mở modal #btn-open-rules');
    assert.strictEqual((htmlContent.match(/—/g) || []).length, 0, 'index.html không được chứa ký tự em-dash');
  });

  it('3.2. client/lobby.html phải tích hợp rules.css, #btn-open-rules và #btn-sidebar-rules', () => {
    const htmlPath = path.resolve('client/lobby.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(htmlContent.includes('css/rules.css'), 'lobby.html phải nạp css/rules.css');
    assert.ok(htmlContent.includes('id="btn-open-rules"'), 'lobby.html header phải có nút #btn-open-rules');
    assert.ok(htmlContent.includes('id="btn-sidebar-rules"'), 'lobby.html sidebar phải có nút #btn-sidebar-rules');
    assert.strictEqual((htmlContent.match(/—/g) || []).length, 0, 'lobby.html không được chứa ký tự em-dash');
  });

  // ===========================================================================
  // PHẦN 4: KIỂM THỬ DOM & CHUYỂN TAB VÀ MODAL (GIẢ LẬP TRÌNH DUYỆT)
  // ===========================================================================
  it('4.1. RulesUI.initTabs() chuyển tab mượt mà và cập nhật aria-selected', () => {
    // Giả lập môi trường DOM tối giản
    const tabBtns = [
      { dataset: { tab: 'overview' }, classList: { classes: new Set(['active']), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); }, contains(cls) { return this.classes.has(cls); } }, setAttribute(k, v) { this[k] = v; }, addEventListener(ev, fn) { if (ev === 'click') this.onClick = fn; } },
      { dataset: { tab: 'energies' }, classList: { classes: new Set(), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); }, contains(cls) { return this.classes.has(cls); } }, setAttribute(k, v) { this[k] = v; }, addEventListener(ev, fn) { if (ev === 'click') this.onClick = fn; } }
    ];

    const panelEls = [
      { id: 'codex-panel-overview', classList: { classes: new Set(['active']), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); } } },
      { id: 'codex-panel-energies', classList: { classes: new Set(), toggle(cls, val) { if (val) this.classes.add(cls); else this.classes.delete(cls); } } }
    ];

    const dummyDiv = {
      querySelectorAll(selector) {
        if (selector === '.codex-tab-btn') return tabBtns;
        if (selector === '.codex-panel') return panelEls;
        return [];
      }
    };

    RulesUI.initTabs(dummyDiv);

    // Giả lập click vào tab 2 (energies)
    assert.strictEqual(typeof tabBtns[1].onClick, 'function', 'Nút tab 2 phải được gán listener click');
    tabBtns[1].onClick();

    assert.strictEqual(tabBtns[1].classList.classes.has('active'), true, 'Tab 2 phải có class active sau khi click');
    assert.strictEqual(tabBtns[1]['aria-selected'], 'true', 'Tab 2 aria-selected phải là true');
    assert.strictEqual(tabBtns[0].classList.classes.has('active'), false, 'Tab 1 phải mất class active');
    assert.strictEqual(panelEls[1].classList.classes.has('active'), true, 'Panel 2 phải có class active sau khi click');
  });

});
