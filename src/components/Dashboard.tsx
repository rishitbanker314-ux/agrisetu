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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-green-200">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-green-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-600 tracking-tight">
              AgriSetu
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold uppercase tracking-widest bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 hidden md:block">
              {t('title') || 'AI Dashboard'}
            </div>
            
            {/* Auth UI */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/en/login" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-5 rounded-full transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Map, Advisory, Voice Copilot */}
        <section className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          
          {/* Interactive Map */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-900/5 relative">
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center gap-2 pointer-events-none">
              <Activity className="w-4 h-4 text-emerald-500" /> Live Field Data
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
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group h-full">
              <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-green-400 to-emerald-600 h-full"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg"><Sprout className="w-5 h-5"/></span>
                  Real-Time AI Advisory
                </h2>
              </div>
              
              <div className="text-gray-700 leading-relaxed bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-5 rounded-2xl border border-emerald-100/50 min-h-[150px]">
                {advisoryLoading ? (
                  <div className="flex items-center">
                    <div className="animate-pulse flex space-x-4 w-full">
                      <div className="flex-1 space-y-5 py-1">
                        <div className="h-3 bg-emerald-200/50 rounded w-3/4"></div>
                        <div className="space-y-3">
                          <div className="h-3 bg-emerald-200/50 rounded"></div>
                          <div className="h-3 bg-emerald-200/50 rounded w-5/6"></div>
                          <div className="h-3 bg-emerald-200/50 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-emerald prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-emerald-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {advisory || "📍 **Drop a pin on the map** to generate a location-specific AI advisory based on real-time weather and soil data."}
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
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
              <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-black text-gray-800 mb-1">
                {loading ? '—' : fieldData?.ndvi.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NDVI Health</span>
            </div>
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-gray-800 mb-1">
                {loading ? '—' : `${fieldData?.soil.moisture}%`}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soil Moisture</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
              <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-black text-gray-800 mb-1">
                {loading ? '—' : `${fieldData?.weather.temperature}°C`}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
              <div className="bg-teal-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wind className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-2xl font-black text-gray-800 mb-1">
                {loading ? '—' : fieldData?.soil.pH.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soil pH</span>
            </div>
          </div>
          
          <ClimateAlerts fieldData={fieldData} />

          {/* Diagnostic Upload */}
          <div className="flex-grow">
            <DiagnosisUpload fieldId={fieldId} />
          </div>

        </section>
      </main>
    </div>
  );
}
