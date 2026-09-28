/**
 * Resource Types and definitions
 */
export const ResourceType = {
  EARTH: 'EARTH',         // Đất (Brown / Emerald equivalent)
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
