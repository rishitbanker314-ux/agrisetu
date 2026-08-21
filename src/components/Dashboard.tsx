'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import DiagnosisUpload from './DiagnosisUpload';
import VoiceCopilot from './VoiceCopilot';
import MarketInsights from './MarketInsights';
import ClimateAlerts from './ClimateAlerts';
import SustainabilityScore from './SustainabilityScore';
import { Leaf, Droplets, Thermometer, Wind, Sprout, Activity, LogOut, User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldData } from '@/hooks/useFieldData';
import { useAdvisory } from '@/hooks/useAdvisory';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

// Dynamically import map with SSR disabled to prevent Leaflet window errors
const Map = dynamic(() => import('./Map'), { ssr: false });

export default function Dashboard() {
  const t = useTranslations('Index'); // Example of using next-intl
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dummy data for scaffolding - this will eventually be hydrated from Supabase
  const [fieldId] = useState('demo-field-123');
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // New Delhi default
  const markers = [{ lat: center[0], lng: center[1], title: 'Selected Field' }];
  
  // Fetch live real-time data
  const { data: fieldData, loading } = useFieldData(center[0], center[1]);
  
  // Fetch AI Advisory
  const { advisory, loading: advisoryLoading } = useAdvisory(fieldData, 'wheat', 'en');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-200">
      {/* Functional Header */}
      <header className="bg-green-800 border-b-4 border-green-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-white text-green-800 p-2 rounded-md shadow-sm border-2 border-green-900">
              <Sprout className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              AgriSetu Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold uppercase tracking-widest bg-green-900 text-green-100 px-4 py-2 rounded-sm border-2 border-green-900 hidden md:block">
              {t('title') || 'Farm Monitor'}
            </div>
            
            {/* Auth UI */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-700 border-2 border-green-900 px-3 py-1.5 rounded-sm">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-sm border border-green-900" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-white" />
                  )}
                  <span className="text-sm font-bold text-white hidden sm:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-green-100 hover:text-white hover:bg-green-700 rounded-sm border-2 border-transparent hover:border-green-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/en/login" 
                className="bg-white hover:bg-gray-100 text-green-800 border-2 border-green-900 text-sm font-black py-2 px-6 rounded-sm transition-colors shadow-sm"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 lg:gap-8">
        
        {/* HOW TO USE / ABOUT SECTION */}
        <section className="bg-white border-2 border-gray-300 rounded-md p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-start">
          <div className="lg:w-1/3">
            <h2 className="text-2xl font-black text-gray-900 mb-2 border-b-4 border-green-600 inline-block pb-1">About AgriSetu</h2>
            <p className="text-gray-700 font-medium leading-relaxed mt-3">
              AgriSetu is a functional, real-time intelligence dashboard designed for farmers. 
              It provides critical satellite data, soil metrics, and hyper-local market insights 
              to help you make informed decisions in the field.
            </p>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-green-700"/> How to Use the Map</h3>
              <p className="text-sm text-gray-600">Select any point on the map to instantly fetch real-time weather, soil moisture, and NDVI health data for that exact location.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Sprout className="w-4 h-4 text-green-700"/> AI Advisory</h3>
              <p className="text-sm text-gray-600">After selecting a location, the AI Advisory will generate actionable steps based on the current weather and soil conditions.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Map, Advisory, Voice Copilot */}
          <section className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
            
            {/* Interactive Map */}
            <div className="bg-white rounded-md shadow-sm border-2 border-gray-300 overflow-hidden relative">
              <div className="absolute top-4 left-4 z-[400] bg-white border-2 border-gray-900 px-4 py-2 rounded-sm text-xs font-black text-gray-900 shadow-sm flex items-center gap-2 pointer-events-none">
                <Activity className="w-4 h-4 text-green-700" /> LIVE FIELD SELECTION
              </div>
              <div className="h-[40vh] lg:h-[400px]">
                <Map 
                  center={center} 
                  zoom={14} 
                  markers={markers} 
                  onLocationSelect={(lat, lng) => setCenter([lat, lng])} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* AI Advisory Card */}
              <div className="bg-white rounded-md shadow-sm border-2 border-gray-300 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-4">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Sprout className="w-6 h-6 text-green-700"/>
                    REAL-TIME ADVISORY
                  </h2>
                </div>
                
                <div className="text-gray-800 leading-relaxed bg-gray-50 p-5 rounded-sm border border-gray-200 min-h-[150px] flex-grow">
                  {advisoryLoading ? (
                    <div className="flex flex-col gap-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-green-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {advisory || "📍 **Select a location on the map** to generate a location-specific advisory based on real-time data."}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Copilot */}
              <div className="h-full">
                <VoiceCopilot fieldData={fieldData} crop="wheat" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
               <MarketInsights center={center} crop="wheat" />
               <SustainabilityScore fieldData={fieldData} />
            </div>

          </section>

          {/* Right Column: Stats & Diagnostics & Alerts */}
          <section className="flex flex-col gap-6 lg:gap-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-sm border-2 border-gray-300 flex flex-col">
              <div className="bg-green-100 border border-green-800 w-8 h-8 rounded-sm flex items-center justify-center mb-3">
                <Leaf className="w-4 h-4 text-green-800" />
              </div>
              <span className="text-2xl font-black text-gray-900 mb-1">
                {loading ? '—' : fieldData?.ndvi.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">NDVI Health</span>
            </div>
            
            <div className="bg-white p-4 rounded-sm border-2 border-gray-300 flex flex-col">
              <div className="bg-blue-100 border border-blue-800 w-8 h-8 rounded-sm flex items-center justify-center mb-3">
                <Droplets className="w-4 h-4 text-blue-800" />
              </div>
              <span className="text-2xl font-black text-gray-900 mb-1">
                {loading ? '—' : `${fieldData?.soil.moisture}%`}
              </span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Moisture</span>
            </div>

            <div className="bg-white p-4 rounded-sm border-2 border-gray-300 flex flex-col">
              <div className="bg-orange-100 border border-orange-800 w-8 h-8 rounded-sm flex items-center justify-center mb-3">
                <Thermometer className="w-4 h-4 text-orange-800" />
              </div>
              <span className="text-2xl font-black text-gray-900 mb-1">
                {loading ? '—' : `${fieldData?.weather.temperature}°C`}
              </span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Temp</span>
            </div>

            <div className="bg-white p-4 rounded-sm border-2 border-gray-300 flex flex-col">
              <div className="bg-teal-100 border border-teal-800 w-8 h-8 rounded-sm flex items-center justify-center mb-3">
                <Wind className="w-4 h-4 text-teal-800" />
              </div>
              <span className="text-2xl font-black text-gray-900 mb-1">
                {loading ? '—' : fieldData?.soil.pH.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Soil pH</span>
            </div>
          </div>
          
          <ClimateAlerts fieldData={fieldData} />

          {/* Diagnostic Upload */}
          <div className="flex-grow">
            <DiagnosisUpload fieldId={fieldId} />
          </div>

        </section>
      </div>
      </main>
    </div>
  );
}
