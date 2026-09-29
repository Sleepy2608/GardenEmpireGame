/*
   GARDEN EMPIRE — MAIN BOARD ORCHESTRATOR & INTERACTION MANAGER
*/
import { GameState } from '../game/GameState.js';
import { GameSocket } from '../websocket/gameSocket.js';
import { PlantCardUI } from './PlantCardUI.js';
import { VisitorUI } from './VisitorUI.js';
import { ResourceUI } from './ResourceUI.js';
import { PlayerUI } from './PlayerUI.js';

export class BoardUI {
  constructor() {
    this.guestId = localStorage.getItem('garden_empire_guest_id');
    this.guestName = localStorage.getItem('garden_empire_guest_name');

    const urlParams = new URLSearchParams(window.location.search);
    this.roomId = urlParams.get('roomId');

    if (!this.guestName || !this.roomId) {
      window.location.href = 'lobby.html';
      return;
    }

    this.gameState = new GameState();
    this.socket = new GameSocket(this.roomId, this.guestId, (data) => this.handleSocketMessage(data));

    // Token selection state for modal
    this.selectedTokens = {};
    this.selectedCard = null;
    this.isCardFromReserved = false;

    this.init();
  }

  init() {
    this.initStaticDOMElements();
    this.initEventListeners();
    this.socket.connect();
  }

  initStaticDOMElements() {
    const roomTextEl = document.getElementById('room-id-text');
    if (roomTextEl) roomTextEl.textContent = this.roomId;
  }

