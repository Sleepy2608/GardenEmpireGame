import { GameState } from '../game/GameState.js';
import { GameSocket } from '../websocket/gameSocket.js';
import { roomApi } from '../api/roomApi.js';
import { SoundFX } from './SoundFX.js';
import { PlantCardUI } from './PlantCardUI.js';
import { VisitorUI } from './VisitorUI.js';
import { ResourceUI } from './ResourceUI.js';
import { PlayerUI } from './PlayerUI.js';
import { TabletopFit } from './TabletopFit.js';
import { gameLogUI } from './GameLogUI.js';
import { chatUI } from './ChatUI.js';
import { sessionGuard } from '../utils/sessionGuard.js';
import { navigateTo } from '../utils/navigation.js';

export class BoardUI {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.roomId = urlParams.get('roomId');

    const paramGuestId = urlParams.get('guestId');
    const paramGuestName = urlParams.get('guestName');
    if (paramGuestId) localStorage.setItem('garden_empire_guest_id', paramGuestId);
    if (paramGuestName) localStorage.setItem('garden_empire_guest_name', paramGuestName);

    this.guestId = localStorage.getItem('garden_empire_guest_id') || paramGuestId;
    this.guestName = localStorage.getItem('garden_empire_guest_name') || paramGuestName;

    if (!this.guestName || !this.roomId) {
      navigateTo('lobby');
      return;
    }

    sessionGuard.init({
      onConflict: () => {
        if (this.socket) {
          this.socket.disconnect();
        }
      }
    });

    this.gameState = new GameState();
    this.socket = new GameSocket(this.roomId, this.guestId, (data) => this.handleSocketMessage(data));

    // Token selection state for modal
    this.selectedTokens = {};
    this.selectedCard = null;
    this.isCardFromReserved = false;
    this.hasPlayedVictorySound = false;
    this.lastClaimedVisitorCount = 0;
    this.endgameCountdownSeconds = 20;
    this.endgameTimerInterval = null;
    this.isVictoryModalOpen = false;
    this.hasStartedEndgameCountdown = false;

