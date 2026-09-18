'use client';

import React, { useState } from 'react';
import { getMarketForecast, CropName, CROPS } from '@/lib/forecasting';
import MarketForecastChart from '@/components/MarketForecastChart';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MarketPage() {
  const [selectedCrop, setSelectedCrop] = useState<CropName>('Wheat');
  const t = useTranslations('Market');

  const forecastData = getMarketForecast(selectedCrop);
  
  // Calculate some quick stats for the UI
  const historicalOnly = forecastData.filter(d => !d.isForecast);
  const currentPrice = historicalOnly[historicalOnly.length - 1].price;
  
  const forecastOnly = forecastData.filter(d => d.isForecast);
  const futurePrice = forecastOnly[forecastOnly.length - 1].price;
  
  const priceChange = futurePrice - currentPrice;
  const percentChange = ((priceChange / currentPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const volatilityText = Math.abs(Number(percentChange)) < 2 
    ? 'low volatility' 
    : isPositive 
      ? 'strong upward momentum' 
      : 'a downward correction';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Market Intelligence</h2>
      </div>
      <p className="text-zinc-500">
        Quantitative Time-Series forecasting based on APMC historical data.
      </p>

      {/* Crop Selector */}
      <div className="flex space-x-4 mb-6">
        {CROPS.map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCrop === crop 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500">Current Price (Quintal)</h3>
            <Activity className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">₹{currentPrice.toLocaleString()}</div>
          <p className="text-xs text-zinc-500">Latest Mandi average</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500">10-Day Forecast</h3>
            {isPositive ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </div>
          <div className="mt-2 text-2xl font-bold">₹{futurePrice.toLocaleString()}</div>
          <p className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{percentChange}% Projected
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">AI Analysis</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Based on Exponential Smoothing (Holt-Winters) analysis of the last 12 weeks, 
            {selectedCrop} prices are showing {volatilityText}. 
            {isPositive 
              ? ' Consider delaying harvest sales to capture higher margins.'
              : ' Recommended to sell current stock before further market devaluation.'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <MarketForecastChart data={forecastData} cropName={selectedCrop} />

    </div>
  );
}
