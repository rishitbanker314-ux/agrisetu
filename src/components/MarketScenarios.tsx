'use client';

import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MarketData {
  current_market: {
    currentPrice: number;
    unit: string;
    currency: string;
    trend: 'up' | 'down' | 'stable';
    percentageChange: string;
    insight: string;
  };
  historical_data: {
    date: string;
    price: number;
  }[];
  scenarios?: {
    optimistic: number[];
    expected: number[];
    pessimistic: number[];
  };
}

interface MarketScenariosProps {
  crop: string;
  lat?: number;
  lng?: number;
}

export default function MarketScenarios({ crop, lat = 28.6139, lng = 77.2090 }: MarketScenariosProps) {
  const SUPPORTED_CROPS = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'corn', label: 'Corn' },
    { value: 'soy', label: 'Soybean' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugar', label: 'Sugar' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'oats', label: 'Oats' }
  ];

  const [selectedCrop, setSelectedCrop] = useState(crop);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCrop(crop);
  }, [crop]);

  useEffect(() => {
    async function fetchScenarios() {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('market-insights', {
          body: { crop: selectedCrop, lat, lng }
        });
        
        if (error) throw error;
        if (data && data.historical_data) {
          setMarketData(data);
        }
      } catch (err) {
        console.error("Failed to load market data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScenarios();
  }, [selectedCrop, lat, lng]);

  // Mini SVG Line Chart Component
  const MiniChart = ({ data, color = "#1f2937" }: { data: number[], color?: string }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <div className="h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">NO DATA</div>;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full h-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polyline 
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-soft-line pb-4 gap-4 md:gap-0">
        <div>
          <h2 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-moss"/>
            Market Forecast (GBM Model)
          </h2>
          <p className="text-xs text-ink/50 font-medium tracking-wide mt-1 uppercase">
            Stochastic Price Projections (6 Months)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedCrop.toLowerCase()}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-white border border-soft-line text-xs rounded-md px-2 py-1.5 text-deep-forest font-bold tracking-wide focus:outline-none focus:border-moss"
          >
            {SUPPORTED_CROPS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            {!SUPPORTED_CROPS.some(c => c.value === selectedCrop.toLowerCase()) && (
              <option value={selectedCrop.toLowerCase()}>{selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}</option>
            )}
          </select>
          <div className="bg-moss/10 text-moss text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-sm uppercase flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> AI CONFIDENCE: HIGH
          </div>
        </div>
      </div>

      <div className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-700 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Simulating Geometric Brownian Motion...</p>
          </div>
        ) : marketData && marketData.historical_data && marketData.historical_data.length > 0 ? (
          <div className="flex flex-col border border-soft-line rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-paper-ivory p-4 flex justify-between items-center border-b border-soft-line">
              <span className="text-deep-forest font-sans font-medium text-lg">Current {marketData.current_market.unit}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif text-deep-forest">{marketData.current_market.currency}{marketData.current_market.currentPrice.toFixed(2)}</span>
                {marketData.current_market.trend === 'down' ? <TrendingDown className="w-5 h-5 text-terracotta ml-2" /> : 
                 marketData.current_market.trend === 'up' ? <TrendingUp className="w-5 h-5 text-moss ml-2" /> : 
                 <span className="text-marigold ml-2 font-bold">-</span>}
                <span className={`text-sm font-bold ${marketData.current_market.trend === 'down' ? 'text-terracotta' : marketData.current_market.trend === 'up' ? 'text-moss' : 'text-marigold'}`}>
                  {marketData.current_market.percentageChange}
                </span>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col flex-grow">
              
              {marketData.scenarios && (
                <div className="mb-6">
                  <h3 className="font-sans font-bold text-sm text-deep-forest uppercase tracking-widest mb-4">6-Month Forward Projections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-moss/30 rounded-lg p-4 bg-moss/5 relative overflow-hidden">
                      <h4 className="text-moss font-bold text-xs uppercase tracking-widest mb-1">Optimistic (+15% Drift)</h4>
                      <div className="text-2xl font-serif text-moss mb-2">₹{marketData.scenarios.optimistic[5]}</div>
                      <div className="h-16"><MiniChart data={marketData.scenarios.optimistic} color="#10b981" /></div>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 relative overflow-hidden">
                      <h4 className="text-gray-600 font-bold text-xs uppercase tracking-widest mb-1">Expected (+3% Drift)</h4>
                      <div className="text-2xl font-serif text-gray-800 mb-2">₹{marketData.scenarios.expected[5]}</div>
                      <div className="h-16"><MiniChart data={marketData.scenarios.expected} color="#4b5563" /></div>
                    </div>
                    <div className="border border-terracotta/30 rounded-lg p-4 bg-terracotta/5 relative overflow-hidden">
                      <h4 className="text-terracotta font-bold text-xs uppercase tracking-widest mb-1">Pessimistic (-10% Drift)</h4>
                      <div className="text-2xl font-serif text-terracotta mb-2">₹{marketData.scenarios.pessimistic[5]}</div>
                      <div className="h-16"><MiniChart data={marketData.scenarios.pessimistic} color="#ef4444" /></div>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="font-sans font-bold text-sm text-deep-forest uppercase tracking-widest mb-2">AI Market Insight</h3>
              <div className="bg-paper-ivory/50 border border-soft-line p-4 rounded-md text-sm text-ink/80 font-sans leading-relaxed">
                {marketData.current_market.insight || 'Analyzing market conditions...'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 font-bold text-sm">
            Could not fetch live market data. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
