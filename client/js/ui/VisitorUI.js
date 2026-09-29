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

  static renderVisitorsList(container, visitors = []) {
    container.innerHTML = '';
    if (visitors.length === 0) {
      container.innerHTML = `<span class="text-muted" style="font-size: 0.85rem;">Tất cả khách đã được rước về vườn.</span>`;
      return;
    }

    visitors.forEach(v => {
      container.appendChild(VisitorUI.renderVisitor(v));
    });
  }
}
