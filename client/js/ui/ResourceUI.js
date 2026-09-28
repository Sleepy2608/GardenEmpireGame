/**
 * UI Component for rendering Resources/Tokens
 */
export class ResourceUI {
  static renderToken(resourceType, count, isInteractive = false, onClick = null) {
    const tokenEl = document.createElement('div');
    tokenEl.className = `resource-token token-${resourceType.toLowerCase()}`;
    tokenEl.innerHTML = `
      <span class="token-name">${resourceType}</span>
      <span class="token-count">${count}</span>
    `;

    if (isInteractive && onClick) {
      tokenEl.classList.add('clickable');
      tokenEl.addEventListener('click', () => onClick(resourceType));
    }

    return tokenEl;
  }

  static renderBank(container, resourceBank, onTokenSelect) {
    container.innerHTML = '';
    Object.entries(resourceBank).forEach(([type, count]) => {
      const token = ResourceUI.renderToken(type, count, true, onTokenSelect);
      container.appendChild(token);
    });
  }
}
