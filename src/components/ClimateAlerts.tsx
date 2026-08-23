'use client';

import { useState, useEffect } from 'react';
import { BellRing, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { LiveFieldData } from '@/hooks/useFieldData';

export default function ClimateAlerts({ fieldData }: { fieldData?: LiveFieldData | null }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ title: string, message: string } | null>(null);

  // Analyze real-time forecast data to generate genuine alerts
  useEffect(() => {
    if (!fieldData?.forecast) return;
    
    let alertFound = null;
    
    const { minTemps, maxTemps, precipitation } = fieldData.forecast;
    
    // Check for Frost (below 5°C)
    const hasFrost = minTemps.some(temp => temp < 5);
    // Check for Extreme Heat (above 40°C)
    const hasHeatWave = maxTemps.some(temp => temp > 40);
    // Check for Heavy Rain / Flood Risk (over 50mm in a day)
    const hasFloodRisk = precipitation.some(rain => rain > 50);

    if (hasFrost) {
      alertFound = {
        title: '⚠️ Severe Frost Risk',
        message: 'Temperatures expected to drop below 5°C in the next 7 days. Consider protective irrigation immediately.'
      };
    } else if (hasFloodRisk) {
      alertFound = {
        title: '⚠️ Flood Warning',
        message: 'Extreme precipitation (>50mm) forecasted. Ensure proper field drainage to prevent waterlogging.'
      };
    } else if (hasHeatWave) {
      alertFound = {
        title: '⚠️ Heatwave Alert',
        message: 'Temperatures will exceed 40°C. Increase irrigation frequency to prevent crop heat stress.'
      };
    }

    setActiveAlert(alertFound);
  }, [fieldData]);

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulate SMS subscription network request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      
      // If there is a real alert for this location, trigger the global notification
      if (activeAlert) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('add-notification', { detail: activeAlert }));
        }, 1500);
      }
      
    }, 1200);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        
        <div className="flex justify-between items-center mb-4 border-b border-soft-line pb-4">
          <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            <BellRing className="w-5 h-5 text-terracotta"/>
            Live Alerts
          </h3>
          <span className="text-xs font-medium bg-terracotta/10 text-terracotta px-2 py-1 rounded-sm uppercase tracking-widest">SMS / WA</span>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <p className="text-sm text-ink/70 mb-4 leading-relaxed">
            Get instant early warnings for extreme weather events (frost, drought, floods) directly on your mobile device.
          </p>
          
          {isSubscribed ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-sm p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-700 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-green-900">SUCCESSFULLY SUBSCRIBED</p>
                <p className="text-xs font-bold text-green-700">
                  {activeAlert ? "We detected an alert for your region! Sending now." : "No immediate threats detected for your region."}
                </p>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black py-3 px-4 rounded-sm border-2 border-orange-800 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  ENABLE MOBILE ALERTS
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </>
  );
}
