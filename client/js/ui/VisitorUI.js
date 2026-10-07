/*
   GARDEN EMPIRE — VISITOR CARDS UI COMPONENT (noble in splendor)
*/
import { ResourceUI } from './ResourceUI.js';

export class VisitorUI {

  static renderVisitor(visitor) {
    const el = document.createElement('div');
    el.className = 'visitor-tile';
    el.dataset.visitorId = visitor.id;

    const reqHtml = Object.entries(visitor.requirements || {})
      .map(([res, count]) => {
        const meta = ResourceUI.getResourceMeta(res);
        return `
          <span class="req-chip badge-${meta.class}" title="Cần ${count} Cây ${meta.name}">
            ${meta.icon} ${count}
          </span>
        `;
      }).join('');

    el.innerHTML = `
      <div class="visitor-header">
        <span class="visitor-title">${visitor.name || 'Khách Thăm'}</span>
        <span class="visitor-score">★ ${visitor.prestigePoints || 3}</span>
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
