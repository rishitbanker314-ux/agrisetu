export interface PricePoint {
  date: string;
  price: number;
  isForecast: boolean;
  confidenceInterval?: [number, number]; // [lower, upper]
}

export type CropName = 'Wheat' | 'Cotton' | 'Groundnut' | 'Rice' | 'Maize' | 'Soybean' | 'Sugarcane' | 'Mustard';

export const CROPS: CropName[] = ['Wheat', 'Cotton', 'Groundnut', 'Rice', 'Maize', 'Soybean', 'Sugarcane', 'Mustard'];

// Mock historical APMC data for the last 6 months (weekly data points)
const baseData: Record<CropName, number[]> = {
  'Wheat': [2250, 2265, 2240, 2280, 2300, 2315, 2350, 2340, 2360, 2380, 2400, 2425, 2450, 2470, 2460, 2490, 2510, 2530, 2500, 2480, 2495, 2520, 2540, 2560], // Rising trend
  'Cotton': [6800, 6850, 6900, 6880, 6820, 6750, 6700, 6650, 6680, 6720, 6780, 6850, 6900, 6950, 7050, 7150, 7200, 7250, 7220, 7180, 7100, 7050, 7080, 7150], // Volatile
  'Groundnut': [5500, 5450, 5400, 5350, 5320, 5300, 5280, 5300, 5350, 5420, 5500, 5580, 5650, 5700, 5750, 5820, 5900, 5950, 6000, 5980, 5950, 5900, 5850, 5800], // Seasonal
  'Rice': [2900, 2880, 2850, 2900, 2950, 3000, 3050, 3100, 3150, 3100, 3050, 3000, 2950, 2900, 2950, 3000, 3050, 3100, 3150, 3200, 3250, 3300, 3280, 3350],
  'Maize': [2100, 2120, 2150, 2180, 2200, 2250, 2280, 2300, 2320, 2350, 2400, 2450, 2480, 2500, 2550, 2600, 2650, 2700, 2680, 2720, 2750, 2800, 2850, 2900],
  'Soybean': [4800, 4850, 4900, 4950, 5000, 4980, 4950, 4900, 4850, 4800, 4850, 4900, 4950, 5000, 5050, 5100, 5150, 5200, 5250, 5300, 5280, 5350, 5400, 5450],
  'Sugarcane': [310, 315, 320, 318, 315, 310, 315, 320, 325, 330, 335, 340, 338, 335, 330, 325, 320, 315, 310, 315, 320, 325, 330, 335], // Stable/Low variance
  'Mustard': [5200, 5250, 5300, 5350, 5400, 5450, 5500, 5480, 5450, 5400, 5350, 5300, 5250, 5200, 5250, 5300, 5350, 5400, 5450, 5500, 5550, 5600, 5650, 5700],
};

/**
 * Generates an Exponential Moving Average forecast with Momentum
 */
function calculateEMA(data: number[], daysToForecast: number = 10, alpha: number = 0.3): PricePoint[] {
  let ema = data[0];
  const results: PricePoint[] = [];

  // Calculate historical EMA to get the final smoothed value
  for (let i = 0; i < data.length; i++) {
    ema = (alpha * data[i]) + ((1 - alpha) * ema);
  }

  // Calculate standard deviation for confidence intervals
  const variance = data.reduce((acc, val) => acc + Math.pow(val - ema, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  // Generate future dates (weekly) starting from today
  const today = new Date();
  
  // Create historical points (last 15 days for a tighter, daily view)
  const historicalDisplay = data.slice(-15);
  historicalDisplay.forEach((price, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (historicalDisplay.length - 1 - i));
    results.push({
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      price: Math.round(price),
      isForecast: false
    });
  });

  // Calculate recent momentum (trend over the last 5 days)
  const recentData = data.slice(-5);
  const momentum = (recentData[recentData.length - 1] - recentData[0]) / 5;

  // Generate future forecast points
  let currentEma = ema;
  
  for (let i = 1; i <= daysToForecast; i++) {
    // Add momentum and deterministic volatility for realism
    const volatility = (Math.sin(i * 1.5) * (stdDev * 0.15));
    // Dampen momentum slightly over time so it doesn't shoot to infinity
    const dampedMomentum = momentum * Math.exp(-0.1 * i);
    currentEma = currentEma + dampedMomentum + volatility;
    
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    // Confidence interval widens logarithmically over time
    const margin = stdDev * (0.3 + Math.log10(1 + (i * 0.5)));
    
    results.push({
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      price: Math.round(currentEma),
      isForecast: true,
      confidenceInterval: [Math.round(currentEma - margin), Math.round(currentEma + margin)]
    });
  }

  return results;
}

export function getMarketForecast(crop: string): PricePoint[] {
  const data = baseData[crop as CropName] || baseData['Wheat'];
  return calculateEMA(data);
}
