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
      <!-- 1. Hàng Tiêu Đề: Tên (trái) + Điểm (phải) -->
      <div class="visitor-header-bar">
        <div class="visitor-name-cell" title="${displayName}">
          <span class="visitor-mini-avatar">${meta.icon}</span>
          <span class="visitor-name-text">${displayName}</span>
        </div>
        <div class="visitor-score-cell" title="+${visitor.prestigePoints || 3} Điểm Uy Tín">
          ★ ${visitor.prestigePoints || 3}
        </div>
      </div>

      <!-- 2. Thân Thẻ: Ảnh Linh Vật + Khung Yêu Cầu -->
      <div class="visitor-image-frame">
        ${imgTag}
        <div class="visitor-req-overlay">
          <div class="visitor-req-chips" data-req-summary="${reqSummary}">
            ${reqHtml}
          </div>
          <button class="visitor-req-more-btn hidden" title="Xem đầy đủ tài nguyên yêu cầu" aria-label="Xem thêm tài nguyên">···</button>
        </div>
      </div>
    `;

    // After DOM insertion, check if chips overflow → show '...' button
    requestAnimationFrame(() => {
      const overlay = el.querySelector('.visitor-req-overlay');
      const chipsEl = el.querySelector('.visitor-req-chips');
      const moreBtn = el.querySelector('.visitor-req-more-btn');
      if (!overlay || !chipsEl || !moreBtn) return;

      const overlayW = overlay.clientWidth;
      const chipsScrollW = chipsEl.scrollWidth;
      if (chipsScrollW > overlayW - 4) {
        // Chips overflow: clip them and show '...' button
        chipsEl.classList.add('is-clipped');
        moreBtn.classList.remove('hidden');
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          VisitorUI.openReqPopup(el, visitor, meta);
        });
      }
    });

    return el;
  }

  /**
   * Mở popup hiển thị đầy đủ tài nguyên yêu cầu của thẻ Khách.
   * @param {HTMLElement} anchorEl - Phần tử .visitor-tile gốc
   * @param {object} visitor - Dữ liệu thẻ Khách
   * @param {object} meta - Metadata linh vật
   */
  static openReqPopup(anchorEl, visitor, meta) {
    // Remove existing popup if any
    const existing = document.getElementById('visitor-req-popup');
    if (existing) existing.remove();

    const reqList = Object.entries(visitor.requirements || {});
    const displayName = visitor.name || meta.name;

    const chipsHtml = reqList.map(([res, count]) => {
      const resMeta = ResourceUI.getResourceMeta(res);
      const iconImg = resMeta.img
        ? `<img src="${resMeta.img}" alt="${resMeta.name}" class="req-popup-chip-img" onerror="this.style.display='none'" />`
        : `<span class="req-popup-chip-emoji">${resMeta.icon}</span>`;
      return `
        <div class="req-popup-chip badge-${resMeta.class}">
          <div class="req-popup-chip-icon">${iconImg}</div>
          <span class="req-popup-chip-count">×${count}</span>
          <span class="req-popup-chip-name">${resMeta.name}</span>
        </div>
      `;
    }).join('');

    const popup = document.createElement('div');
    popup.id = 'visitor-req-popup';
    popup.className = 'visitor-req-popup glass-panel';
    popup.innerHTML = `
      <div class="req-popup-header">
        <span class="req-popup-icon">${meta.icon}</span>
        <span class="req-popup-title">${displayName}</span>
        <button class="req-popup-close-btn" id="req-popup-close" title="Đóng">✕</button>
      </div>
      <div class="req-popup-subtitle">Điều kiện để rước về vườn (+${visitor.prestigePoints || 3}★)</div>
      <div class="req-popup-chips">${chipsHtml}</div>
    `;

    // Position popup near anchor
    document.body.appendChild(popup);
    const rect = anchorEl.getBoundingClientRect();
    const popupW = popup.offsetWidth || 200;
    const popupH = popup.offsetHeight || 120;
    let top = rect.bottom + 6;
    let left = rect.left;
    if (left + popupW > window.innerWidth - 8) left = window.innerWidth - popupW - 8;
    if (top + popupH > window.innerHeight - 8) top = rect.top - popupH - 6;
    popup.style.top = `${top + window.scrollY}px`;
    popup.style.left = `${left + window.scrollX}px`;

    // Close on button
    document.getElementById('req-popup-close').addEventListener('click', () => popup.remove());

    // Close on click-outside (next frame to avoid immediate dismissal)
    requestAnimationFrame(() => {
      const dismissHandler = (e) => {
        if (!popup.contains(e.target)) {
          popup.remove();
          document.removeEventListener('click', dismissHandler);
        }
      };
      document.addEventListener('click', dismissHandler);

      // Close on Escape
      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          popup.remove();
          document.removeEventListener('keydown', keyHandler);
          document.removeEventListener('click', dismissHandler);
        }
      };
      document.addEventListener('keydown', keyHandler);
    });
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
      revealedRow.innerHTML = `<div class="visitors-empty-state"><span>🦋 Tất cả khách đã được rước về vườn.</span></div>`;
    } else {
      visitors.forEach(v => {
        revealedRow.appendChild(VisitorUI.renderVisitor(v));
      });
    }

    container.appendChild(revealedRow);
  }
}
