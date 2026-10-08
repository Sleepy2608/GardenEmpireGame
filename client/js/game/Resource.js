/**
 * Resource Types and definitions
 */
export const ResourceType = {
  DIRT: 'DIRT',           // Đất (Brown / Emerald equivalent)
  EARTH: 'DIRT',          // Alias cho DIRT
  WATER: 'WATER',         // Nước (Blue / Sapphire equivalent)
  SUNLIGHT: 'SUNLIGHT',   // Ánh sáng (Red / Ruby equivalent)
  SEED: 'SEED',           // Hạt giống (Green / Emerald equivalent)
  NUTRIENTS: 'NUTRIENTS', // Dinh dưỡng (Purple / Onyx equivalent)
  WILD: 'WILD'            // Phân bón vàng (Gold / Joker token)
};

export class Resource {
  constructor(type, count = 0) {
    this.type = type;
    this.count = count;
  }
}