    this.init();
  }

  init() {
    this.initStaticDOMElements();
    this.initEventListeners();
    gameLogUI.init();
    chatUI.init((msg) => this.sendChatMessage(msg));
    TabletopFit.init();
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
    // Fullscreen / Zoom Toggle (Phóng to / Thu nhỏ toàn màn hình)
    const fullscreenBtn = document.getElementById('btn-toggle-fullscreen');
    if (fullscreenBtn) {
      const fsIcon = fullscreenBtn.querySelector('.fs-icon');
      const fsText = fullscreenBtn.querySelector('.fs-text');

      const updateFullscreenUI = () => {
        const isFs = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement ||
          document.body.classList.contains('is-fullscreen')
        );

        if (isFs) {
          fullscreenBtn.classList.add('is-fullscreen');
          document.body.classList.add('is-fullscreen');
          if (fsIcon) fsIcon.textContent = '🗗';
          if (fsText) fsText.textContent = 'Thu nhỏ';
          fullscreenBtn.title = 'Thu nhỏ màn hình (Esc hoặc bấm để thoát)';
        } else {
          fullscreenBtn.classList.remove('is-fullscreen');
          document.body.classList.remove('is-fullscreen');
          if (fsIcon) fsIcon.textContent = '⛶';
          if (fsText) fsText.textContent = 'Phóng to';
          fullscreenBtn.title = 'Phóng to toàn màn hình (Fit Fullscreen)';
        }

        TabletopFit.adjustFit();
        setTimeout(() => TabletopFit.adjustFit(), 50);
        setTimeout(() => TabletopFit.adjustFit(), 150);
        setTimeout(() => TabletopFit.adjustFit(), 300);
      };

      fullscreenBtn.addEventListener('click', async () => {
        try {
          const isCurrentlyFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.body.classList.contains('is-fullscreen')
          );

          if (!isCurrentlyFs) {
            // Enter Fullscreen
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
              await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
              await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
              await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
              await elem.msRequestFullscreen();
            } else {
              document.body.classList.add('is-fullscreen');
              updateFullscreenUI();
              this.showToast('⛶ Đã phóng to toàn giao diện');
              return;
            }
            this.showToast('⛶ Đã phóng to toàn màn hình');
          } else {
            // Exit Fullscreen
            if (
              document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement
            ) {
              if (document.exitFullscreen) {
                await document.exitFullscreen();
              } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
              } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
              } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
              }
            }
            document.body.classList.remove('is-fullscreen');
            updateFullscreenUI();
            this.showToast('🗗 Đã thu nhỏ màn hình');
          }
        } catch (err) {
          console.warn('Fullscreen request rejected or not supported, falling back to CSS toggle:', err);
          document.body.classList.toggle('is-fullscreen');
          updateFullscreenUI();
          const active = document.body.classList.contains('is-fullscreen');
          this.showToast(active ? '⛶ Đã phóng to toàn giao diện' : '🗗 Đã thu nhỏ giao diện');
        }
      });

      // Synchronize with native fullscreen change events (e.g. Esc key or F11)
      ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateFullscreenUI);
      });
    }

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
          navigateTo('lobby');
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

    // Game Rules Modal Tabs & Navigation
    const rulesBtn = document.getElementById('btn-game-rules');
    const rulesModal = document.getElementById('game-rules-modal');
    const closeRulesBtn = document.getElementById('modal-rules-close');
    const gotItRulesBtn = document.getElementById('btn-rules-got-it');
    const prevRulesTabBtn = document.getElementById('btn-rules-prev-tab');
    const nextRulesTabBtn = document.getElementById('btn-rules-next-tab');
    const rulesTabIndicator = document.getElementById('rules-tab-indicator');
    const rulesTabBtns = Array.from(document.querySelectorAll('.rules-tab-btn'));
    const rulesPanels = Array.from(document.querySelectorAll('.rules-tab-panel'));
    let currentRulesTabIndex = 0;

    const updateRulesTab = (index) => {
      if (!rulesTabBtns.length) return;
      if (index < 0) index = 0;
      if (index >= rulesTabBtns.length) index = rulesTabBtns.length - 1;
      currentRulesTabIndex = index;

      rulesTabBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      rulesPanels.forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
      });

      if (rulesTabIndicator) {
        rulesTabIndicator.textContent = `Trang ${index + 1} / ${rulesTabBtns.length}`;
      }
      if (prevRulesTabBtn) {
        prevRulesTabBtn.style.opacity = index === 0 ? '0.45' : '1';
        prevRulesTabBtn.style.pointerEvents = index === 0 ? 'none' : 'auto';
      }
      if (nextRulesTabBtn) {
        nextRulesTabBtn.style.opacity = index === rulesTabBtns.length - 1 ? '0.45' : '1';
        nextRulesTabBtn.style.pointerEvents = index === rulesTabBtns.length - 1 ? 'none' : 'auto';
      }

      const modalBody = rulesModal?.querySelector('.rules-modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    };

    if (rulesBtn && rulesModal) {
      rulesBtn.addEventListener('click', () => {
        rulesModal.classList.remove('hidden');
        updateRulesTab(currentRulesTabIndex);
      });
    }

    rulesTabBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => updateRulesTab(idx));
    });

    if (prevRulesTabBtn) {
      prevRulesTabBtn.addEventListener('click', () => updateRulesTab(currentRulesTabIndex - 1));
    }

    if (nextRulesTabBtn) {
      nextRulesTabBtn.addEventListener('click', () => updateRulesTab(currentRulesTabIndex + 1));
    }

    if (closeRulesBtn) {
      closeRulesBtn.addEventListener('click', () => this.closeModal('game-rules-modal'));
    }
    if (gotItRulesBtn) {
      gotItRulesBtn.addEventListener('click', () => this.closeModal('game-rules-modal'));
    }

    if (rulesModal) {
      rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
          this.closeModal('game-rules-modal');
        }
      });
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

    // Endgame Action: Back to Lobby immediately
    const backToLobbyBtn = document.getElementById('btn-back-to-lobby');
    if (backToLobbyBtn) {
      backToLobbyBtn.addEventListener('click', () => this.exitGameAndCloseRoom());
    }

    // Endgame Action: Floating Bar Back to Lobby
    const floatingLeaveBtn = document.getElementById('btn-floating-back-to-lobby');
    if (floatingLeaveBtn) {
      floatingLeaveBtn.addEventListener('click', () => this.exitGameAndCloseRoom());
    }

    // Endgame Action: Minimize Victory Modal to Review Board
    const reviewBoardBtn = document.getElementById('btn-review-board');
    if (reviewBoardBtn) {
      reviewBoardBtn.addEventListener('click', () => this.minimizeVictoryModal());
    }

    // Endgame Action: Restore Victory Modal from Floating Bar
    const restoreVictoryBtn = document.getElementById('btn-restore-victory-modal');
    if (restoreVictoryBtn) {
      restoreVictoryBtn.addEventListener('click', () => this.openVictoryModal());
    }
  }

  handleSocketMessage(message) {
    if (message.type === 'GAME_STATE_UPDATE') {
      this.gameState.updateFromDto(message.payload);

      const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
      const myVisitors = myPlayer?.visitors || myPlayer?.claimedVisitors || [];
      const currentVisitorCount = myVisitors.length;
      if (currentVisitorCount > this.lastClaimedVisitorCount) {
        SoundFX.playVisitorSound();
        const newlyClaimed = myVisitors[currentVisitorCount - 1];
        const vMeta = VisitorUI.getVisitorMeta(newlyClaimed?.id, newlyClaimed?.name);
        this.showToast(`${vMeta.icon} Bạn đã đón ${newlyClaimed?.name || 'Khách Thăm'} vào vườn (+3★)!`);
      }
      this.lastClaimedVisitorCount = currentVisitorCount;

      this.render();
      this.checkSpecialGameStates();
    } else if (message.type === 'CHAT_MESSAGE_RECEIVED') {
      chatUI.onMessageReceived(message.message, this.guestId);
    } else if (message.type === 'PLAYER_LEFT_GAME') {
      const leftPlayer = message.leftPlayer;
      const leftName = leftPlayer?.name || 'Nghệ nhân';
      const leftAvatar = leftPlayer?.avatar || '🌱';

      this.showToast(`🍂 ${leftAvatar} ${leftName} đã rời khỏi bàn đấu.`, 'warning');
      try {
        SoundFX.playErrorSound?.();
      } catch (_) {}

      chatUI.onMessageReceived({
        id: 'sys_' + Date.now(),
        senderId: 'SYSTEM',
        senderName: 'Hệ thống',
        senderAvatar: '🍂',
        content: `Nghệ nhân ${leftName} đã rời khỏi bàn cờ.`,
        timestamp: Date.now()
      }, this.guestId);

      if (message.gameState) {
        this.gameState.updateFromDto(message.gameState);
        this.render();
        this.checkSpecialGameStates();
      }
    } else if (message.type === 'ROOM_CLOSED') {
      if (this.endgameTimerInterval) {
        clearInterval(this.endgameTimerInterval);
        this.endgameTimerInterval = null;
      }
      this.showToast(`🔒 ${message.reason || 'Phòng đã kết thúc và được đóng.'}`);
      setTimeout(() => {
        if (this.socket) this.socket.disconnect();
        navigateTo('lobby');
      }, 1200);
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
      VisitorUI.renderVisitorsList(visitorsContainer, this.gameState.visibleVisitors, this.gameState.visitorDeckCount ?? 0);
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
      const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
      if (isMyTurn) {
        myPlayerPanel.classList.add('my-turn-active');
      } else {
        myPlayerPanel.classList.remove('my-turn-active');
      }
      PlayerUI.renderCurrentPlayer(myPlayerPanel, myPlayer, (card) => this.onOpenCardActionModal(card, true));
    }

    // 6. Opponents (Tabletop Seats around the table)
    const opponents = this.gameState.players.filter(p => p.id !== this.guestId);
    PlayerUI.renderTabletopSeats(opponents, this.gameState.currentTurnPlayerId);

    // Fallback if legacy list container exists
    const opponentsContainer = document.getElementById('opponents-list');
    const opponentsCountBadge = document.getElementById('opponents-count');
    if (opponentsContainer) {
      opponentsContainer.innerHTML = '';
      if (opponentsCountBadge) opponentsCountBadge.textContent = opponents.length;

      opponents.forEach(opp => {
        const isCurrentTurn = opp.id === this.gameState.currentTurnPlayerId;
        opponentsContainer.appendChild(PlayerUI.renderOpponent(opp, isCurrentTurn));
      });
    }

    // 7. Game Action Logs Feed
    gameLogUI.render(this.gameState.actionLogs, this.guestId);

    // 8. In-Game Chat Feed
    chatUI.render(this.gameState.chatMessages, this.guestId);

    TabletopFit.adjustFit();
    requestAnimationFrame(() => TabletopFit.adjustFit());
  }

  sendChatMessage(content) {
    if (!content || !content.trim()) return;
    this.socket.send('SEND_CHAT', { message: content.trim() });
  }

  renderTurnBanner() {
    const banner = document.getElementById('turn-indicator-banner');
    const messageEl = document.getElementById('turn-message');
    if (!banner || !messageEl) return;

    const isMyTurn = this.gameState.currentTurnPlayerId === this.guestId;
    banner.classList.remove('my-turn', 'final-round');

    if (this.gameState.isGameOver) {
      const activePlayers = (this.gameState.players || []).filter(p => !p.hasLeft);
      if (activePlayers.length === 1 && activePlayers[0].id === this.guestId) {
        messageEl.textContent = '🏆 ĐỐI THỦ ĐÃ RỜI BÀN — BẠN ĐẠT CHIẾN THẮNG MẶC ĐỊNH!';
      } else {
        messageEl.textContent = '🏆 VÁN ĐẤU ĐÃ KẾT THÚC!';
      }
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
        ${wildNeeded > 0 ? `<div style="color: var(--text-gold); font-weight: 700; margin-top: 0.5rem;">Cần bù: ${wildNeeded} 🌾 Phân Bón (Bạn có: ${playerWild})</div>` : ''}
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
    const baseResources = ['DIRT', 'WATER', 'SUNLIGHT', 'SEED', 'NUTRIENTS'];
    const bank = this.gameState.resourceBank || {};

    baseResources.forEach(res => {
      const meta = ResourceUI.getResourceMeta(res);
      const inBank = bank[res] ?? (res === 'DIRT' ? bank['EARTH'] : 0) ?? 0;
      const selectedCount = this.selectedTokens[res] || 0;

      const card = document.createElement('div');
      card.className = `token-select-option ${selectedCount > 0 ? 'selected' : ''}`;

      const iconDisplay = meta.img
        ? `<img src="${meta.img}" alt="${meta.name}" class="token-img-icon" style="width: 34px; height: 34px;" onerror="this.replaceWith(document.createTextNode('${meta.icon}'))" />`
        : meta.icon;

      card.innerHTML = `
        <div class="token-orb badge-${meta.class}" style="width: 52px; height: 52px; font-size: 1.35rem;">
          ${iconDisplay}
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
      if (!this.hasStartedEndgameCountdown) {
        this.openVictoryModal();
        this.startEndgameCountdown(20);
      }
    }
  }

  openVictoryModal() {
    const victoryModal = document.getElementById('victory-modal');
    const floatingBar = document.getElementById('endgame-floating-bar');
    if (floatingBar) floatingBar.classList.add('hidden');
    if (victoryModal) {
      victoryModal.classList.remove('hidden');
      this.isVictoryModalOpen = true;
      this.renderVictoryPodium();
    }
  }

  minimizeVictoryModal() {
    const victoryModal = document.getElementById('victory-modal');
    const floatingBar = document.getElementById('endgame-floating-bar');
    if (victoryModal) victoryModal.classList.add('hidden');
    if (floatingBar) {
      floatingBar.classList.remove('hidden');
      this.isVictoryModalOpen = false;
      this.updateEndgameFloatingBar();
    }
  }

  updateEndgameFloatingBar() {
    const desc = document.getElementById('floating-bar-winner-desc');
    const pill = document.getElementById('floating-countdown-pill');
    if (pill) {
      pill.textContent = `⏱️ ${this.endgameCountdownSeconds}s`;
    }
    if (desc) {
      const winner = this.getWinnerPlayer();
      if (winner) {
        desc.textContent = `Quán quân: ${winner.name} (★${winner.prestigePoints || 0})`;
      }
    }
  }

  getWinnerPlayer() {
    const activePlayers = (this.gameState.players || []).filter(p => !p.hasLeft);
    const candidateList = activePlayers.length > 0 ? activePlayers : (this.gameState.players || []);
    const sorted = [...candidateList].sort((a, b) => {
      if ((b.prestigePoints || 0) !== (a.prestigePoints || 0)) {
        return (b.prestigePoints || 0) - (a.prestigePoints || 0);
      }
      return (a.purchasedCards?.length || 0) - (b.purchasedCards?.length || 0);
    });
    if (this.gameState.winnerPlayerId) {
      const p = this.gameState.players.find(x => x.id === this.gameState.winnerPlayerId);
      if (p) return p;
    }
    return sorted[0];
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
        const iconDisplay = meta.img
          ? `<img src="${meta.img}" alt="${meta.name}" class="token-mini-icon" onerror="this.replaceWith(document.createTextNode('${meta.icon}'))" />`
          : meta.icon;
        row.innerHTML = `
          <span>${iconDisplay} ${meta.name} (Đang có: ${count})</span>
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
    const myStatus = document.getElementById('victory-my-status');
    if (!list) return;

    list.innerHTML = '';
    const activePlayers = (this.gameState.players || []).filter(p => !p.hasLeft);
    const leftPlayers = (this.gameState.players || []).filter(p => p.hasLeft);

    const sortFn = (a, b) => {
      if ((b.prestigePoints || 0) !== (a.prestigePoints || 0)) {
        return (b.prestigePoints || 0) - (a.prestigePoints || 0);
      }
      return (a.purchasedCards?.length || 0) - (b.purchasedCards?.length || 0);
    };

    activePlayers.sort(sortFn);
    leftPlayers.sort(sortFn);
    const sorted = [...activePlayers, ...leftPlayers];
    const winner = this.getWinnerPlayer() || sorted[0];

    // Announcement banner
    if (announcement && winner) {
      if (activePlayers.length === 1 && winner.id === this.guestId) {
        announcement.textContent = `🏆 TẤT CẢ ĐỐI THỦ ĐÃ RỜI BÀN — BẠN LÀ QUÁN QUÂN DUY NHẤT!`;
      } else if (winner.id === this.guestId) {
        announcement.textContent = `🎉 XUẤT SẮC! BẠN ĐÃ ĐOẠT DANH HIỆU TÂN VƯƠNG ĐẾ CHẾ!`;
      } else {
        announcement.textContent = `★ Chúc mừng ${winner.name} đã đăng quang với ${winner.prestigePoints} Điểm Uy Tín! ★`;
      }
    }

    // My personal status pill
    if (myStatus) {
      const myIndex = sorted.findIndex(p => p.id === this.guestId);
      const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
      if (myIndex === 0) {
        myStatus.className = 'victory-my-status-pill is-winner';
        myStatus.textContent = `👑 Bạn là Quán quân (#1) với ${myPlayer?.prestigePoints || 0} Điểm Uy Tín!`;
      } else if (myIndex > 0) {
        myStatus.className = 'victory-my-status-pill';
        const rankLabels = ['Quán quân', 'Á quân', 'Hạng 3', 'Hạng 4'];
        const label = rankLabels[myIndex] || `Hạng #${myIndex + 1}`;
        myStatus.textContent = `🌿 Bạn đạt ${label} với ${myPlayer?.prestigePoints || 0} Điểm Uy Tín`;
      } else {
        myStatus.className = 'victory-my-status-pill';
        myStatus.textContent = `Ván đấu đã khép lại`;
      }
    }

    const rankIcons = ['🥇', '🥈', '🥉', '4️⃣'];

    sorted.forEach((p, idx) => {
      const hasLeft = Boolean(p.hasLeft);
      const rankIcon = hasLeft ? '🍂' : (rankIcons[idx] || `#${idx + 1}`);
      const isWinner = (winner && p.id === winner.id) || (idx === 0 && !hasLeft);
      const isMe = p.id === this.guestId;
      const card = document.createElement('div');
      card.className = `podium-rank-card ${isWinner ? 'rank-1' : ''} ${isMe ? 'is-me' : ''} ${hasLeft ? 'player-abandoned' : ''}`;

      const avatar = p.avatar || '🌿';
      const cardCount = p.purchasedCards?.length || 0;
      const visitorCount = p.visitors?.length || p.claimedVisitors?.length || 0;
      const tokenCount = Object.values(p.tokens || {}).reduce((a, b) => a + b, 0);
      const statusTag = hasLeft ? '<span class="badge-player-left" style="margin-left: 0.35rem;">🍂 Đã rời ván</span>' : '';

      card.innerHTML = `
        <div class="podium-left">
          <span class="podium-badge">${rankIcon}</span>
          <span style="font-size: 1.4rem;">${avatar}</span>
          <div class="podium-name-group">
            <span class="podium-name">${p.name} ${isWinner ? '👑' : ''} ${statusTag}</span>
            ${isMe ? '<span class="podium-me-tag">Bạn</span>' : ''}
          </div>
        </div>
        <div class="podium-right">
          <span class="podium-score">★ ${p.prestigePoints || 0} Uy Tín</span>
          <span class="podium-meta">${cardCount} cây trồng • ${visitorCount} khách • ${tokenCount} token</span>
        </div>
      `;
      list.appendChild(card);
    });

    this.updateEndgameFloatingBar();
  }

  startEndgameCountdown(totalSeconds = 20) {
    this.hasStartedEndgameCountdown = true;
    this.endgameCountdownSeconds = totalSeconds;

    const updateUI = () => {
      const secondsBadge = document.getElementById('victory-countdown-seconds');
      const progressBar = document.getElementById('victory-countdown-bar');
      const lobbyBtnText = document.getElementById('btn-back-to-lobby-text');
      const floatingPill = document.getElementById('floating-countdown-pill');

      if (secondsBadge) {
        secondsBadge.textContent = `${this.endgameCountdownSeconds}s`;
      }
      if (progressBar) {
        const pct = Math.max(0, (this.endgameCountdownSeconds / totalSeconds) * 100);
        progressBar.style.width = `${pct}%`;
      }
      if (lobbyBtnText) {
        lobbyBtnText.textContent = `Quay Về Sảnh Ngay (${this.endgameCountdownSeconds}s)`;
      }
      if (floatingPill) {
        floatingPill.textContent = `⏱️ ${this.endgameCountdownSeconds}s`;
      }
    };

    updateUI();

    if (this.endgameTimerInterval) clearInterval(this.endgameTimerInterval);
    this.endgameTimerInterval = setInterval(() => {
      this.endgameCountdownSeconds--;
      if (this.endgameCountdownSeconds <= 0) {
        clearInterval(this.endgameTimerInterval);
        this.endgameTimerInterval = null;
        this.exitGameAndCloseRoom();
      } else {
        updateUI();
      }
    }, 1000);
  }

  async exitGameAndCloseRoom() {
    if (this.endgameTimerInterval) {
      clearInterval(this.endgameTimerInterval);
      this.endgameTimerInterval = null;
    }

    const backBtn = document.getElementById('btn-back-to-lobby');
    const floatingLeaveBtn = document.getElementById('btn-floating-back-to-lobby');
    if (backBtn) backBtn.disabled = true;
    if (floatingLeaveBtn) floatingLeaveBtn.disabled = true;

    this.showToast('⏱️ Đang rời phòng và quay về Sảnh Chờ...');

    try {
      const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
      if (myPlayer?.host) {
        await roomApi.closeRoom(this.roomId, this.guestId).catch(() => {});
      } else {
        await roomApi.leaveRoom(this.roomId, this.guestId).catch(() => {});
      }
    } catch (e) {
      // Bỏ qua lỗi mạng
    }

    if (this.socket) {
      this.socket.disconnect();
    }
    navigateTo('lobby');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}${type === 'warning' ? ' toast-warning' : (type === 'error' ? ' toast-error' : '')}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

if (document.getElementById('plant-market-container')) {
  new BoardUI();
}
