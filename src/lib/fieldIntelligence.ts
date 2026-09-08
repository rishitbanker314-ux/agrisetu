export interface LiveFieldData {
  coordinates: {
    lat: number;
    lng: number;
  };
  weather: {
    temperature: number;
    humidity: number;
  };
  soil: {
    moisture: number;
    pH: number;
  };
  ndvi: number;
  forecast: {
    maxTemps: number[];
    minTemps: number[];
    precipitation: number[];
  };
  temporal: {
    ndviProgression: number[];
    diseaseRisk: string[];
    estimatedValue: number[];
  };
}

// Baseline yield (Tons/Hectare) and Market Price (INR/Ton)
export const CROP_BASELINES: Record<string, { baseYield: number, price: number }> = {
  "Wheat": { baseYield: 3.5, price: 22750 }, // MSP approx
  "Rice": { baseYield: 4.0, price: 21830 },
  "Cotton": { baseYield: 0.5, price: 66200 },
  "Sugarcane": { baseYield: 70.0, price: 3400 },
  "Maize": { baseYield: 3.0, price: 20900 },
  "Soybeans": { baseYield: 1.2, price: 46000 },
  "Chickpea": { baseYield: 1.0, price: 54400 },
  "Mustard": { baseYield: 1.5, price: 56500 },
  "Groundnut": { baseYield: 1.8, price: 63770 },
  "Bajra": { baseYield: 1.5, price: 25000 },
  "Jowar": { baseYield: 1.2, price: 31800 }
};

