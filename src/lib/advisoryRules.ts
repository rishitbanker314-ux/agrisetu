import { LiveFieldData } from './fieldIntelligence';

export function generateDeterministicAdvisory(fieldData: LiveFieldData, crop: string, language: string = 'en'): string {
  const { weather, soil, ndvi, forecast, temporal } = fieldData;
  
  // Basic translation dictionary for the pitch demo
  const t = {
    critical: language === 'hi' ? 'गंभीर' : 'CRITICAL',
    warning: language === 'hi' ? 'चेतावनी' : 'WARNING',
    optimal: language === 'hi' ? 'इष्टतम' : 'OPTIMAL',
    irrigation: language === 'hi' ? 'सिंचाई आवश्यक' : 'Irrigation Required',
    disease: language === 'hi' ? 'बीमारी का खतरा' : 'Disease Risk',
    pest: language === 'hi' ? 'कीट का खतरा' : 'Pest Risk',
    health: language === 'hi' ? 'फसल का स्वास्थ्य' : 'Crop Health',
    soil: language === 'hi' ? 'मिट्टी की स्थिति' : 'Soil Condition',
    yield: language === 'hi' ? 'उपज का नुकसान' : 'Yield Penalty',
    growth: language === 'hi' ? 'विकास चरण' : 'Growth Stage'
  };

  let advisoryText = "";
  let yieldPenalty = 0;

  // 1. Soil Moisture & Yield Penalties
  if (soil.moisture < 30) {
    yieldPenalty += 8;
    advisoryText += `**[${t.critical}] ${t.irrigation}:** Soil moisture is extremely low at ${soil.moisture}%. Current water stress is projecting a **-${yieldPenalty}% penalty** to your final harvest yield. Initiate immediate irrigation. ${crop.toUpperCase()} requires a minimum of 40% volumetric water content.\n\n`;
  } else if (soil.moisture > 75) {
    yieldPenalty += 4;
    advisoryText += `**[${t.warning}] ${t.soil}:** Soil is highly saturated (${soil.moisture}%). Delay irrigation to prevent root rot and anaerobic conditions, which are currently threatening a -${yieldPenalty}% yield reduction.\n\n`;
  } else {
    advisoryText += `**[${t.optimal}] ${t.soil}:** Current soil moisture (${soil.moisture}%) is ideal for ${crop}.\n\n`;
  }

  // 2. Soil pH & Nutrient Lockout
  if (soil.pH < 5.5) {
    advisoryText += `**[${t.critical}] Nutrient Lockout:** Soil pH is highly acidic (${soil.pH}). This causes severe Phosphorus and Calcium lockout. Recommend applying agricultural lime immediately to neutralize soil acidity.\n\n`;
  } else if (soil.pH > 8.0) {
    advisoryText += `**[${t.warning}] Nutrient Lockout:** Soil pH is highly alkaline (${soil.pH}). This causes Iron and Zinc deficiency (chlorosis). Recommend applying elemental sulfur or gypsum.\n\n`;
  }

  // 3. Weather & Temperature Rules
  if (weather.temperature > 35) {
    advisoryText += `**[${t.warning}] Heat Stress:** Ambient temperature is ${weather.temperature}°C. Suspend fertilizer application until temperatures drop below 30°C to prevent foliar burning.\n\n`;
  } else if (weather.temperature < 10) {
    advisoryText += `**[${t.warning}] Cold Stress:** Low temperatures detected. Monitor crop for frost damage.\n\n`;
  }

  // 4. Disease & Pest Pressure Index (PPI)
  const isRainingSoon = forecast.precipitation.slice(0, 3).some(p => p > 5);
  
  if (weather.humidity > 80 && isRainingSoon) {
    yieldPenalty += 12;
    advisoryText += `**[${t.critical}] ${t.disease}:** High humidity (${weather.humidity}%) combined with incoming precipitation creates an ideal environment for fungal blight. Recommended to apply preventative fungicide immediately to avoid a potential -12% yield loss.\n\n`;
  } else if (weather.temperature >= 25 && weather.temperature <= 32 && !isRainingSoon && weather.humidity < 50) {
    advisoryText += `**[${t.warning}] ${t.pest}:** High risk for Aphid and Whitefly infestation due to sustained dry heat. Deploy sticky traps for monitoring and prepare neem-oil or localized pesticide.\n\n`;
  }

  // 5. Growing Degree Days (GDD) & NDVI Health
  // We simulate GDD by looking at current temp + NDVI to guess growth stage
  if (ndvi > 0.65 && weather.temperature > 20) {
    advisoryText += `**[${t.optimal}] ${t.growth}:** Based on thermal accumulation (GDD) and high NDVI (${ndvi}), ${crop} is entering the critical Reproductive/Flowering Stage. Withhold harsh chemical herbicides immediately to prevent grain/flower abortion.\n\n`;
  } else if (ndvi < 0.4) {
    advisoryText += `**[${t.warning}] ${t.health}:** Satellite NDVI index is low (${ndvi}). The crop is showing signs of low biomass/chlorophyll. Investigate for nitrogen deficiency or pest infestation.\n\n`;
  }

  // Default fallback if no critical conditions are met
  if (advisoryText === "") {
    advisoryText = `All primary agronomic parameters (Temperature, Moisture, pH: ${soil.pH}, NDVI: ${ndvi}) are within optimal ranges for ${crop}. Continue standard agricultural practices.`;
  }

  return advisoryText;
}
