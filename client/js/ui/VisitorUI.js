/*
   GARDEN EMPIRE — VISITOR CARDS UI COMPONENT (noble in splendor)
*/
import { ResourceUI } from './ResourceUI.js';

export class VisitorUI {

  // Danh mục 10 Vị Khách Thăm Vườn chuẩn theo CardCatalog.java (kèm linh vật đại diện và ảnh)
  static VISITOR_META = {
    v_01: { icon: '🐝', name: 'Ong Chúa Vườn Hoa', shortName: 'Ong Chúa', img: 'assets/images/visitors/v_01_ong_chua.png' },
    v_02: { icon: '🦋', name: 'Bướm Nữ Hoàng Alexandra', shortName: 'Bướm Nữ Hoàng', img: 'assets/images/visitors/v_02_buom_alexandra.png' },
    v_03: { icon: '🐞', name: 'Bọ Rùa May Mắn', shortName: 'Bọ Rùa', img: 'assets/images/visitors/v_03_bo_rua.png' },
    v_04: { icon: '🐤', name: 'Chim Hoàng Yến Vàng', shortName: 'Hoàng Yến', img: 'assets/images/visitors/v_04_chim_hoang_yen.png' },
    v_05: { icon: '🐿️', name: 'Sóc Nâu Tinh Nghịch', shortName: 'Sóc Nâu', img: 'assets/images/visitors/v_05_soc_nau.png' },
    v_06: { icon: '🐌', name: 'Ốc Sên Chậm Chạp', shortName: 'Ốc Sên', img: 'assets/images/visitors/v_06_oc_sen.png' },
    v_07: { icon: '🕊️', name: 'Chim Én Mùa Xuân', shortName: 'Chim Én', img: 'assets/images/visitors/v_07_chim_en.png' },
    v_08: { icon: '🐜', name: 'Kiến Thợ Cần Mẫn', shortName: 'Kiến Thợ', img: 'assets/images/visitors/v_08_kien_tho.png' },
    v_09: { icon: '🪲', name: 'Bọ Hung Cơ Bắp', shortName: 'Bọ Hung', img: 'assets/images/visitors/v_09_bo_hung.png' },
    v_10: { icon: '🪰', name: 'Chuồn Chuồn Nắng Mưa', shortName: 'Chuồn Chuồn', img: 'assets/images/visitors/v_10_chuon_chuon.png' },
  };

  /**
   * Lấy thông tin linh vật & metadata của thẻ khách theo ID hoặc từ khóa tên
   */
  static getVisitorMeta(id, fallbackName = '') {
    if (id && this.VISITOR_META[id]) {
      return this.VISITOR_META[id];
    }
    const nameLower = (fallbackName || '').toLowerCase();
    if (nameLower.includes('ong')) return { icon: '🐝', name: fallbackName, shortName: 'Ong Chúa', img: 'assets/images/visitors/v_01_ong_chua.png' };
    if (nameLower.includes('bướm') || nameLower.includes('alexandra')) return { icon: '🦋', name: fallbackName, shortName: 'Bướm Nữ Hoàng', img: 'assets/images/visitors/v_02_buom_alexandra.png' };
    if (nameLower.includes('bọ rùa')) return { icon: '🐞', name: fallbackName, shortName: 'Bọ Rùa', img: 'assets/images/visitors/v_03_bo_rua.png' };
    if (nameLower.includes('hoàng yến') || nameLower.includes('chim hoàng yến')) return { icon: '🐤', name: fallbackName, shortName: 'Hoàng Yến', img: 'assets/images/visitors/v_04_chim_hoang_yen.png' };
    if (nameLower.includes('sóc')) return { icon: '🐿️', name: fallbackName, shortName: 'Sóc Nâu', img: 'assets/images/visitors/v_05_soc_nau.png' };
    if (nameLower.includes('ốc sên')) return { icon: '🐌', name: fallbackName, shortName: 'Ốc Sên', img: 'assets/images/visitors/v_06_oc_sen.png' };
    if (nameLower.includes('én') || nameLower.includes('chim én')) return { icon: '🕊️', name: fallbackName, shortName: 'Chim Én', img: 'assets/images/visitors/v_07_chim_en.png' };
    if (nameLower.includes('kiến')) return { icon: '🐜', name: fallbackName, shortName: 'Kiến Thợ', img: 'assets/images/visitors/v_08_kien_tho.png' };
    if (nameLower.includes('bọ hung')) return { icon: '🪲', name: fallbackName, shortName: 'Bọ Hung', img: 'assets/images/visitors/v_09_bo_hung.png' };
    if (nameLower.includes('chuồn')) return { icon: '🪰', name: fallbackName, shortName: 'Chuồn Chuồn', img: 'assets/images/visitors/v_10_chuon_chuon.png' };
    return { icon: '🦋', name: fallbackName || 'Khách Quý', shortName: 'Khách Quý' };
  }