  initEventListeners() {
    // Copy Room Code
    const roomBadge = document.getElementById('room-code-display');
    if (roomBadge) {
      roomBadge.addEventListener('click', () => {
        navigator.clipboard.writeText(this.roomId);
        this.showToast('📋 Đã sao chép mã phòng!');
      });
    }

    // Leave Game
    const leaveBtn = document.getElementById('btn-leave-game');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn rời ván đấu?')) {
          window.location.href = 'lobby.html';
        }
      });
    }

    // Open Token Selector Modal
    const openTokenBtn = document.getElementById('btn-open-token-selector');
    if (openTokenBtn) {
      openTokenBtn.addEventListener('click', () => this.openTokenSelectorModal());
    }

    // Close Modals
    const closeCardModal = document.getElementById('modal-card-close');
    if (closeCardModal) {
      closeCardModal.addEventListener('click', () => this.closeModal('card-action-modal'));
    }

    const closeTokenModal = document.getElementById('modal-token-close');
    if (closeTokenModal) {
      closeTokenModal.addEventListener('click', () => this.closeModal('token-selector-modal'));
    }

    // Reset Tokens Button
    const resetTokensBtn = document.getElementById('btn-reset-tokens');
    if (resetTokensBtn) {
      resetTokensBtn.addEventListener('click', () => this.resetTokenSelection());
    }

    // Confirm Take Tokens
    const confirmTokensBtn = document.getElementById('btn-confirm-take-tokens');
    if (confirmTokensBtn) {
      confirmTokensBtn.addEventListener('click', () => this.onConfirmTakeTokens());
    }

    // Back to Lobby on Game Over
    const backToLobbyBtn = document.getElementById('btn-back-to-lobby');
    if (backToLobbyBtn) {
      backToLobbyBtn.addEventListener('click', () => {
        window.location.href = 'lobby.html';
      });
    }
  }

  handleSocketMessage(message) {
    if (message.type === 'GAME_STATE_UPDATE') {
      this.gameState.updateFromDto(message.payload);
      this.render();
      this.checkSpecialGameStates();
    } else if (message.type === 'ERROR') {
      this.showToast(`⚠️ ${message.message || 'Hành động không hợp lệ'}`);
    }
  }

  render() {
    const myPlayer = this.gameState.players.find(p => p.id === this.guestId);

    // 1. Top Turn Indicator Banner
    this.renderTurnBanner();

    // 2. Visitors Section
    const visitorsContainer = document.getElementById('visitors-container');
    if (visitorsContainer) {
      VisitorUI.renderVisitorsList(visitorsContainer, this.gameState.visibleVisitors);
    }

    // 3. Plant Cards Market
    const marketContainer = document.getElementById('plant-market-container');
    if (marketContainer) {
      PlantCardUI.renderMarket(
        marketContainer,
        this.gameState,
        myPlayer,
        (card) => this.onOpenCardActionModal(card, false),
        (tier) => this.onReserveFromDeck(tier)
      );
    }

    // 4. Resource Bank
    const bankContainer = document.getElementById('resource-bank-container');
    if (bankContainer) {
      ResourceUI.renderBank(bankContainer, this.gameState.resourceBank, (type) => this.onTokenOrbClick(type));
    }

    // 5. Current Player (Garden Studio)
    const myPlayerPanel = document.getElementById('my-player-panel');
    if (myPlayerPanel && myPlayer) {
      PlayerUI.renderCurrentPlayer(myPlayerPanel, myPlayer, (card) => this.onOpenCardActionModal(card, true));
    }

    // 6. Opponents Sidebar
    const opponentsContainer = document.getElementById('opponents-list');
    const opponentsCountBadge = document.getElementById('opponents-count');
    if (opponentsContainer) {
      opponentsContainer.innerHTML = '';
      const opponents = this.gameState.players.filter(p => p.id !== this.guestId);
      if (opponentsCountBadge) opponentsCountBadge.textContent = opponents.length;

      opponents.forEach(opp => {
        const isCurrentTurn = opp.id === this.gameState.currentTurnPlayerId;
        opponentsContainer.appendChild(PlayerUI.renderOpponent(opp, isCurrentTurn));
      });
    }
  }

  renderTurnBanner() {
    const banner = document.getElementById('turn-indicator-banner');
    const messageEl = document.getElementById('turn-message');
    if (!banner || !messageEl) return;

    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
    banner.classList.remove('my-turn', 'final-round');

    if (this.gameState.isGameOver) {
      messageEl.textContent = '🏆 VÁN ĐẤU ĐÃ KẾT THÚC!';
      return;
    }

    if (this.gameState.isFinalRound) {
      banner.classList.add('final-round');
    }

    if (isMyTurn) {
      banner.classList.add('my-turn');
      messageEl.textContent = this.gameState.isFinalRound
        ? '🔥 LƯỢT CUỐI CỦA BẠN (VÒNG CHUNG KẾT)!'
        : '✨ ĐANG TỚI LƯỢT CỦA BẠN';
    } else {
      const activePlayer = this.gameState.players.find(p => p.id === this.gameState.currentTurnPlayerId);
      const name = activePlayer?.name || 'Đối thủ';
      messageEl.textContent = `⏳ Đang đợi ${name} suy nghĩ...`;
    }
  }

  // ==========================================
  // CARD ACTION MODAL (BUY / RESERVE)
  // ==========================================
  onOpenCardActionModal(card, fromReserved = false) {
    const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
    this.selectedCard = card;
    this.isCardFromReserved = fromReserved;

    const modal = document.getElementById('card-action-modal');
    const titleEl = document.getElementById('modal-card-title');
    const bodyEl = document.getElementById('modal-card-body');
    const footerEl = document.getElementById('modal-card-footer');

    if (!modal || !bodyEl) return;

    titleEl.textContent = card.name || `Cây Tier ${card.tier}`;

    // Calculate cost breakdown
    const tokens = myPlayer?.tokens || {};
    const bonuses = myPlayer?.bonuses || {};
    let wildNeeded = 0;
    let costBreakdownHtml = '';

    for (const [res, reqAmount] of Object.entries(card.cost || {})) {
      const bonus = bonuses[res] || 0;
      const need = Math.max(0, reqAmount - bonus);
      const have = tokens[res] || 0;
      const meta = ResourceUI.getResourceMeta(res);

      if (have < need) {
        wildNeeded += (need - have);
      }

      costBreakdownHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <span>${meta.icon} ${meta.name}:</span>
          <span>Cần <strong>${reqAmount}</strong> (Giảm: -${bonus} ★ Trả: <strong>${need}</strong>)</span>
        </div>
      `;
    }

    const playerWild = tokens['WILD'] || 0;
    const canAfford = playerWild >= wildNeeded;
    const canReserve = !fromReserved && (myPlayer?.reservedCards?.length || 0) < 3;

    bodyEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 1rem;">
        <div class="card-prestige-badge" style="font-size: 2rem;">★ ${card.prestigePoints || 0} Điểm</div>
        <div class="text-emerald" style="font-weight: 700; margin-top: 0.3rem;">
          Bonus Giảm Giá: +1 ${ResourceUI.getResourceMeta(card.bonusResource).icon} ${card.bonusResource}
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.3); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
        <h5 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Chi Phí & Giảm Giá:</h5>
        ${costBreakdownHtml}
        ${wildNeeded > 0 ? `<div style="color: var(--text-gold); font-weight: 700; margin-top: 0.5rem;">Cần bù: ${wildNeeded} ⭐ Phân Bón Vàng (Bạn có: ${playerWild})</div>` : ''}
      </div>
    `;

    footerEl.innerHTML = `
      ${!fromReserved ? `
        <button class="btn-nature-secondary" id="btn-modal-reserve" ${(!isMyTurn || !canReserve) ? 'disabled' : ''}>
          📑 Giữ Cây (${myPlayer?.reservedCards?.length || 0}/3)
        </button>
      ` : ''}
      <button class="btn-nature-primary" id="btn-modal-buy" ${(!isMyTurn || !canAfford) ? 'disabled' : ''}>
        🌱 Trồng Cây Ngay
      </button>
    `;

    // Button actions
    const buyBtn = document.getElementById('btn-modal-buy');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        this.onBuyCard(card, fromReserved);
        this.closeModal('card-action-modal');
      });
    }

    const reserveBtn = document.getElementById('btn-modal-reserve');
    if (reserveBtn) {
      reserveBtn.addEventListener('click', () => {
        this.onReserveCard(card);
        this.closeModal('card-action-modal');
      });
    }

    modal.classList.remove('hidden');
  }

  onBuyCard(card, fromReserved) {
    this.socket.send('BUY_PLANT', {
      cardId: card.id,
      fromReserved: fromReserved
    });
  }

  onReserveCard(card) {
    this.socket.send('RESERVE_PLANT', {
      cardId: card.id,
      fromDeckTier: null
    });
  }

  onReserveFromDeck(tier) {
    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
    if (!isMyTurn) {
      this.showToast('⚠️ Chưa đến lượt của bạn!');
      return;
    }
    if (confirm(`Bạn có muốn giữ 1 thẻ bí mật từ đầu chồng bài Tier ${tier}?`)) {
      this.socket.send('RESERVE_PLANT', {
        cardId: null,
        fromDeckTier: tier
      });
    }
  }

  // ==========================================
  // TOKEN SELECTOR MODAL
  // ==========================================
  openTokenSelectorModal() {
    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
    if (!isMyTurn) {
      this.showToast('⚠️ Chưa đến lượt của bạn!');
      return;
    }

    this.selectedTokens = {};
    this.renderTokenModalGrid();
    const modal = document.getElementById('token-selector-modal');
    if (modal) modal.classList.remove('hidden');
  }

  onTokenOrbClick(type) {
    if (type === 'WILD') {
      this.showToast('⚠️ Không thể lấy trực tiếp Phân Bón Vàng từ ngân hàng!');
      return;
    }
    this.openTokenSelectorModal();
  }

  renderTokenModalGrid() {
    const grid = document.getElementById('modal-token-selection-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const baseResources = ['EARTH', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS'];
    const bank = this.gameState.resourceBank || {};

    baseResources.forEach(res => {
      const meta = ResourceUI.getResourceMeta(res);
      const inBank = bank[res] || 0;
      const selectedCount = this.selectedTokens[res] || 0;

      const card = document.createElement('div');
      card.className = `token-select-option ${selectedCount > 0 ? 'selected' : ''}`;
      card.style.cssText = `
        background: rgba(0,0,0,0.3);
        border: 1px solid ${selectedCount > 0 ? 'var(--border-nature-focus)' : 'var(--border-subtle)'};
        border-radius: var(--radius-md);
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      `;

      card.innerHTML = `
        <div class="token-orb badge-${meta.class}" style="width: 50px; height: 50px; font-size: 1.2rem;">
          ${meta.icon}
        </div>
        <strong style="font-size: 0.9rem;">${meta.name}</strong>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Còn lại: ${inBank}</span>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-gold);">+${selectedCount}</div>
      `;

      card.addEventListener('click', () => this.toggleSelectToken(res, inBank));
      grid.appendChild(card);
    });

    this.validateTokenSelection();
  }

  toggleSelectToken(res, inBank) {
    const current = this.selectedTokens[res] || 0;
    const totalSelected = Object.values(this.selectedTokens).reduce((a, b) => a + b, 0);

    if (current === 0) {
      if (totalSelected >= 3) {
        this.showToast('⚠️ Đã chọn tối đa 3 token!');
        return;
      }
      if (inBank < 1) {
        this.showToast('⚠️ Tài nguyên này trong ngân hàng đã hết!');
        return;
      }
      this.selectedTokens[res] = 1;
    } else if (current === 1) {
      // Allow choosing 2 of same if bank >= 4 and no other tokens selected
      if (totalSelected === 1 && inBank >= 4) {
        this.selectedTokens[res] = 2;
      } else {
        delete this.selectedTokens[res];
      }
    } else {
      delete this.selectedTokens[res];
    }

    this.renderTokenModalGrid();
  }

  resetTokenSelection() {
    this.selectedTokens = {};
    this.renderTokenModalGrid();
  }

  validateTokenSelection() {
    const confirmBtn = document.getElementById('btn-confirm-take-tokens');
    if (!confirmBtn) return;

    const entries = Object.entries(this.selectedTokens);
    const total = entries.reduce((sum, [_, cnt]) => sum + cnt, 0);

    // Rule: 3 distinct (each 1) OR 2 same (count 2, bank >= 4)
    const isValid3Distinct = (entries.length === 3 && total === 3);
    const isValid2Same = (entries.length === 1 && total === 2 && (this.gameState.resourceBank[entries[0][0]] || 0) >= 4);

    confirmBtn.disabled = !(isValid3Distinct || isValid2Same);
  }

  onConfirmTakeTokens() {
    this.socket.send('TAKE_RESOURCES', {
      tokens: this.selectedTokens
    });
    this.closeModal('token-selector-modal');
  }

  // ==========================================
  // SPECIAL GAME STATES (EXCESS TOKENS / VICTORY)
  // ==========================================
  checkSpecialGameStates() {
    const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;

    // 1. Return Tokens if > 10
    const totalTokens = Object.values(myPlayer?.tokens || {}).reduce((a, b) => a + b, 0);
    const returnModal = document.getElementById('return-tokens-modal');

    if (isMyTurn && totalTokens > 10 && returnModal) {
      returnModal.classList.remove('hidden');
      this.renderReturnTokensModal(myPlayer, totalTokens - 10);
    } else if (returnModal) {
      returnModal.classList.add('hidden');
    }

    // 2. Victory Modal on Game Over
    const victoryModal = document.getElementById('victory-modal');
    if (this.gameState.isGameOver && victoryModal) {
      victoryModal.classList.remove('hidden');
      this.renderVictoryPodium();
    }
  }

  renderReturnTokensModal(player, excessCount) {
    const grid = document.getElementById('modal-return-tokens-grid');
    const confirmBtn = document.getElementById('btn-confirm-return-tokens');
    if (!grid) return;

    grid.innerHTML = '';
    const returnTokens = {};

    Object.entries(player.tokens || {}).forEach(([res, count]) => {
      if (count > 0) {
        const meta = ResourceUI.getResourceMeta(res);
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;';
        row.innerHTML = `
          <span>${meta.icon} ${meta.name} (Đang có: ${count})</span>
          <input type="number" min="0" max="${count}" value="0" style="width: 60px; padding: 0.3rem; background: #000; color: #fff; border: 1px solid var(--border-nature);" />
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
          const val = parseInt(e.target.value) || 0;
          returnTokens[res] = val;
          const sumReturn = Object.values(returnTokens).reduce((a, b) => a + b, 0);
          if (confirmBtn) confirmBtn.disabled = (sumReturn < excessCount);
        });

        grid.appendChild(row);
      }
    });

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        this.socket.send('RETURN_TOKENS', { tokens: returnTokens });
        this.closeModal('return-tokens-modal');
      };
    }
  }

  renderVictoryPodium() {
    const list = document.getElementById('victory-podium-list');
    const announcement = document.getElementById('victory-announcement');
    if (!list) return;

    list.innerHTML = '';
    const sorted = [...this.gameState.players].sort((a, b) => (b.prestigePoints || 0) - (a.prestigePoints || 0));
    const winner = sorted[0];

    if (announcement && winner) {
      announcement.textContent = `Chúc mừng ${winner.name} đã giành chiến thắng với ${winner.prestigePoints} Điểm Uy Tín!`;
    }

    sorted.forEach((p, idx) => {
      const item = document.createElement('div');
      item.style.cssText = `
        background: ${idx === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)'};
        border: 1px solid ${idx === 0 ? 'var(--border-gold)' : 'var(--border-subtle)'};
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-md);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      `;
      item.innerHTML = `
        <div><strong>#${idx + 1} ${p.name}</strong> ${idx === 0 ? '👑' : ''}</div>
        <div class="text-gold" style="font-weight: 800; font-size: 1.1rem;">★ ${p.prestigePoints || 0} Điểm (${p.purchasedCards?.length || 0} cây)</div>
      `;
      list.appendChild(item);
    });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

if (document.getElementById('plant-market-container')) {
  new BoardUI();
}
