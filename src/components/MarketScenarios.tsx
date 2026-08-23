'use client';

import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Scenario {
  id: string;
  title: string;
  probability: number;
  trend: 'up' | 'down' | 'stable';
  impact: string;
  recommendation: string;
  recColor: string;
  prices: number[];
}

interface MarketScenariosProps {
  crop: string;
  lat?: number;
  lng?: number;
}

export default function MarketScenarios({ crop, lat = 28.6139, lng = 77.2090 }: MarketScenariosProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScenarios() {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('market-insights', {
          body: { crop, lat, lng }
        });
        
        if (error) throw error;
        // Edge function should return an array of 3 scenarios
        setScenarios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load market scenarios:", err);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchScenarios, 1000);
    return () => clearTimeout(timeout);
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
            Scenario Comparison
          </h2>
          <p className="text-xs text-ink/50 font-medium tracking-wide mt-1 uppercase">
            War-Gaming Simulator for {crop}
          </p>
        </div>
        <div className="bg-moss/10 text-moss text-[10px] font-bold tracking-widest px-3 py-1 rounded-sm uppercase mt-4 md:mt-0 flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" /> AI CONFIDENCE: HIGH
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-700 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Simulating Market Scenarios via Gemini AI...</p>
          </div>
        ) : scenarios.length > 0 ? (
          scenarios.map((scenario, idx) => (
            <div key={scenario.id || idx} className="flex flex-col border border-soft-line rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-paper-ivory p-3 flex justify-between items-center border-b border-soft-line">
              <span className="text-deep-forest font-sans font-medium text-sm">{scenario.title}</span>
              {scenario.trend === 'down' ? <TrendingDown className="w-4 h-4 text-terracotta" /> : 
               scenario.trend === 'up' ? <TrendingUp className="w-4 h-4 text-moss" /> : 
               <AlertTriangle className="w-4 h-4 text-marigold" />}
            </div>
            
            {/* Body */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-sans font-medium text-ink/50 uppercase tracking-widest">Probability</span>
                <span className="text-2xl font-serif text-deep-forest leading-none">{scenario.probability}%</span>
              </div>
              
              <MiniChart data={scenario.prices} />

              <div className="bg-paper-ivory/50 border border-soft-line p-3 rounded-md text-sm text-ink/80 font-sans mb-4 flex-grow overflow-y-auto max-h-32 custom-scrollbar">
                {scenario.impact || 'Analyzing market conditions...'}
              </div>

              <button className="w-full py-2 rounded-md font-sans font-medium text-sm transition-colors border border-soft-line hover:bg-moss/5 text-deep-forest">
                {scenario.recommendation || 'HOLD'}
              </button>
            </div>
          </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500 font-bold text-sm">
            Could not fetch AI generated scenarios. Please ensure the 'market-insights' Edge Function is deployed.
          </div>
        )}
      </div>
    </div>
  );
}
