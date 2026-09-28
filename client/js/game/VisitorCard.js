/**
 * VisitorCard represents Noble tiles in Splendor
 */
export class VisitorCard {
  constructor(id, prestigePoints, requirements, imagePath = '') {
    this.id = id;
    this.prestigePoints = prestigePoints; // Usually 3 points
    this.requirements = requirements; // Map of ResourceType (Plant bonuses needed) -> count
    this.imagePath = imagePath;
  }
}
