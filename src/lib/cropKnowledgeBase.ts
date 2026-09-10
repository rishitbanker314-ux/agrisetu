export interface CropProfile {
  id: string;
  name: string;
  aliases: string[];
  tempMin: number;
  tempMax: number;
  tempOptimalMin: number;
  tempOptimalMax: number;
  rainfallMin?: number; // annual or seasonal mm
  rainfallMax?: number;
  humidityMin?: number; // percentage
  humidityMax?: number;
  phMin?: number; // soil pH
  phMax?: number;
  altitudeMin?: number;
  altitudeMax?: number;
  suitableRegions?: string[];
  unsuitableRegions?: string[];
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
    rainfallMin: 600,
    rainfallMax: 1200,
    humidityMin: 50,
    humidityMax: 70,
    phMin: 6.0,
    phMax: 7.0,
    altitudeMin: 1200,
    altitudeMax: 3000,
    suitableRegions: ['Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Sikkim', 'Arunachal Pradesh'],
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
    rainfallMin: 450,
    rainfallMax: 850,
    humidityMin: 40,
    humidityMax: 60,
    phMin: 6.0,
    phMax: 7.5,
    unsuitableRegions: ['Kerala', 'Tamil Nadu', 'Goa', 'Andaman and Nicobar', 'Lakshadweep', 'Puducherry'],
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
    rainfallMin: 1000,
    rainfallMax: 3000,
    humidityMin: 60,
    humidityMax: 90,
    phMin: 5.5,
    phMax: 6.5,
    altitudeMax: 2500,
    unsuitableRegions: ['Rajasthan'],
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
    rainfallMin: 1200,
    rainfallMax: 2500,
    humidityMin: 65,
    humidityMax: 85,
    phMin: 6.5,
    phMax: 7.5,
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
    rainfallMin: 500,
    rainfallMax: 1000,
    humidityMin: 50,
    humidityMax: 70,
    phMin: 6.0,
    phMax: 8.0,
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
    rainfallMin: 500,
    rainfallMax: 900,
    humidityMin: 40,
    humidityMax: 70,
    phMin: 5.8,
    phMax: 7.0,
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
    rainfallMin: 600,
    rainfallMax: 1000,
    humidityMin: 55,
    humidityMax: 75,
    phMin: 6.0,
    phMax: 6.8,
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
    rainfallMin: 1500,
    rainfallMax: 3000,
    humidityMin: 70,
    humidityMax: 90,
    phMin: 4.5,
    phMax: 5.5,
    altitudeMin: 500,
    altitudeMax: 2500,
    suitableRegions: ['Assam', 'West Bengal', 'Kerala', 'Karnataka', 'Tamil Nadu', 'Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Tripura', 'Arunachal Pradesh'],
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
    rainfallMin: 1500,
    rainfallMax: 2500,
    humidityMin: 70,
    humidityMax: 85,
    phMin: 5.0,
    phMax: 6.0,
    altitudeMin: 600,
    altitudeMax: 2000,
    suitableRegions: ['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha'],
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
    rainfallMin: 400,
    rainfallMax: 800,
    humidityMin: 50,
    humidityMax: 70,
    phMin: 5.0,
    phMax: 6.5,
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
    rainfallMin: 700,
    rainfallMax: 2500,
    humidityMin: 40,
    humidityMax: 80,
    phMin: 5.5,
    phMax: 7.5,
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
    rainfallMin: 350,
    rainfallMax: 500,
    humidityMin: 40,
    humidityMax: 60,
    phMin: 6.0,
    phMax: 7.5,
    description: 'Mustard is a cool-season crop. High temperatures during flowering reduce the oil content and yield.'
  },
  {
    id: 'millet',
    name: 'Pearl Millet',
    aliases: ['bajra', 'millet'],
    tempMin: 15,
    tempMax: 45,
    tempOptimalMin: 25,
    tempOptimalMax: 35,
    rainfallMin: 300,
    rainfallMax: 600,
    humidityMin: 20,
    humidityMax: 50,
    phMin: 6.0,
    phMax: 8.5,
    description: 'Pearl millet is extremely hardy and can tolerate severe drought and high temperatures where other crops fail.'
  },
  {
    id: 'jute',
    name: 'Jute',
    aliases: ['pat', 'golden fiber'],
    tempMin: 20,
    tempMax: 40,
    tempOptimalMin: 25,
    tempOptimalMax: 35,
    rainfallMin: 1500,
    rainfallMax: 2500,
    humidityMin: 70,
    humidityMax: 90,
    phMin: 6.0,
    phMax: 7.0,
    suitableRegions: ['West Bengal', 'Assam', 'Bihar', 'Odisha', 'Meghalaya'],
    description: 'Jute is a cash crop that requires hot and highly humid climates with abundant rainfall and standing water for retting.'
  }
];

export function findCropProfile(query: string): CropProfile | undefined {
  const normalizedQuery = query.toLowerCase().trim();
  return CROP_DATABASE.find(crop => 
    crop.id === normalizedQuery || 
    crop.name.toLowerCase() === normalizedQuery ||
    crop.aliases.includes(normalizedQuery)
  );
}
