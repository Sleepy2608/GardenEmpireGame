import { GameState } from '../game/GameState.js';
import { GameSocket } from '../websocket/gameSocket.js';
import { roomApi } from '../api/roomApi.js';
import { SoundFX } from './SoundFX.js';
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
    this.hasPlayedVictorySound = false;
    this.lastClaimedVisitorCount = 0;

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

    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
      soundIcon.textContent = SoundFX.isMuted() ? '🔇' : '🔊';
    }
  }

  initEventListeners() {
    // Sound Mute Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', () => {
        const isMuted = SoundFX.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
        this.showToast(isMuted ? '🔇 Đã tắt âm thanh' : '🔊 Đã bật âm thanh');
      });
    }

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
      leaveBtn.addEventListener('click', async () => {
        if (confirm('Bạn có chắc chắn muốn rời ván đấu?')) {
          try {
            await roomApi.leaveRoom(this.roomId, this.guestId);
          } catch (e) {
            // Ignore if already disconnected
          }
          this.socket.disconnect();
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

    // Open Game Rules Modal
    const rulesBtn = document.getElementById('btn-game-rules');
    const rulesModal = document.getElementById('game-rules-modal');
    const closeRulesBtn = document.getElementById('modal-rules-close');
    const gotItRulesBtn = document.getElementById('btn-rules-got-it');

    if (rulesBtn && rulesModal) {
      rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
    }
    if (closeRulesBtn) {
      closeRulesBtn.addEventListener('click', () => this.closeModal('game-rules-modal'));
    }
    if (gotItRulesBtn) {
      gotItRulesBtn.addEventListener('click', () => this.closeModal('game-rules-modal'));
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
      backToLobbyBtn.addEventListener('click', async () => {
        try {
          await roomApi.leaveRoom(this.roomId, this.guestId);
        } catch (e) {
          // Ignore if already cleaned up
        }
        this.socket.disconnect();
        window.location.href = 'lobby.html';
      });
    }
  }

  handleSocketMessage(message) {
    if (message.type === 'GAME_STATE_UPDATE') {
      this.gameState.updateFromDto(message.payload);

      const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
      const currentVisitorCount = myPlayer?.claimedVisitors?.length || 0;
      if (currentVisitorCount > this.lastClaimedVisitorCount) {
        SoundFX.playVisitorSound();
        this.showToast('🦋 Bạn đã đón một Khách Thăm Vườn mới (+3★)!');
      }
      this.lastClaimedVisitorCount = currentVisitorCount;

      this.render();
      this.checkSpecialGameStates();
    } else if (message.type === 'ERROR') {
      SoundFX.playErrorSound();
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
    SoundFX.playBuySound();
    this.socket.send('BUY_PLANT', {
      cardId: card.id,
      fromReserved: fromReserved
    });
  }

  onReserveCard(card) {
    SoundFX.playReserveSound();
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
      SoundFX.playReserveSound();
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

      card.innerHTML = `
        <div class="token-orb badge-${meta.class}" style="width: 52px; height: 52px; font-size: 1.35rem;">
          ${meta.icon}
        </div>
        <div class="token-select-name">${meta.name}</div>
        <div class="token-select-stock">Còn: <strong>${inBank}</strong></div>
        <div class="token-select-counter">${selectedCount > 0 ? `+${selectedCount}` : ''}</div>
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
    SoundFX.playTokenSound();
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
      if (!this.hasPlayedVictorySound) {
        this.hasPlayedVictorySound = true;
        SoundFX.playVictorySound();
      }
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
    const sorted = [...this.gameState.players].sort((a, b) => {
      if ((b.prestigePoints || 0) !== (a.prestigePoints || 0)) {
        return (b.prestigePoints || 0) - (a.prestigePoints || 0);
      }
      return (a.purchasedCards?.length || 0) - (b.purchasedCards?.length || 0);
    });
    const winner = sorted[0];

    if (announcement && winner) {
      announcement.textContent = `★ Chúc mừng ${winner.name} đã giành chiến thắng với ${winner.prestigePoints} Điểm Uy Tín ★!`;
    }

    const rankIcons = ['🥇', '🥈', '🥉', '4️⃣'];

    sorted.forEach((p, idx) => {
      const rankIcon = rankIcons[idx] || `#${idx + 1}`;
      const card = document.createElement('div');
      card.className = `podium-rank-card ${idx === 0 ? 'rank-1' : ''}`;

      const avatar = p.avatar || '🌿';
      const cardCount = p.purchasedCards?.length || 0;
      const visitorCount = p.claimedVisitors?.length || 0;

      card.innerHTML = `
        <div class="podium-left">
          <span class="podium-badge">${rankIcon}</span>
          <span style="font-size: 1.4rem;">${avatar}</span>
          <span class="podium-name">${p.name} ${idx === 0 ? '👑' : ''}</span>
        </div>
        <div class="podium-right">
          <span class="podium-score">★ ${p.prestigePoints || 0} Uy Tín</span>
          <span class="podium-meta">${cardCount} cây trồng • ${visitorCount} khách</span>
        </div>
      `;
      list.appendChild(card);
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
