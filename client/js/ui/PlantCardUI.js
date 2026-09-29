/*
   GARDEN EMPIRE — PLANT CARD UI COMPONENT
*/

export class PlantCardUI {

  static isCardAffordable(card, player) {
    if (!player) return false;
    const tokens = player.tokens || {};
    const bonuses = player.bonuses || {};
    let wildNeeded = 0;

    for (const [res, reqAmount] of Object.entries(card.cost || {})) {
      const bonus = bonuses[res] || 0;
      const need = Math.max(0, reqAmount - bonus);
      const have = tokens[res] || 0;
      if (have < need) {
        wildNeeded += (need - have);
      }
    }

    const playerWild = tokens['WILD'] || 0;
    return playerWild >= wildNeeded;
  }

  static getResourceNameVi(resourceKey) {
    const names = {
      'EARTH': 'Đất',
      'SEED': 'Hạt',
      'SUNLIGHT': 'Sáng',
      'WATER': 'Nước',
      'NUTRIENTS': 'Dưỡng',
      'WILD': 'Vàng'
    };
    return names[resourceKey] || resourceKey;
  }

  static getResourceIcon(resourceKey) {
    const icons = {
      'EARTH': '🟫',
      'SEED': '🌰',
      'SUNLIGHT': '☀️',
      'WATER': '💧',
      'NUTRIENTS': '🧪',
      'WILD': '⭐'
    };
    return icons[resourceKey] || '🌿';
  }

  static renderCard(card, player = null, onClick = null) {
    const cardEl = document.createElement('div');
    const tier = card.tier || 1;
    cardEl.className = `plant-card tier-${tier}`;
    cardEl.dataset.cardId = card.id;

    const affordable = PlantCardUI.isCardAffordable(card, player);
    if (affordable) {
      cardEl.classList.add('card-affordable');
    } else {
      cardEl.classList.add('card-locked');
    }

    // Cost chips HTML
    const costHtml = Object.entries(card.cost || {})
      .map(([res, amount]) => `
        <span class="cost-chip badge-${res.toLowerCase()}" title="${amount} ${res}">
          ${PlantCardUI.getResourceIcon(res)} ${amount}
        </span>
      `).join('');

    const bonusIcon = PlantCardUI.getResourceIcon(card.bonusResource);
    const bonusName = PlantCardUI.getResourceNameVi(card.bonusResource);

    cardEl.innerHTML = `
      <div class="card-header-bar">
        <span class="card-prestige-badge">${card.prestigePoints > 0 ? `★ ${card.prestigePoints}` : ''}</span>
        <div class="card-bonus-gem badge-${card.bonusResource?.toLowerCase()}" title="Giảm giá vĩnh viễn: ${card.bonusResource}">
          ${bonusIcon}
        </div>
      </div>
      <div class="card-body-meta">
        <div class="card-plant-name">${card.name || `Cây Tier ${tier}`}</div>
      </div>
      <div class="card-cost-strip">
        ${costHtml}
      </div>
    `;

    if (onClick) {
      cardEl.addEventListener('click', () => onClick(card));
    }

    return cardEl;
  }

  static renderMarket(container, gameState, player, onCardClick, onDeckClick = null) {
    container.innerHTML = '';
    
    // Render Tier 3 -> Tier 2 -> Tier 1
    const tiers = [
      { tier: 3, cards: gameState.visibleTier3Cards || [], deckCount: gameState.tier3DeckCount || 0, icon: '🌳', label: 'Cổ Thụ' },
      { tier: 2, cards: gameState.visibleTier2Cards || [], deckCount: gameState.tier2DeckCount || 0, icon: '🌺', label: 'Cây Hoa' },
      { tier: 1, cards: gameState.visibleTier1Cards || [], deckCount: gameState.tier1DeckCount || 0, icon: '🌱', label: 'Mầm Non' }
    ];

    tiers.forEach(({ tier, cards, deckCount, icon, label }) => {
      const tierRow = document.createElement('div');
      tierRow.className = `plant-tier-row tier-row-${tier}`;

      // Deck pile card
      const deckEl = document.createElement('div');
      deckEl.className = `tier-deck-card tier-${tier}`;
      deckEl.title = `Chồng bài Tier ${tier} (Bấm để giữ bài từ đầu chồng)`;
      deckEl.innerHTML = `
        <div class="deck-icon">${icon}</div>
        <div class="deck-label">Tier ${tier}</div>
        <div class="deck-count-pill">${deckCount} thẻ</div>
      `;
      if (onDeckClick) {
        deckEl.addEventListener('click', () => onDeckClick(tier));
      }
      tierRow.appendChild(deckEl);

      // Visible cards
      cards.forEach(card => {
        tierRow.appendChild(PlantCardUI.renderCard(card, player, onCardClick));
      });

      // Fill empty slots if less than 4 cards
      for (let i = cards.length; i < 4; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'plant-card-empty';
        emptySlot.innerHTML = `<span class="text-muted">Đã hết</span>`;
        tierRow.appendChild(emptySlot);
      }

      container.appendChild(tierRow);
    });
  }
}
