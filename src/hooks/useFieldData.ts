import { useState, useEffect } from 'react';

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
}

export function useFieldData(lat: number, lng: number) {
  const [data, setData] = useState<LiveFieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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
        // Algorithm to simulate a realistic NDVI based on real weather data
        // High moisture + moderate temps = Good NDVI. Dry/Hot = Bad NDVI.
        let baseNdvi = 0.4 + (coordSeed * 0.15 - 0.075);
        if (seededMoisture > 30) baseNdvi += 0.2;
        if (seededMoisture > 50) baseNdvi += 0.15;
        if (currentTemp > 15 && currentTemp < 30) baseNdvi += 0.1;
        if (totalPrecipitation > 20) baseNdvi += 0.1;
        const finalCalculatedNdvi = Math.min(0.95, Math.max(0.1, baseNdvi));

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
        // -----------------------------------------------

        // Algorithm to simulate soil pH based on climate
        // Algorithm to simulate soil pH based on climate
        // High precipitation often leads to acidic soils (leaching), dry climates to alkaline
        let basePh = 7.0 + (coordSeed * 0.8 - 0.4);
        if (totalPrecipitation > 40) basePh -= 0.8;
        else if (totalPrecipitation > 15) basePh -= 0.3;
        else if (seededMoisture < 20) basePh += 0.6;
        else if (currentTemp > 35) basePh += 0.4;

        setData({
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
          // @ts-ignore - appending temporal data
          temporal: {
            ndviProgression: fullSimulatedNdvi
          }
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lat, lng]);

  return { data, loading, error };
}
