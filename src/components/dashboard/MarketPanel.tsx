import React, { useState } from 'react';
import { getMarketForecast, CropName, CROPS } from '@/lib/forecasting';
import MarketForecastChart from '@/components/MarketForecastChart';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

export default function MarketPanel() {
  const [selectedCrop, setSelectedCrop] = useState<CropName>('Wheat');

  const forecastData = getMarketForecast(selectedCrop);
  
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
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest">Market Futures</h3>
        <div className="flex space-x-2">
          {CROPS.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCrop === crop 
                  ? 'bg-moss text-white' 
                  : 'bg-paper-ivory border border-soft-line text-ink/70 hover:bg-soft-line/50'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <div className="rounded-lg border border-soft-line bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink/50">Current Price</h3>
            <Activity className="h-4 w-4 text-ink/50" />
          </div>
          <div className="text-xl font-bold text-deep-forest">₹{currentPrice.toLocaleString()}</div>
          <p className="text-[10px] text-ink/60 uppercase mt-1">Per Quintal</p>
        </div>

        <div className="rounded-lg border border-soft-line bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink/50">30-Day Forecast</h3>
            {isPositive ? <TrendingUp className="h-4 w-4 text-moss" /> : <TrendingDown className="h-4 w-4 text-terracotta" />}
          </div>
          <div className="text-xl font-bold text-deep-forest">₹{futurePrice.toLocaleString()}</div>
          <p className={`text-[10px] uppercase font-bold mt-1 ${isPositive ? 'text-moss' : 'text-terracotta'}`}>
            {isPositive ? '+' : ''}{percentChange}% Projected
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-soft-line bg-terracotta/5 p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-terracotta mb-1">AI Analysis</h4>
          <p className="text-sm text-ink/80 leading-relaxed">
            Based on Holt-Winters smoothing of the last 12 weeks, {selectedCrop} prices show {volatilityText}. 
            {isPositive 
              ? ' Consider delaying harvest sales to capture higher margins.'
              : ' Recommended to sell current stock before further devaluation.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-soft-line p-4 min-h-[300px]">
        <MarketForecastChart data={forecastData} cropName={selectedCrop} />
      </div>
    </div>
  );
}
