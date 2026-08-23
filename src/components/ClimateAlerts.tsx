'use client';

import { useState, useEffect } from 'react';
import { BellRing, Smartphone, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

      {/* Dynamic Toast Notification — only renders when triggered */}
      <AnimatePresence>
        {showAlert && activeAlert && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, x: 200, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="fixed top-6 right-4 left-4 md:left-auto md:right-6 z-[9999] max-w-sm mx-auto"
          >
            <div className="bg-white border-4 border-green-700 shadow-2xl rounded-sm p-4 w-full flex gap-3 relative">
              <button onClick={() => setShowAlert(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="bg-green-100 border border-green-200 p-2 rounded-sm h-fit flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black bg-green-600 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-widest">WhatsApp</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Just now</span>
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">{activeAlert.title}</p>
                <p className="text-sm font-bold text-gray-700 leading-snug">
                  {activeAlert.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
