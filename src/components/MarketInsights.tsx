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
    <div className="bg-white rounded-md shadow-sm border-2 border-gray-300 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-4">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-blue-700"/>
          MARKET INSIGHTS
        </h3>
        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-sm uppercase tracking-widest border border-blue-200">Live</span>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[120px] bg-gray-50 border border-gray-200 rounded-sm">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-2" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fetching Market Data...</p>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-sm p-4">
          <p className="text-red-700 font-bold text-sm text-center">{error}</p>
        </div>
      ) : data ? (
        <div className="flex-grow flex flex-col justify-center bg-gray-50 border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Estimated Current Price</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-gray-900 leading-none">
              {data.currency}{data.currentPrice}
            </span>
            <div className="flex flex-col pb-1">
              <span className="text-sm font-bold text-gray-600">{data.unit}</span>
              <span className={`text-sm font-black flex items-center \${data.trend === 'up' ? 'text-green-700' : 'text-red-700'}`}>
                {data.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {data.percentageChange}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-sm p-4 border border-blue-200 mt-2">
            <p className="text-sm text-blue-900 font-bold leading-relaxed">
              <DollarSign className="w-4 h-4 inline mr-1 text-blue-700" />
              {data.insight}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
          <p className="text-gray-500 font-bold text-sm">NO DATA AVAILABLE.</p>
        </div>
      )}
    </div>
  );
}
