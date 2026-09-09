import { useState, useEffect } from 'react';
import { evaluateCropSuitability, ViabilityReport } from '@/lib/cropViability';

interface ValidationState {
  status: 'idle' | 'validating' | 'success' | 'warning' | 'error';
  message: string | null;
}

export function useCropValidation(crop: string, location: [number, number] | null) {
  const [validation, setValidation] = useState<ValidationState>({
    status: 'idle',
    message: null,
  });

  useEffect(() => {
    // If no crop or location, reset
    if (!crop || crop.trim() === '' || !location) {
      setValidation({ status: 'idle', message: null });
      return;
    }

    const validateCrop = async () => {
      setValidation({ status: 'validating', message: 'Analyzing local climate data...' });

      try {
        const lat = location[0];
        const lng = location[1];
        
        // Fetch current temperature and elevation from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m&timezone=auto`;
        
        // Fetch reverse geocoding from BigDataCloud (free, no key needed)
        const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

        const [weatherRes, geocodeRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(geocodeUrl).catch(() => null) // Ignore geocode errors if it fails
        ]);
        
        if (!weatherRes.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherRes.json();
        const currentTemp = weatherData.current_weather?.temperature;
        const elevation = weatherData.elevation;

        let countryCode: string | undefined = undefined;
        let region: string | undefined = undefined;

        if (geocodeRes && geocodeRes.ok) {
          const geocodeData = await geocodeRes.json();
          countryCode = geocodeData.countryCode;
          region = geocodeData.principalSubdivision;
        }

        if (currentTemp === undefined) {
          throw new Error('Temperature data unavailable');
        }

        const report = evaluateCropSuitability(crop, currentTemp, elevation, countryCode, region);

        setValidation({
          status: report.type,
          message: report.reason,
        });

      } catch (err) {
        console.error("Crop validation error:", err);
        // Fallback or warning if API fails
        setValidation({
          status: 'warning',
          message: 'Could not fetch live weather data to validate crop viability. Please ensure this crop is suitable for your region.',
        });
      }
    };

    // Debounce the API call slightly to avoid spamming if user is typing fast
    const timer = setTimeout(() => {
      validateCrop();
    }, 800);

    return () => clearTimeout(timer);
  }, [crop, location]);

  return validation;
}
