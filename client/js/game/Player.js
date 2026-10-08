/**
 * Player state and inventory
 */
export class Player {
  constructor(id, name, isHost = false) {
    this.id = id;
    this.name = name;
    this.isHost = isHost;
    this.prestigePoints = 0;
    this.tokens = {
      DIRT: 0,
      EARTH: 0,
      WATER: 0,
      SUNLIGHT: 0,
      SEED: 0,
      NUTRIENTS: 0,
      WILD: 0
    };
    this.bonuses = {
      DIRT: 0,
      EARTH: 0,
      WATER: 0,
      SUNLIGHT: 0,
      SEED: 0,
      NUTRIENTS: 0
    };
    this.purchasedCards = [];
    this.reservedCards = []; // Max 3
    this.visitors = [];
  }

  getTotalTokensCount() {
    return Object.values(this.tokens).reduce((sum, val) => sum + val, 0);
  }
}