  static renderVisitor(visitor) {
    const el = document.createElement('div');
    el.className = 'visitor-tile';
    el.dataset.visitorId = visitor.id;

    const meta = this.getVisitorMeta(visitor.id, visitor.name);
    const displayName = visitor.name || meta.name;

    const reqList = Object.entries(visitor.requirements || {});
    const reqHtml = reqList
      .map(([res, count]) => {
        const resMeta = ResourceUI.getResourceMeta(res);
        return `
          <span class="req-chip badge-${resMeta.class}" title="Cần ${count} Cây ${resMeta.name}">
            ${resMeta.icon} ${count}
          </span>
        `;
      }).join('');

    const reqSummary = reqList
      .map(([res, count]) => `${count} cây ${ResourceUI.getResourceMeta(res).name}`)
      .join(', ');

    el.title = `${meta.icon} ${displayName} (+${visitor.prestigePoints || 3}★)\nĐiều kiện rước về: ${reqSummary}`;

    const imgTag = meta.img
      ? `<img src="${meta.img}" alt="${displayName}" class="visitor-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div class="visitor-img-fallback" style="display: none;">${meta.icon}</div>`
      : `<div class="visitor-img-fallback">${meta.icon}</div>`;

    el.innerHTML = `
      <!-- 1. Hàng Tiêu Đề: Tên (trái) + Điểm (phải) chuẩn Hình 1 -->
      <div class="visitor-header-bar">
        <div class="visitor-name-cell" title="${displayName}">
          <span class="visitor-mini-avatar">${meta.icon}</span>
          <span class="visitor-name-text">${displayName}</span>
        </div>
        <div class="visitor-score-cell" title="+${visitor.prestigePoints || 3} Điểm Uy Tín">
          ★ ${visitor.prestigePoints || 3}
        </div>
      </div>

      <!-- 2. Thân Thẻ: Ảnh Linh Vật + Khung Cách Lấy (ở góc dưới bên trái) chuẩn Hình 1 -->
      <div class="visitor-image-frame">
        ${imgTag}
        <div class="visitor-req-overlay" title="Điều kiện rước về: ${reqSummary}">
          <span class="visitor-req-tag">Cách lấy</span>
          <div class="visitor-req-chips">
            ${reqHtml}
          </div>
        </div>
      </div>
    `;

    return el;
  }

  static renderVisitorsList(container, visitors = [], deckCount = 0) {
    container.innerHTML = '';

    // 1. Chồng bài Khách Thăm (Draw pile on left)
    const visitorDeckEl = document.createElement('div');
    visitorDeckEl.className = 'visitor-deck-card';
    visitorDeckEl.title = `Chồng bài Khách Thăm (Còn ${deckCount} thẻ dự trữ)`;
    visitorDeckEl.innerHTML = `
      <div class="deck-icon">🦋</div>
      <div class="deck-label">Khách Quý</div>
      <div class="deck-count-pill">${deckCount} thẻ</div>
    `;
    container.appendChild(visitorDeckEl);

    // 2. Dãy thẻ khách lộ diện
    const revealedRow = document.createElement('div');
    revealedRow.className = 'visitors-revealed-row';

    if (visitors.length === 0) {
      revealedRow.innerHTML = `<span class="text-muted" style="font-size: 0.85rem; align-self: center; padding: 0.5rem;">Tất cả khách đã được rước về vườn.</span>`;
    } else {
      visitors.forEach(v => {
        revealedRow.appendChild(VisitorUI.renderVisitor(v));
      });
    }

    container.appendChild(revealedRow);
  }
}
