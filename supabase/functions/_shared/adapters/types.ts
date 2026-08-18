export interface SatelliteData {
  ndvi: number;
  cloudCover: number;
  timestamp: string;
}

export interface SoilData {
  ph: number;
  nitrogen: number;
  moisture: number;
  timestamp: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfallMm: number;
  forecast: {
    next24hRainfallMm: number;
    next24hMaxTemp: number;
    next24hMinTemp: number;
  };
  timestamp: string;
}

export interface HistoricalCropData {
  crop: string;
  countryCode: string;
  averageYield: number;
  historicalPlantingDates: string[];
  context: string;
}

export interface LocaleInfo {
  countryCode: string;
  language: string;
  currency: string;
  timezone: string;
}
