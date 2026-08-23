import { useState, useEffect } from 'react';

export interface LiveFieldData {
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
        // Fetch live weather data & 7-day forecast from Open-Meteo API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        
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

        // Algorithm to simulate a realistic NDVI based on real weather data
        // High moisture + moderate temps = Good NDVI. Dry/Hot = Bad NDVI.
        let baseNdvi = 0.4;
        if (currentMoisture > 30) baseNdvi += 0.2;
        if (currentMoisture > 50) baseNdvi += 0.15;
        if (currentTemp > 15 && currentTemp < 30) baseNdvi += 0.1;
        if (totalPrecipitation > 20) baseNdvi += 0.1;
        const finalCalculatedNdvi = Math.min(0.95, Math.max(0.1, baseNdvi));

        // --- TEMPORAL SIMULATION EXPANSION (90 DAYS) ---
        // We extrapolate the 7-day forecast into a 90-day simulation
        // by applying a seasonal trend and randomized noise.
        const simulatedMaxTemps = [...maxTemps];
        const simulatedPrecipitation = [...precipitation];
        const simulatedNdvi = [];
        
        let currentSimTemp = maxTemps[maxTemps.length - 1] || currentTemp;
        let currentSimNdvi = finalCalculatedNdvi;

        for (let i = 7; i < 90; i++) {
          // Trend temperature up slightly over 90 days (summer approaching simulation)
          currentSimTemp += (Math.random() * 0.8) - 0.2; 
          simulatedMaxTemps.push(Number(currentSimTemp.toFixed(1)));
          
          // Random rain events
          const willRain = Math.random() > 0.85;
          const rainAmount = willRain ? Math.random() * 15 : 0;
          simulatedPrecipitation.push(Number(rainAmount.toFixed(1)));

          // Simulate NDVI degrading if hot and dry, improving if rain
          if (rainAmount > 5) {
            currentSimNdvi += 0.05;
          } else if (currentSimTemp > 30) {
            currentSimNdvi -= 0.02; // Drought stress
          }
          currentSimNdvi = Math.min(0.95, Math.max(0.1, currentSimNdvi));
          simulatedNdvi.push(Number(currentSimNdvi.toFixed(2)));
        }
        // Prepend the current 7 days NDVI (static for now)
        const fullSimulatedNdvi = [...Array(7).fill(finalCalculatedNdvi), ...simulatedNdvi];
        // -----------------------------------------------

        // Algorithm to simulate soil pH based on climate
        // High precipitation often leads to acidic soils (leaching), dry climates to alkaline
        let basePh = 7.0;
        if (totalPrecipitation > 40) basePh -= 0.8;
        else if (totalPrecipitation > 15) basePh -= 0.3;
        else if (currentMoisture < 20) basePh += 0.6;
        else if (currentTemp > 35) basePh += 0.4;

        setData({
          weather: {
            temperature: currentTemp,
            humidity: result.current.relative_humidity_2m,
          },
          soil: {
            moisture: currentMoisture,
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
