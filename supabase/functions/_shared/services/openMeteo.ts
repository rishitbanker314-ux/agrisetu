import { WeatherData } from '../adapters/types.ts';

/**
 * Fetches current weather and short-term forecast from Open-Meteo.
 * Open-Meteo is free for non-commercial use and requires no API key.
 */
export async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  // We use current temperature, humidity, precipitation, and daily max/min/precipitation for the forecast
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour in Next.js
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfallMm: data.current.precipitation,
      forecast: {
        next24hRainfallMm: data.daily.precipitation_sum[0] || 0,
        next24hMaxTemp: data.daily.temperature_2m_max[0] || 0,
        next24hMinTemp: data.daily.temperature_2m_min[0] || 0,
      },
      timestamp: data.current.time || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data");
  }
}
