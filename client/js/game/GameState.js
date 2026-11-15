/**
 * Complete Game State
 */
export class GameState {
  constructor() {
    this.gameId = null;
    this.players = [];
    this.currentTurnPlayerId = null;
    this.turnStartTime = 0;
    this.turnDurationSeconds = 60;
    this.isGameOver = false;
    this.winnerPlayerId = null;

    // Board state
    this.resourceBank = {
      DIRT: 0,
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

    // Game action logs
    this.actionLogs = [];

    // In-game chat messages
    this.chatMessages = [];
  }

  updateFromDto(dto) {
    Object.assign(this, dto);

    // Normalize boolean flags from backend (Jackson serializes isGameOver -> gameOver and isFinalRound -> finalRound)
    if (dto.gameOver !== undefined || dto.isGameOver !== undefined) {
      this.isGameOver = Boolean(dto.isGameOver ?? dto.gameOver);
    }
    if (dto.finalRound !== undefined || dto.isFinalRound !== undefined) {
      this.isFinalRound = Boolean(dto.isFinalRound ?? dto.finalRound);
    }
    if (dto.turnStartTime !== undefined) {
      this.turnStartTime = Number(dto.turnStartTime) || 0;
    }
    if (dto.turnDurationSeconds !== undefined) {
      this.turnDurationSeconds = Number(dto.turnDurationSeconds) || 60;
    }

    if (dto.actionLogs) {
      this.actionLogs = dto.actionLogs;
    }
    if (dto.chatMessages) {
      this.chatMessages = dto.chatMessages;
    }
  }
}
