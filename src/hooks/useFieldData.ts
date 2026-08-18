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
}

export function useFieldData(lat: number, lng: number) {
  const [data, setData] = useState<LiveFieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch live weather data from Open-Meteo API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch live weather data');
        
        const result = await response.json();
        
        // Mocking NDVI and pH since EarthEngine requires an authenticated backend
        setData({
          weather: {
            temperature: result.current.temperature_2m,
            humidity: result.current.relative_humidity_2m,
          },
          soil: {
            // Use real soil moisture if available from Open-Meteo, otherwise mock
            moisture: result.current.soil_moisture_0_to_7cm 
                ? Math.round(result.current.soil_moisture_0_to_7cm * 100) 
                : 24, 
            pH: 6.8, // Typical optimal pH
          },
          ndvi: 0.72, // Mock NDVI representing healthy crop
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
