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
      'DIRT': 'Đất',
      'SEED': 'Hạt',
      'SUNLIGHT': 'Sáng',
      'WATER': 'Nước',
      'NUTRIENTS': 'Dưỡng',
      'NUTRIENT': 'Dưỡng',
      'WILD': 'Phân Bón',
      'FERTILIZER': 'Phân Bón'
    };
    return names[resourceKey] || resourceKey;
  }

  static getResourceIcon(resourceKey) {
    const icons = {
      'EARTH': '🟫',
      'DIRT': '🟫',
      'SEED': '🌰',
      'SUNLIGHT': '☀️',
      'WATER': '💧',
      'NUTRIENTS': '🧪',
      'NUTRIENT': '🧪',
      'WILD': '🌾',
      'FERTILIZER': '🌾'
    };
    return icons[resourceKey] || '🌿';
  }

  // Danh mục các thẻ đã có ảnh chụp thực tế theo mã thẻ chuẩn CardCatalog.java (Full 90 thẻ: 40 Tier 1 + 30 Tier 2 + 20 Tier 3)
  static TIER_1_CARD_IDS = new Set([
    't1_e1', 't1_e2', 't1_e3', 't1_e4', 't1_e5', 't1_e6', 't1_e7', 't1_e8',
    't1_s1', 't1_s2', 't1_s3', 't1_s4', 't1_s5', 't1_s6', 't1_s7', 't1_s8',
    't1_su1', 't1_su2', 't1_su3', 't1_su4', 't1_su5', 't1_su6', 't1_su7', 't1_su8',
    't1_w1', 't1_w2', 't1_w3', 't1_w4', 't1_w5', 't1_w6', 't1_w7', 't1_w8',
    't1_n1', 't1_n2', 't1_n3', 't1_n4', 't1_n5', 't1_n6', 't1_n7', 't1_n8'
  ]);

  static TIER_2_CARD_IDS = new Set([
    't2_e1', 't2_e2', 't2_e3', 't2_e4', 't2_e5', 't2_e6',
    't2_s1', 't2_s2', 't2_s3', 't2_s4', 't2_s5', 't2_s6',
    't2_su1', 't2_su2', 't2_su3', 't2_su4', 't2_su5', 't2_su6',
    't2_w1', 't2_w2', 't2_w3', 't2_w4', 't2_w5', 't2_w6',
    't2_n1', 't2_n2', 't2_n3', 't2_n4', 't2_n5', 't2_n6'
  ]);

  static TIER_3_CARD_IDS = new Set([
    't3_e1', 't3_e2', 't3_e3', 't3_e4',
    't3_s1', 't3_s2', 't3_s3', 't3_s4',
    't3_su1', 't3_su2', 't3_su3', 't3_su4',
    't3_w1', 't3_w2', 't3_w3', 't3_w4',
    't3_n1', 't3_n2', 't3_n3', 't3_n4'
  ]);

  static REAL_PHOTO_CARD_IDS = new Set([
    ...PlantCardUI.TIER_1_CARD_IDS,
    ...PlantCardUI.TIER_2_CARD_IDS,
    ...PlantCardUI.TIER_3_CARD_IDS
  ]);

  /**
   * Lấy đường dẫn hình ảnh minh hoạ theo Cấp thẻ (Tier 1: Mầm non, Tier 2: Cây hoa, Tier 3: Cổ thụ)
   */
  static getTierImage(tier) {
    if (tier === 3) return 'assets/images/plants/tier3_tree.webp';
    if (tier === 2) return 'assets/images/plants/tier2_flower.webp';
    return 'assets/images/plants/tier1_sprout.webp';
  }

  /**
   * Lấy hình ảnh của thẻ:
   * 1. Ưu tiên thuộc tính card.image nếu có
   * 2. Nếu thẻ có ảnh chụp thực tế theo ID (ví dụ t1_e1.webp, t2_s1.webp), trả về ảnh thực tế của cây đó
   * 3. Fallback về ảnh đại diện theo Tier
   */
  static getCardImage(card) {
    if (card?.image) return card.image;
    if (card?.id && PlantCardUI.REAL_PHOTO_CARD_IDS.has(card.id)) {
      return `assets/images/plants/${card.id}.webp`;
    }
    const tier = card?.tier || 1;
    return PlantCardUI.getTierImage(tier);
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
    const cardImg = PlantCardUI.getCardImage(card);

    cardEl.innerHTML = `
      <div class="card-header-bar">
        <span class="card-prestige-badge">${card.prestigePoints > 0 ? `★ ${card.prestigePoints}` : ''}</span>
        <div class="card-bonus-gem badge-${card.bonusResource?.toLowerCase()}" title="Giảm giá vĩnh viễn: ${card.bonusResource}">
          ${bonusIcon}
        </div>
      </div>
      <div class="card-body-meta">
        <img class="card-art-thumb" src="${cardImg}" alt="${card.name || `Tier ${tier}`}" loading="lazy" onerror="this.onerror=null;this.src='${PlantCardUI.getTierImage(tier)}';" />
        <div class="card-plant-name" title="${card.name || `Cây Tier ${tier}`}">${card.name || `Cây Tier ${tier}`}</div>
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
