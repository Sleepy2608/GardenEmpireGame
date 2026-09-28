/**
 * Complete Game State
 */
export class GameState {
  constructor() {
    this.gameId = null;
    this.players = [];
    this.currentTurnPlayerId = null;
    this.isGameOver = false;
    this.winnerPlayerId = null;

    // Board state
    this.resourceBank = {
      EARTH: 0,
      WATER: 0,
      SUNLIGHT: 0,
      SEED: 0,
      NUTRIENTS: 0,
      WILD: 0
    };

    // Visible cards on board (4 per tier)
    this.visiblePlantCards = {
      tier1: [],
      tier2: [],
      tier3: []
    };

    // Remaining cards count in decks
    this.deckCounts = {
      tier1: 0,
      tier2: 0,
      tier3: 0
    };

    // Visible visitors
    this.visibleVisitors = [];
  }

  updateFromDto(dto) {
    Object.assign(this, dto);
  }
}
