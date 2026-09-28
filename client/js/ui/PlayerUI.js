/**
 * UI Component for rendering Player info, cards, bonuses and tokens
 */
export class PlayerUI {
  static renderCurrentPlayer(container, player) {
    if (!player) return;
    container.innerHTML = `
      <div class="player-profile">
        <h4>${player.name} ${player.isHost ? '👑' : ''}</h4>
        <div class="prestige-score">Điểm danh tiếng: <strong>${player.prestigePoints}</strong></div>
      </div>
      <div class="player-bonuses">
        <h5>Thường trực từ Cây trồng</h5>
        <div class="bonus-grid">
          ${Object.entries(player.bonuses || {}).map(([res, cnt]) => `<span>${res}: ${cnt}</span>`).join('')}
        </div>
      </div>
      <div class="player-tokens">
        <h5>Tài nguyên đang giữ</h5>
        <div class="tokens-grid">
          ${Object.entries(player.tokens || {}).map(([res, cnt]) => `<span>${res}: ${cnt}</span>`).join('')}
        </div>
      </div>
    `;
  }

  static renderOpponent(opponent) {
    const el = document.createElement('div');
    el.className = 'opponent-card';
    el.innerHTML = `
      <div class="opponent-name">${opponent.name}</div>
      <div class="opponent-points">${opponent.prestigePoints} Điểm</div>
      <div class="opponent-cards-count">Cây: ${opponent.purchasedCards?.length || 0} | Đặt chỗ: ${opponent.reservedCards?.length || 0}</div>
    `;
    return el;
  }
}
