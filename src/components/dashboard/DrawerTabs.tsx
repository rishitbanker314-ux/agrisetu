'use client';

import { useState } from 'react';
import AdvisoryPanel from './AdvisoryPanel';
import ForecastChart from '../ForecastChart';
import ClimateAlerts from '../ClimateAlerts';
import MarketScenarios from '../MarketScenarios';
import DiagnosisUpload from '../DiagnosisUpload';
import AcousticBiosphere from '../AcousticBiosphere';
import SustainabilityScore from '../SustainabilityScore';
import NDVIChart from '../NDVIChart';
import { Sprout, CloudRain, Bell, LineChart, Stethoscope, AudioWaveform, Globe, Activity } from 'lucide-react';

interface DrawerTabsProps {
  fieldData: any;
  crop: string;
  advisory: string;
  advisoryLoading: boolean;
  fieldId: string;
}

export default function DrawerTabs({ fieldData, crop, advisory, advisoryLoading, fieldId }: DrawerTabsProps) {
  const [activeTab, setActiveTab] = useState('advisory');

  const tabs = [
    { id: 'advisory', label: 'Advisory', icon: Sprout },
    { id: 'forecast', label: 'Forecast', icon: CloudRain },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'market', label: 'Market futures', icon: LineChart },
    { id: 'ndvi', label: 'NDVI Trends', icon: Activity },
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope },
    { id: 'biosphere', label: 'Acoustic biosphere', icon: AudioWaveform },
    { id: 'sustainability', label: 'Sustainability', icon: Globe },
  ];

  return (
    <div className="flex flex-col h-full bg-paper-ivory rounded-t-xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      {/* Tab Bar */}
      <div className="flex overflow-x-auto border-b border-soft-line custom-scrollbar hide-scrollbar shrink-0 px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-sans whitespace-nowrap transition-colors relative
                ${isActive ? 'text-deep-forest font-medium' : 'text-ink/60 hover:text-ink/80'}`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-moss' : ''}`} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-moss rounded-t-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-hidden relative p-6">
        <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'advisory' && (
            <AdvisoryPanel advisory={advisory} loading={advisoryLoading} />
          )}
          {activeTab === 'forecast' && (
            <div className="h-full">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">7-Day Outlook</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <ForecastChart fieldData={fieldData} />
              </div>
            </div>
          )}
          {activeTab === 'alerts' && (
            <div className="h-full">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">Climate Shock Alerts</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <ClimateAlerts fieldData={fieldData} />
              </div>
            </div>
          )}
          {activeTab === 'market' && (
            <div className="h-full">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">Generative Market Futures</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <MarketScenarios crop={crop} />
              </div>
            </div>
          )}
          {activeTab === 'ndvi' && (
            <div className="h-full">
              <NDVIChart fieldData={fieldData} />
            </div>
          )}
          {activeTab === 'diagnostics' && (
            <div className="h-full max-w-lg mx-auto">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">Crop Disease Diagnostic</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <DiagnosisUpload fieldId={fieldId} />
              </div>
            </div>
          )}
          {activeTab === 'biosphere' && (
            <div className="h-full">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">Acoustic Biosphere</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <AcousticBiosphere moisture={fieldData?.soil?.moisture || 50} />
              </div>
            </div>
          )}
          {activeTab === 'sustainability' && (
            <div className="h-full">
              <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-4">Sustainability & ESG</h3>
              <div className="bg-white rounded-lg border border-soft-line p-4">
                <SustainabilityScore fieldData={fieldData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
