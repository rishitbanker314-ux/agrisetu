'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Loader2, LineChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MarketInsightsProps {
  center: [number, number];
  crop: string;
}

export default function MarketInsights({ center, crop }: MarketInsightsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: responseData, error: funcError } = await supabase.functions.invoke('market-insights', {
          body: {
            lat: center[0],
            lng: center[1],
            crop: crop
          }
        });

        if (funcError) throw funcError;
        if (responseData && responseData.error) throw new Error(responseData.error);

        setData(responseData);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch market insights.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [center, crop]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 h-full"></div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><LineChart className="w-5 h-5"/></span>
          Market Insights
        </h3>
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider">Live</span>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[120px]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-gray-400 animate-pulse">Analyzing regional commodities...</p>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : data ? (
        <div className="flex-grow flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">Estimated Current Price</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-gray-900 leading-none">
              {data.currency}{data.currentPrice}
            </span>
            <div className="flex flex-col pb-1">
              <span className="text-sm font-bold text-gray-500">{data.unit}</span>
              <span className={`text-sm font-bold flex items-center \${data.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {data.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {data.percentageChange}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-900 leading-relaxed font-medium">
              <DollarSign className="w-4 h-4 inline mr-1 text-blue-600" />
              {data.insight}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available.</p>
        </div>
      )}
    </div>
  );
}
