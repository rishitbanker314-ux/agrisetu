'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import DiagnosisUpload from './DiagnosisUpload';
import { Leaf, Droplets, Thermometer, Wind, Sprout } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useVoice } from '@/hooks/useVoice';
import { useFieldData } from '@/hooks/useFieldData';

// Dynamically import map with SSR disabled to prevent Leaflet window errors
const Map = dynamic(() => import('./Map'), { ssr: false });

export default function Dashboard() {
  const t = useTranslations('Index'); // Example of using next-intl
  const { speak, isSupported } = useVoice();
  
  // Dummy data for scaffolding - this will eventually be hydrated from Supabase
  const [fieldId] = useState('demo-field-123');
  const [center] = useState<[number, number]>([28.6139, 77.2090]); // New Delhi default
  const markers = [{ lat: 28.6139, lng: 77.2090, title: 'My Primary Wheat Field' }];
  
  // Fetch live real-time data
  const { data: fieldData, loading } = useFieldData(center[0], center[1]);

  const dummyAdvisory = "Your wheat crop is currently healthy with an NDVI of 0.65. Given the upcoming rain tomorrow, avoid applying nitrogen fertilizer today to prevent runoff. The soil moisture is optimal at 24%.";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6" />
            <h1 className="text-xl font-bold">AgriSetu</h1>
          </div>
          <div className="text-sm bg-green-800 px-3 py-1 rounded-full">
            {t('title') || 'Welcome'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Map */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[40vh] lg:h-[500px]">
            <Map center={center} zoom={14} markers={markers} />
          </div>

          {/* AI Advisory Card */}
          <div className="bg-white rounded-xl shadow p-6 border border-green-100">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-800">Current AI Advisory</h2>
              {isSupported && (
                <button 
                  onClick={() => speak(dummyAdvisory, 'en-IN')}
                  className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-100 transition"
                >
                  Listen 🔊
                </button>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed bg-green-50/50 p-4 rounded-lg border border-green-50">
              {dummyAdvisory}
            </p>
          </div>
        </section>

        {/* Right Column: Stats & Diagnostics */}
        <section className="flex flex-col gap-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
              <Leaf className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-2xl font-bold text-gray-800">
                {loading ? '...' : fieldData?.ndvi.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">NDVI (Health)</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
              <Droplets className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-2xl font-bold text-gray-800">
                {loading ? '...' : `${fieldData?.soil.moisture}%`}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Soil Moisture</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
              <Thermometer className="w-6 h-6 text-orange-500 mb-2" />
              <span className="text-2xl font-bold text-gray-800">
                {loading ? '...' : `${fieldData?.weather.temperature}°C`}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Temperature</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
              <Wind className="w-6 h-6 text-teal-500 mb-2" />
              <span className="text-2xl font-bold text-gray-800">
                {loading ? '...' : fieldData?.soil.pH.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Soil pH</span>
            </div>
          </div>

          {/* Diagnostic Upload */}
          <div className="flex-grow">
            <DiagnosisUpload fieldId={fieldId} />
          </div>

        </section>
      </main>
    </div>
  );
}
