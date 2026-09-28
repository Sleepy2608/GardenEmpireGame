/**
 * UI Component for main Game Board orchestrating tokens, cards, and players
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
    
    this.init();
  }

  init() {
    this.socket.connect();
  }

  handleSocketMessage(message) {
    console.log('Tin nhắn từ server:', message);
    if (message.type === 'GAME_STATE_UPDATE') {
      this.gameState.updateFromDto(message.payload);
      this.render();
    }
  }

  render() {
    // Render Visitors
    const visitorsContainer = document.getElementById('visitors-container');
    if (visitorsContainer) {
      VisitorUI.renderVisitorsList(visitorsContainer, this.gameState.visibleVisitors);
    }

    // Render Plant Market
    const marketContainer = document.getElementById('plant-market-container');
    if (marketContainer) {
      PlantCardUI.renderMarket(
        marketContainer,
        this.gameState.visiblePlantCards,
        (card) => this.onBuyCard(card),
        (card) => this.onReserveCard(card)
      );
    }

    // Render Resource Bank
    const bankContainer = document.getElementById('resource-bank-container');
    if (bankContainer) {
      ResourceUI.renderBank(bankContainer, this.gameState.resourceBank, (resType) => this.onSelectToken(resType));
    }

    // Render Players
    const myPlayer = this.gameState.players.find(p => p.id === this.guestId);
    const myPlayerContainer = document.getElementById('my-player-info');
    if (myPlayerContainer && myPlayer) {
      PlayerUI.renderCurrentPlayer(myPlayerContainer, myPlayer);
    }

    const opponentsListContainer = document.getElementById('opponents-list');
    if (opponentsListContainer) {
      opponentsListContainer.innerHTML = '';
      const opponents = this.gameState.players.filter(p => p.id !== this.guestId);
      opponents.forEach(opp => {
        opponentsListContainer.appendChild(PlayerUI.renderOpponent(opp));
      });
    }
  }

  onBuyCard(card) {
    this.socket.send('BUY_CARD', { cardId: card.id });
  }

  onReserveCard(card) {
    this.socket.send('RESERVE_CARD', { cardId: card.id });
  }

  onSelectToken(tokenType) {
    this.socket.send('TAKE_TOKEN', { tokenType });
  }
}

if (document.getElementById('plant-market-container')) {
  new BoardUI();
}
