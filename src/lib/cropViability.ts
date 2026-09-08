export interface ViabilityReport {
  isViable: boolean;
  reason: string;
}

export function checkCropViability(crop: string, fieldData: any): ViabilityReport {
  if (!fieldData || !fieldData.coordinates) {
    return { isViable: true, reason: '' };
  }

  const lat = fieldData.coordinates.lat;
  const temp = fieldData.weather?.temperature || 25;
  const normalizedCrop = crop.toLowerCase();

  // Region logic based on latitude (India roughly 8N to 37N)
  // Apples: require cold climates, typically lat > 30 (Himachal, Kashmir) and lower temperatures.
  if (normalizedCrop === 'apple') {
    if (lat < 28 || temp > 30) {
      return {
        isViable: false,
        reason: "Apples require temperate climates with significant chilling hours during winter (typically regions > 30°N latitude). The current geographical location and temperature profile make commercial apple cultivation biologically unviable here."
      };
    }
  }

  // Sugarcane: Requires tropical/subtropical climate, high moisture and warm temp (20-35).
  if (normalizedCrop === 'sugarcane') {
    const moisture = fieldData.soil?.moisture || 50;
    if (temp < 15 || lat > 32 || moisture < 35) {
      return {
        isViable: false,
        reason: "Sugarcane is a highly water-intensive, tropical crop requiring prolonged warm temperatures (20-35°C) and high soil moisture. This region's current arid conditions, low soil moisture, or high latitude makes it unsuited and unsustainable without massive irrigation infrastructure."
      };
    }
  }

  // Coffee/Tea: Requires specific altitudes and rainfall, usually not viable in hot dry plains.
  if (normalizedCrop === 'coffee' || normalizedCrop === 'tea') {
    if (lat > 28 || temp > 35) {
      return {
        isViable: false,
        reason: `${crop.charAt(0).toUpperCase() + crop.slice(1)} requires specific hilly terrains, high rainfall, and moderate temperatures. The current region's extreme heat or plains topography makes cultivation highly unsuited and economically prohibitive.`
      };
    }
  }

  // Wheat: Temperate crop, requires cool winters. Usually grown in rabi season. If it's too hot, it's not ideal, but let's say extreme heat > 35C average is unviable.
  if (normalizedCrop === 'wheat' && temp > 35) {
    return {
      isViable: false,
      reason: "Wheat is a temperate crop that requires cool conditions for vegetative growth. Sustained high temperatures above 35°C severely inhibit tillering and grain filling."
    };
  }

  // Rice: Requires high water availability and warm weather. If very cold, not viable.
  if (normalizedCrop === 'rice' && temp < 15) {
    return {
      isViable: false,
      reason: "Rice requires a warm and humid climate. Temperatures below 15°C severely affect germination, growth, and grain yield."
    };
  }

  // Cotton: Needs frost-free days and warmth.
  if (normalizedCrop === 'cotton' && temp < 18) {
    return {
      isViable: false,
      reason: "Cotton requires a long frost-free period and plenty of sunshine. Cool temperatures below 18°C halt vegetative growth and boll development."
    };
  }

  // Default true for adaptable crops or if conditions are marginally okay
  return { isViable: true, reason: '' };
}
