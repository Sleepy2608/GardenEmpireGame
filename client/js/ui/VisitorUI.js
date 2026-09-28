/**
 * UI Component for rendering Visitor (Noble) Cards
 */
export class VisitorUI {
  static renderVisitor(visitor) {
    const el = document.createElement('div');
    el.className = 'visitor-card';

    const reqHtml = Object.entries(visitor.requirements)
      .map(([res, count]) => `<span class="req-item req-${res.toLowerCase()}">${count} ${res}</span>`)
      .join('');

    el.innerHTML = `
      <div class="visitor-points">${visitor.prestigePoints}</div>
      <div class="visitor-reqs">${reqHtml}</div>
    `;
    return el;
  }

  static renderVisitorsList(container, visitors) {
    container.innerHTML = '';
    visitors.forEach(v => {
      container.appendChild(VisitorUI.renderVisitor(v));
    });
  }
}
