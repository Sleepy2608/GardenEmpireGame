/**
 * PlantCard represents cards in tiers 1, 2, 3 (Splendor developments)
 */
export class PlantCard {
  constructor(id, tier, prestigePoints, bonusResource, cost, imagePath = '') {
    this.id = id;
    this.tier = tier; // 1, 2, or 3
    this.prestigePoints = prestigePoints;
    this.bonusResource = bonusResource; // Type of Resource it provides as permanent discount
    this.cost = cost; // Map of ResourceType -> number
    this.imagePath = imagePath;
  }
}
