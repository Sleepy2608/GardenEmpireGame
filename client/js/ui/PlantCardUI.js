/**
 * UI Component for rendering Plant Cards
 */
export class PlantCardUI {
  static renderCard(card, onBuy = null, onReserve = null) {
    const cardEl = document.createElement('div');
    cardEl.className = `plant-card tier-${card.tier}`;
    
    // Header with prestige points and bonus
    const costHtml = Object.entries(card.cost)
      .map(([res, amount]) => `<span class="cost-item cost-${res.toLowerCase()}">${amount}</span>`)
      .join('');

    cardEl.innerHTML = `
      <div class="card-header">
        <span class="card-points">${card.prestigePoints > 0 ? card.prestigePoints : ''}</span>
        <span class="card-bonus bonus-${card.bonusResource.toLowerCase()}">${card.bonusResource}</span>
      </div>
      <div class="card-body">
        <!-- Plant illustration/image -->
        <div class="card-art"></div>
      </div>
      <div class="card-footer cost-container">
        ${costHtml}
      </div>
    `;

    if (onBuy) {
      cardEl.addEventListener('click', () => onBuy(card));
    }

    return cardEl;
  }

  static renderMarket(container, visibleCards, onCardBuy, onCardReserve) {
    container.innerHTML = '';
    [3, 2, 1].forEach(tier => {
      const tierRow = document.createElement('div');
      tierRow.className = `plant-tier-row tier-row-${tier}`;
      
      const deckEl = document.createElement('div');
      deckEl.className = 'tier-deck';
      deckEl.innerHTML = `<span>Tier ${tier}</span>`;
      tierRow.appendChild(deckEl);

      const cards = visibleCards[`tier${tier}`] || [];
      cards.forEach(card => {
        tierRow.appendChild(PlantCardUI.renderCard(card, onCardBuy, onCardReserve));
      });

      container.appendChild(tierRow);
    });
  }
}
