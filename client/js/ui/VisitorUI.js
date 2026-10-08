/*
   GARDEN EMPIRE — VISITOR CARDS UI COMPONENT (noble in splendor)
*/
import { ResourceUI } from './ResourceUI.js';

export class VisitorUI {

  // Danh mục 10 Vị Khách Thăm Vườn chuẩn theo CardCatalog.java (kèm linh vật đại diện)
  static VISITOR_META = {
    v_01: { icon: '🐝', name: 'Ong Chúa Vườn Hoa', shortName: 'Ong Chúa' },
    v_02: { icon: '🦋', name: 'Bướm Nữ Hoàng Alexandra', shortName: 'Bướm Nữ Hoàng' },
    v_03: { icon: '🐞', name: 'Bọ Rùa May Mắn', shortName: 'Bọ Rùa' },
    v_04: { icon: '🐤', name: 'Chim Hoàng Yến Vàng', shortName: 'Hoàng Yến' },
    v_05: { icon: '🐿️', name: 'Sóc Nâu Tinh Nghịch', shortName: 'Sóc Nâu' },
    v_06: { icon: '🦔', name: 'Nhím Nhỏ Đáng Yêu', shortName: 'Nhím Nhỏ' },
    v_07: { icon: '🪰', name: 'Chuồn Chuồn Ớt', shortName: 'Chuồn Chuồn' },
    v_08: { icon: '🕊️', name: 'Chim Én Báo Xuân', shortName: 'Chim Én' },
    v_09: { icon: '🦉', name: 'Cú Mèo Tri Thức', shortName: 'Cú Mèo' },
    v_10: { icon: '🐜', name: 'Kiến Thợ Cần Mẫn', shortName: 'Kiến Thợ' },
  };

  /**
   * Lấy thông tin linh vật & metadata của thẻ khách theo ID hoặc từ khóa tên
   */
  static getVisitorMeta(id, fallbackName = '') {
    if (id && this.VISITOR_META[id]) {
      return this.VISITOR_META[id];
    }
    const nameLower = (fallbackName || '').toLowerCase();
    if (nameLower.includes('ong')) return { icon: '🐝', name: fallbackName, shortName: 'Ong Chúa' };
    if (nameLower.includes('bướm') || nameLower.includes('alexandra')) return { icon: '🦋', name: fallbackName, shortName: 'Bướm Nữ Hoàng' };
    if (nameLower.includes('bọ rùa')) return { icon: '🐞', name: fallbackName, shortName: 'Bọ Rùa' };
    if (nameLower.includes('hoàng yến') || nameLower.includes('chim')) return { icon: '🐤', name: fallbackName, shortName: 'Hoàng Yến' };
    if (nameLower.includes('sóc')) return { icon: '🐿️', name: fallbackName, shortName: 'Sóc Nâu' };
    if (nameLower.includes('nhím')) return { icon: '🦔', name: fallbackName, shortName: 'Nhím Nhỏ' };
    if (nameLower.includes('chuồn')) return { icon: '🪰', name: fallbackName, shortName: 'Chuồn Chuồn' };
    if (nameLower.includes('én')) return { icon: '🕊️', name: fallbackName, shortName: 'Chim Én' };
    if (nameLower.includes('cú')) return { icon: '🦉', name: fallbackName, shortName: 'Cú Mèo' };
    if (nameLower.includes('kiến')) return { icon: '🐜', name: fallbackName, shortName: 'Kiến Thợ' };
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

    el.title = `${meta.icon} ${displayName} (+${visitor.prestigePoints || 3}★)\nĐiều kiện: ${reqSummary}`;

    el.innerHTML = `
      <div class="visitor-header">
        <div class="visitor-identity">
          <span class="visitor-avatar" aria-hidden="true">${meta.icon}</span>
          <span class="visitor-title" title="${displayName}">${displayName}</span>
        </div>
        <span class="visitor-score" title="+${visitor.prestigePoints || 3} Điểm Uy Tín">★ ${visitor.prestigePoints || 3}</span>
      </div>
      <div class="visitor-req-chips">
        ${reqHtml}
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
