'use client';

import { useState, useEffect } from 'react';
import { BellRing, Smartphone, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { LiveFieldData } from '@/hooks/useFieldData';

export default function ClimateAlerts({ fieldData }: { fieldData?: LiveFieldData | null }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
      
      // If there is a real alert for this location, trigger the toast after a short delay
      if (activeAlert) {
        setTimeout(() => {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 8000);
        }, 3000);
      }
      
    }, 1200);
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-orange-400 to-red-600 h-full"></div>
        
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-700 p-1.5 rounded-lg"><BellRing className="w-5 h-5"/></span>
            Climate Shock Alerts
          </h3>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider">SMS / WA</span>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Get instant early warnings for extreme weather events (frost, drought, floods) directly on your mobile device.
          </p>
          
          {isSubscribed ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Successfully Subscribed</p>
                <p className="text-xs text-emerald-600">
                  {activeAlert ? "We detected an alert for your region! Sending now." : "No immediate threats detected for your region."}
                </p>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Enable Mobile Alerts
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Toast Notification (Only shows if a real alert exists) */}
      <div className={`fixed top-6 right-6 z-[9999] transition-all duration-500 transform \${showAlert && activeAlert ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-white border-l-4 border-red-500 shadow-2xl rounded-xl p-4 max-w-sm flex gap-3 relative">
          <button onClick={() => setShowAlert(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
          <div className="bg-red-100 p-2 rounded-full h-fit flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-green-500 text-white px-1.5 py-0.5 rounded uppercase">WhatsApp</span>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">{activeAlert?.title}</p>
            <p className="text-sm text-gray-600 leading-snug">
              {activeAlert?.message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
