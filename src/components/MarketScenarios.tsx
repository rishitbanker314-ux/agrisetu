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
}

interface MarketScenariosProps {
  crop: string;
  lat?: number;
  lng?: number;
}

export default function MarketScenarios({ crop, lat = 28.6139, lng = 77.2090 }: MarketScenariosProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScenarios() {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('market-insights', {
          body: { crop, lat, lng }
        });
        
        if (error) throw error;
        // Edge function returns an object with scenarios array
        // Edge function returns the direct object now
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
  }, [crop, lat, lng]);

  // Mini SVG Line Chart Component
  const MiniChart = ({ data }: { data: number[] }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <div className="h-24 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">NO DATA</div>;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full h-24 bg-gray-100 border border-gray-300 rounded-sm mt-3 mb-3 overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <polyline 
            points={points}
            fill="none"
            stroke="#1f2937"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full h-px bg-gray-900"></div>
          <div className="w-full h-px bg-gray-900"></div>
          <div className="w-full h-px bg-gray-900"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-soft-line pb-4">
        <div>
          <h2 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-moss"/>
            Live Market Projections
          </h2>
          <p className="text-xs text-ink/50 font-medium tracking-wide mt-1 uppercase">
            Data sourced from Alpha Vantage & AI Models
          </p>
        </div>
        <div className="bg-moss/10 text-moss text-[10px] font-bold tracking-widest px-3 py-1 rounded-sm uppercase mt-4 md:mt-0 flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" /> AI CONFIDENCE: HIGH
        </div>
      </div>

      <div className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-700 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching live market data & trends...</p>
          </div>
        ) : marketData && marketData.historical_data && marketData.historical_data.length > 0 ? (
          <div className="flex flex-col border border-soft-line rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-paper-ivory p-4 flex justify-between items-center border-b border-soft-line">
              <span className="text-deep-forest font-sans font-medium text-lg">Historical Price Trend (Last 12 Months)</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif text-deep-forest">{marketData.current_market.currency}{marketData.current_market.currentPrice.toFixed(2)}</span>
                <span className="text-sm text-ink/60">{marketData.current_market.unit}</span>
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
              <div className="w-full h-48 mb-6 relative">
                <MiniChart data={marketData.historical_data.map(d => d.price)} />
                <div className="flex justify-between text-xs text-ink/50 mt-2">
                  <span>{marketData.historical_data[0]?.date}</span>
                  <span>{marketData.historical_data[marketData.historical_data.length - 1]?.date}</span>
                </div>
              </div>

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
