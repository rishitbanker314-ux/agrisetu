import { SatelliteData, SoilData, WeatherData, HistoricalCropData, LocaleInfo, CountryAdapter } from './types.ts';

export interface CountryAdapter {
  getSatelliteData(lat: number, lng: number, date?: Date): Promise<SatelliteData>;
  getSoilData(lat: number, lng: number): Promise<SoilData>;
  getWeatherData(lat: number, lng: number): Promise<WeatherData>;
  getHistoricalCropData(countryCode: string, crop: string): Promise<HistoricalCropData>;
  getLocale(countryCode: string): LocaleInfo;
}

// A functional approach to dispatching the correct adapter methods
// (Actual implementation will be added in subsequent phases)

import { getSatelliteData as fetchEE } from '../services/earthEngine.ts';
import { getWeatherData as fetchMeteo } from '../services/openMeteo.ts';
import { getSoilData as fetchSoil } from '../services/soilGrids.ts';
import { getHistoricalCropData as fetchFAO } from '../services/faostat.ts';

export const getAdapterForCountry = (countryCode: string): CountryAdapter => {
  return {
    getSatelliteData: async (lat, lng, date) => fetchEE(lat, lng, date),
    getSoilData: async (lat, lng) => fetchSoil(lat, lng),
    getWeatherData: async (lat, lng) => fetchMeteo(lat, lng),
    getHistoricalCropData: async (countryCode, crop) => fetchFAO(countryCode, crop),
    getLocale: () => { throw new Error("Not implemented"); },
  };
}