export async function generateFieldIntelligence(lat: number, lng: number, boundary?: any[], crop: string = "Wheat", areaHectares: number = 0): Promise<LiveFieldData> {
  // Fetch live weather data & 16-day forecast from Open-Meteo API
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=16`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch live weather data');
  
  const result = await response.json();
  
  const currentTemp = result.current.temperature_2m;
  const currentMoisture = result.current.soil_moisture_0_to_7cm 
    ? Math.round(result.current.soil_moisture_0_to_7cm * 100) 
    : 24;
    
  const maxTemps = result.daily.temperature_2m_max || [];
  const minTemps = result.daily.temperature_2m_min || [];
  const precipitation = result.daily.precipitation_sum || [];
  
  const totalPrecipitation = precipitation.reduce((a: number, b: number) => a + b, 0);
  
  // Pseudo-random seed based on coordinates to ensure distinct data per field
  const coordSeed = ((lat * 12.345) + (lng * 67.890)) % 1; 

  // Apply seed to moisture
  const seededMoisture = Math.min(100, Math.max(0, currentMoisture + (coordSeed * 15 - 7)));
  
  let finalCalculatedNdvi = 0.5;
  let agroPolygonId = null;

  // --- REAL SATELLITE NDVI (AGROMONITORING) ---
  // If the user has drawn a boundary, we fetch actual live satellite crop data
  if (boundary && boundary.length > 0) {
    try {
      const API_KEY = "9cd5e2d7f0db8740b17cc382e0154609";
      
      // Format boundary for GeoJSON (AgroMonitoring requires Longitude, Latitude)
      // Leaflet gives us [Lat, Lng], so we map it to [Lng, Lat]
      const geoJsonCoords = boundary[0].map((coord: number[]) => [coord[1], coord[0]]);
      // Ensure polygon is closed (first and last coordinates match)
      if (geoJsonCoords[0][0] !== geoJsonCoords[geoJsonCoords.length - 1][0] || 
          geoJsonCoords[0][1] !== geoJsonCoords[geoJsonCoords.length - 1][1]) {
        geoJsonCoords.push([...geoJsonCoords[0]]);
      }

      // 1. Create Polygon
      const polyResponse = await fetch(`https://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "User Field",
          geo_json: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [geoJsonCoords]
            }
          }
        })
      });

      if (polyResponse.ok) {
        const polyResult = await polyResponse.json();
        agroPolygonId = polyResult.id;
        
        // 2. Fetch Latest NDVI
        // AgroMonitoring returns historical data up to current day.
        // Calculate unix timestamp for 10 days ago to today.
        const end = Math.floor(Date.now() / 1000);
        const start = end - (10 * 24 * 60 * 60);
        
        const ndviResponse = await fetch(`https://api.agromonitoring.com/agro/1.0/ndvi/history?polyid=${agroPolygonId}&start=${start}&end=${end}&appid=${API_KEY}`);
        if (ndviResponse.ok) {
          const ndviResult = await ndviResponse.json();
          if (ndviResult && ndviResult.length > 0) {
            // Get the most recent satellite pass
            finalCalculatedNdvi = ndviResult[ndviResult.length - 1].data.mean;
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch real satellite data. Falling back to prediction.", e);
    }
  }

  // If no real data fetched, fallback to algorithm based on live weather data
  if (finalCalculatedNdvi === 0.5) {
    let baseNdvi = 0.4 + (coordSeed * 0.15 - 0.075);
    if (seededMoisture > 30) baseNdvi += 0.2;
    if (seededMoisture > 50) baseNdvi += 0.15;
    if (currentTemp > 15 && currentTemp < 30) baseNdvi += 0.1;
    if (totalPrecipitation > 20) baseNdvi += 0.1;
    finalCalculatedNdvi = Math.min(0.95, Math.max(0.1, baseNdvi));
  }

  // --- REAL TEMPORAL DATA (16 DAYS) ---
  // Instead of a random 90 day simulation, use the actual 16-day forecast
  const simulatedMaxTemps = [...maxTemps];
  const simulatedPrecipitation = [...precipitation];
  const simulatedNdvi = [];
  
  let currentSimTemp = currentTemp;
  let currentSimNdvi = finalCalculatedNdvi;

  for (let i = 0; i < maxTemps.length; i++) {
    const rainAmount = precipitation[i] || 0;
    const dayTemp = maxTemps[i] || currentSimTemp;
    
    if (i > 0) {
      // Adjust NDVI slightly day by day based on actual forecast
      if (rainAmount > 5) {
        currentSimNdvi += 0.05;
      } else if (dayTemp > 30) {
        currentSimNdvi -= 0.02; // Drought stress
      }
      currentSimNdvi = Math.min(0.95, Math.max(0.1, currentSimNdvi));
    }
    simulatedNdvi.push(Number(currentSimNdvi.toFixed(2)));
  }
  
  const fullSimulatedNdvi = simulatedNdvi;

  // --- INTELLIGENT DECISION ENGINE ---
  const diseaseRisk = [];
  const estimatedValue = [];
  
  const cropStats = CROP_BASELINES[crop] || { baseYield: 3.0, price: 20000 };
  const safeArea = areaHectares > 0 ? areaHectares : 1; // Default to 1 ha if unknown
  
  for (let i = 0; i < maxTemps.length; i++) {
    const rainAmount = precipitation[i] || 0;
    const dayTemp = maxTemps[i] || currentSimTemp;
    // Use current humidity as a base, increase if raining
    const estHumidity = result.current.relative_humidity_2m + (rainAmount > 0 ? 15 : 0);
    
    // 1. Disease Risk Radar (Fungal/Blight conditions)
    // Fungi love high humidity (>80%) and warm temps (20-30C)
    let risk = "Low";
    if (estHumidity > 80 && dayTemp >= 20 && dayTemp <= 30 && rainAmount > 2) {
      risk = "CRITICAL";
    } else if (estHumidity > 75 && dayTemp > 25) {
      risk = "High";
    } else if (estHumidity > 60) {
      risk = "Medium";
    }
    diseaseRisk.push(risk);
    
    // 2. Economic Yield Optimizer
    // NDVI is crop health (0.1 to ~0.9). Let's say 0.8 is 100% of base yield.
    const ndviEfficiency = Math.min(1.2, simulatedNdvi[i] / 0.8);
    const dailyYield = cropStats.baseYield * safeArea * ndviEfficiency;
    const dailyValue = Math.round(dailyYield * cropStats.price);
    estimatedValue.push(dailyValue);
  }
  // -----------------------------------------------

  // Algorithm to simulate soil pH based on climate
  // High precipitation often leads to acidic soils (leaching), dry climates to alkaline
  let basePh = 7.0 + (coordSeed * 0.8 - 0.4);
  if (totalPrecipitation > 40) basePh -= 0.8;
  else if (totalPrecipitation > 15) basePh -= 0.3;
  else if (seededMoisture < 20) basePh += 0.6;
  else if (currentTemp > 35) basePh += 0.4;

  return {
    coordinates: { lat, lng },
    weather: {
      temperature: currentTemp,
      humidity: result.current.relative_humidity_2m,
    },
    soil: {
      moisture: Math.round(seededMoisture),
      pH: Number(basePh.toFixed(1)),
    },
    ndvi: Number(finalCalculatedNdvi.toFixed(2)),
    forecast: {
      maxTemps: simulatedMaxTemps,
      minTemps,
      precipitation: simulatedPrecipitation,
    },
    temporal: {
      ndviProgression: fullSimulatedNdvi,
      diseaseRisk,
      estimatedValue
    }
  };
}
