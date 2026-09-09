export interface CropProfile {
  id: string;
  name: string;
  aliases: string[];
  tempMin: number;
  tempMax: number;
  tempOptimalMin: number;
  tempOptimalMax: number;
  altitudeMin?: number;
  altitudeMax?: number;
  description: string;
}

export const CROP_DATABASE: CropProfile[] = [
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['apples', 'seb'],
    tempMin: -10,
    tempMax: 30,
    tempOptimalMin: 15,
    tempOptimalMax: 24,
    altitudeMin: 1200,
    altitudeMax: 3000,
    description: 'Apples require temperate climates with significant chilling hours during winter. They cannot thrive in hot plains or low altitudes.'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    aliases: ['gehu', 'winter wheat', 'spring wheat'],
    tempMin: 3,
    tempMax: 35,
    tempOptimalMin: 15,
    tempOptimalMax: 25,
    description: 'Wheat is a temperate crop that requires cool conditions for vegetative growth. Sustained high temperatures above 35°C severely inhibit tillering and grain filling.'
  },
  {
    id: 'rice',
    name: 'Rice',
    aliases: ['paddy', 'chawal', 'dhan'],
    tempMin: 15,
    tempMax: 40,
    tempOptimalMin: 22,
    tempOptimalMax: 32,
    altitudeMax: 2500,
    description: 'Rice requires a warm and highly humid climate with abundant water availability. Temperatures below 15°C severely affect germination and yield.'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    aliases: ['ganna', 'sugar cane'],
    tempMin: 15,
    tempMax: 45,
    tempOptimalMin: 25,
    tempOptimalMax: 35,
    altitudeMax: 1000,
    description: 'Sugarcane is a long-duration tropical crop requiring prolonged warm temperatures and high soil moisture. Extremely low temperatures stop growth.'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    aliases: ['kapas'],
    tempMin: 16,
    tempMax: 38,
    tempOptimalMin: 21,
    tempOptimalMax: 30,
    altitudeMax: 1200,
    description: 'Cotton requires a long frost-free period and plenty of sunshine. Cool temperatures halt vegetative growth and boll development.'
  },
  {
    id: 'maize',
    name: 'Maize',
    aliases: ['corn', 'makka', 'makkai'],
    tempMin: 10,
    tempMax: 40,
    tempOptimalMin: 21,
    tempOptimalMax: 27,
    description: 'Maize is a versatile crop but prefers warm climates. Extremely high temperatures can reduce pollen viability.'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    aliases: ['soya', 'soyabean'],
    tempMin: 10,
    tempMax: 35,
    tempOptimalMin: 20,
    tempOptimalMax: 30,
    description: 'Soybean requires warm climates. Frost or extreme heat during flowering can severely limit pod setting.'
  },
  {
    id: 'tea',
    name: 'Tea',
    aliases: ['chai'],
    tempMin: 10,
    tempMax: 30,
    tempOptimalMin: 18,
    tempOptimalMax: 25,
    altitudeMin: 500,
    altitudeMax: 2500,
    description: 'Tea requires highly specific hilly terrains with high rainfall and moderate temperatures. The extreme heat of plains is prohibitive.'
  },
  {
    id: 'coffee',
    name: 'Coffee',
    aliases: ['kafi'],
    tempMin: 15,
    tempMax: 30,
    tempOptimalMin: 18,
    tempOptimalMax: 24,
    altitudeMin: 600,
    altitudeMax: 2000,
    description: 'Coffee requires a specific climate with distinct wet and dry seasons, grown at high altitudes to ensure bean quality.'
  },
  {
    id: 'potato',
    name: 'Potato',
    aliases: ['aloo', 'potatoes'],
    tempMin: 5,
    tempMax: 30,
    tempOptimalMin: 15,
    tempOptimalMax: 20,
    description: 'Potatoes require cool night temperatures for proper tuber formation. Extended periods above 30°C halt tuberization entirely.'
  },
  {
    id: 'mango',
    name: 'Mango',
    aliases: ['aam'],
    tempMin: 15,
    tempMax: 45,
    tempOptimalMin: 24,
    tempOptimalMax: 30,
    altitudeMax: 1200,
    description: 'Mangoes are tropical fruits that require warm temperatures. Frost is highly detrimental to the trees.'
  },
  {
    id: 'mustard',
    name: 'Mustard',
    aliases: ['sarson'],
    tempMin: 3,
    tempMax: 30,
    tempOptimalMin: 10,
    tempOptimalMax: 25,
    description: 'Mustard is a cool-season crop. High temperatures during flowering reduce the oil content and yield.'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    aliases: ['tamatar', 'tomatoes'],
    tempMin: 10,
    tempMax: 35,
    tempOptimalMin: 21,
    tempOptimalMax: 28,
    description: 'Tomatoes are warm-season crops. Temperatures above 35°C or below 10°C severely limit fruit set.'
  },
  {
    id: 'onion',
    name: 'Onion',
    aliases: ['pyaz', 'onions'],
    tempMin: 5,
    tempMax: 35,
    tempOptimalMin: 13,
    tempOptimalMax: 24,
    description: 'Onions require cool temperatures for vegetative growth and warm temperatures for bulb maturity.'
  }
];

export function findCropProfile(cropName: string): CropProfile | undefined {
  const normalized = cropName.toLowerCase().trim();
  return CROP_DATABASE.find(crop => 
    crop.name.toLowerCase() === normalized || 
    crop.aliases.includes(normalized) ||
    normalized.includes(crop.name.toLowerCase()) ||
    crop.aliases.some(alias => normalized.includes(alias))
  );
}
