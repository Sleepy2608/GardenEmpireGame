/*
   GARDEN EMPIRE — RESOURCE & TOKEN UI COMPONENT
*/

export class ResourceUI {

  static getResourceMeta(type) {
    const meta = {
      'EARTH': { icon: '🟫', name: 'Đất', class: 'earth', img: 'assets/images/resources/dirt.png' },
      'DIRT': { icon: '🟫', name: 'Đất', class: 'earth', img: 'assets/images/resources/dirt.png' },
      'WATER': { icon: '💧', name: 'Nước', class: 'water', img: 'assets/images/resources/water.png' },
      'SUNLIGHT': { icon: '☀️', name: 'Ánh Sáng', class: 'sunlight', img: 'assets/images/resources/sunlight.png' },
      'SEED': { icon: '🌰', name: 'Hạt Giống', class: 'seed', img: 'assets/images/resources/seed.png' },
      'NUTRIENTS': { icon: '🧪', name: 'Chất Dinh Dưỡng', class: 'nutrients', img: 'assets/images/resources/nutrient.png' },
      'NUTRIENT': { icon: '🧪', name: 'Chất Dinh Dưỡng', class: 'nutrients', img: 'assets/images/resources/nutrient.png' },
      'WILD': { icon: '⭐', name: 'Vàng Wild', class: 'wild' }
    };
    return meta[type] || { icon: '🌿', name: type, class: 'nutrients' };
  }

  static renderTokenOrb(type, count = 0, isClickable = false, onClick = null) {
    const meta = ResourceUI.getResourceMeta(type);
    const tokenCard = document.createElement('div');
    tokenCard.className = `bank-token-card token-card-${meta.class}`;
    tokenCard.dataset.resourceType = type;

    const iconContent = meta.img
      ? `<img src="${meta.img}" alt="${meta.name}" class="token-img-icon" onerror="this.replaceWith(document.createTextNode('${meta.icon}'))" />`
      : `<span>${meta.icon}</span>`;

    tokenCard.innerHTML = `
      <div class="token-orb badge-${meta.class}">
        ${iconContent}
      </div>
      <div class="token-count-badge">${count}</div>
      <div class="token-name-label">${meta.name}</div>
    `;

    if (isClickable && onClick) {
      tokenCard.style.cursor = 'pointer';
      tokenCard.addEventListener('click', () => onClick(type));
    }

    return tokenCard;
  }

  static renderBank(container, resourceBank, onTokenSelect = null) {
    container.innerHTML = '';
    const resourceOrder = ['EARTH', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS', 'WILD'];

    resourceOrder.forEach(type => {
      const count = resourceBank[type] ?? 0;
      const orb = ResourceUI.renderTokenOrb(type, count, true, onTokenSelect);
      container.appendChild(orb);
    });
  }
}
