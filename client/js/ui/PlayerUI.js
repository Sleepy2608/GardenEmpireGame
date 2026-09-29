/*
   GARDEN EMPIRE — PLAYER STUDIO & OPPONENTS UI COMPONENT
*/
import { PlantCardUI } from './PlantCardUI.js';
import { ResourceUI } from './ResourceUI.js';

export class PlayerUI {

  static renderCurrentPlayer(container, player, onReservedCardClick = null) {
    if (!player) return;

    // Update Name & Role
    const nameEl = document.getElementById('my-player-name');
    if (nameEl) nameEl.textContent = `${player.name || 'Người chơi'} ${player.isHost ? '👑' : ''}`;

    // Update Prestige Points & 15-Point Goal Bar
    const scoreNumEl = document.getElementById('my-score-num');
    if (scoreNumEl) scoreNumEl.textContent = player.prestigePoints || 0;

    const progressBarEl = document.getElementById('my-prestige-progress-bar');
    if (progressBarEl) {
      const progressPercent = Math.min(100, Math.round(((player.prestigePoints || 0) / 15) * 100));
      progressBarEl.style.width = `${progressPercent}%`;
    }

    // Update Tokens Inventory (6 types)
    const tokensGrid = document.getElementById('my-tokens-grid');
    const tokenLimitIndicator = document.getElementById('my-token-limit-indicator');
    
    if (tokensGrid) {
      tokensGrid.innerHTML = '';
      const resourceOrder = ['EARTH', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS', 'WILD'];
      let totalTokens = 0;

      resourceOrder.forEach(type => {
        const count = player.tokens?.[type] || 0;
        totalTokens += count;
        const meta = ResourceUI.getResourceMeta(type);

        const slot = document.createElement('div');
        slot.className = 'inventory-token-slot';
        slot.innerHTML = `
          <span>${meta.icon} ${meta.name}</span>
          <strong>${count}</strong>
        `;
        tokensGrid.appendChild(slot);
      });

      if (tokenLimitIndicator) {
        tokenLimitIndicator.textContent = `${totalTokens} / 10`;
        if (totalTokens > 10) {
          tokenLimitIndicator.classList.add('warning');
        } else {
          tokenLimitIndicator.classList.remove('warning');
        }
      }
    }

    // Update Permanent Bonuses (5 base resources)
    const bonusesGrid = document.getElementById('my-bonuses-grid');
    if (bonusesGrid) {
      bonusesGrid.innerHTML = '';
      const baseResources = ['EARTH', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS'];

      baseResources.forEach(type => {
        const count = player.bonuses?.[type] || 0;
        const meta = ResourceUI.getResourceMeta(type);

        const slot = document.createElement('div');
        slot.className = `inventory-bonus-slot badge-${meta.class}`;
        slot.title = `Giảm giá vĩnh viễn: ${count} ${meta.name}`;
        slot.innerHTML = `
          <span>${meta.icon}</span>
          <span>+${count}</span>
        `;
        bonusesGrid.appendChild(slot);
      });
    }

    // Update Reserved Cards (3 slots)
    const reservedContainer = document.getElementById('my-reserved-cards-container');
    const reservedCountBadge = document.getElementById('my-reserved-count');
    const reservedCards = player.reservedCards || [];

    if (reservedCountBadge) {
      reservedCountBadge.textContent = `${reservedCards.length} / 3`;
    }

    if (reservedContainer) {
      reservedContainer.innerHTML = '';

      for (let i = 0; i < 3; i++) {
        if (i < reservedCards.length) {
          const card = reservedCards[i];
          const cardEl = PlantCardUI.renderCard(card, player, onReservedCardClick);
          cardEl.classList.add('reserved-card-thumb');
          reservedContainer.appendChild(cardEl);
        } else {
          const emptySlot = document.createElement('div');
          emptySlot.className = 'reserved-slot';
          emptySlot.innerHTML = `<span>Ô Trống ${i + 1}</span>`;
          reservedContainer.appendChild(emptySlot);
        }
      }
    }
  }

  static renderOpponent(opponent, isCurrentTurn = false) {
    const el = document.createElement('div');
    el.className = `opponent-card ${isCurrentTurn ? 'active-turn' : ''}`;

    const bonuses = opponent.bonuses || {};
    const totalPlants = opponent.purchasedCards?.length || 0;
    const totalReserved = opponent.reservedCards?.length || 0;
    const totalTokens = Object.values(opponent.tokens || {}).reduce((a, b) => a + b, 0);

    const bonusPillsHtml = ['EARTH', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS']
      .map(res => {
        const cnt = bonuses[res] || 0;
        const meta = ResourceUI.getResourceMeta(res);
        return `<div class="mini-bonus-pill badge-${meta.class}" title="${meta.name}: +${cnt}">${cnt}</div>`;
      }).join('');

    el.innerHTML = `
      <div class="opponent-card-header">
        <span class="opponent-name">${opponent.name || 'Đối thủ'} ${opponent.isHost ? '👑' : ''}</span>
        <span class="opponent-score-badge">★ ${opponent.prestigePoints || 0}</span>
      </div>
      <div class="opponent-stats-row">
        <span>🌳 Cây: <strong>${totalPlants}</strong></span>
        <span>📑 Giữ: <strong>${totalReserved}</strong></span>
        <span>🪙 Token: <strong>${totalTokens}</strong></span>
      </div>
      <div class="opponent-bonuses-strip">
        ${bonusPillsHtml}
      </div>
    `;

    return el;
  }
}
