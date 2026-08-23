'use client';

import { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import LocationSearch from '../LocationSearch';
import WeatherWidget from '../WeatherWidget';
import TemporalSlider from '../TemporalSlider';
import BottomDrawer from './BottomDrawer';
import { Layers } from 'lucide-react';

const Map = dynamic(() => import('../Map'), { ssr: false });

interface MapWorkspaceProps {
  center: [number, number];
  setCenter: (center: [number, number]) => void;
  temporalNdvi: number;
  dateOffset: number;
  setDateOffset: (offset: number) => void;
  // Drawer props
  fieldData: any;
  crop: string;
  advisory: string;
  advisoryLoading: boolean;
  fieldId: string;
  savedFields?: any[];
  onSaveField?: () => void;
  onSelectField?: (field: any) => void;
}

export default function MapWorkspace({
  center,
  setCenter,
  temporalNdvi,
  dateOffset,
  setDateOffset,
  fieldData,
  crop,
  advisory,
  advisoryLoading,
  fieldId,
  savedFields = [],
  onSaveField,
  onSelectField
}: MapWorkspaceProps) {
  
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  useEffect(() => {
    const saved = localStorage.getItem('mapStyle');
    if (saved === 'satellite' || saved === 'street') {
      setMapStyle(saved);
    }
  }, []);

  const handleMapStyleToggle = () => {
    setMapStyle(s => {
      const next = s === 'street' ? 'satellite' : 'street';
      localStorage.setItem('mapStyle', next);
      return next;
    });
  };

  return (
    <div className="relative flex-grow w-full h-full bg-paper-ivory overflow-hidden">
      
      {/* Floating Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex justify-between items-start pointer-events-none gap-4">
        
        {/* Left Side: Search */}
        <div className="pointer-events-auto w-full max-w-sm">
          <LocationSearch onLocationFound={(lat, lng) => setCenter([lat, lng])} />
          <WeatherWidget fieldData={fieldData} />
        </div>

        {/* Right Side: Map Controls */}
        <div className="pointer-events-auto flex flex-col gap-2 shrink-0">
          <button 
            onClick={handleMapStyleToggle}
            className={`bg-white border border-soft-line p-2 rounded-md shadow-sm transition-colors text-ink \${mapStyle === 'satellite' ? 'bg-moss/10 border-moss text-moss' : 'hover:bg-moss/5'}`}
            title="Toggle Map Style"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Map */}
      <div className="w-full h-full">
        <Map 
          center={center} 
          zoom={14} 
          markers={savedFields.map(f => ({ id: f.id, lat: f.lat, lng: f.lng, title: f.name }))}
          activeMarker={{ lat: center[0], lng: center[1] }}
          onLocationSelect={(lat, lng) => {
            const existingField = savedFields.find(f => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lng - lng) < 0.0001);
            if (existingField && onSelectField) {
              onSelectField(existingField);
            } else {
              setCenter([lat, lng]);
            }
          }} 
          temporalNdvi={temporalNdvi}
          mapStyle={mapStyle}
        />
      </div>

      {/* Floating Save Button if location is new */}
      {!savedFields.find(f => Math.abs(f.lat - center[0]) < 0.0001 && Math.abs(f.lng - center[1]) < 0.0001) && onSaveField && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[500] pointer-events-auto">
          <button
            onClick={onSaveField}
            className="bg-deep-forest text-white px-6 py-2.5 rounded-full shadow-lg font-medium text-sm hover:bg-moss hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Field Location
          </button>
        </div>
      )}

      {/* Floating Bottom Controls (Above Drawer) */}
      <TemporalSlider dateOffset={dateOffset} setDateOffset={setDateOffset} maxDays={89} />

      {/* The Bottom Drawer */}
      <BottomDrawer 
        fieldData={fieldData}
        crop={crop}
        advisory={advisory}
        advisoryLoading={advisoryLoading}
        fieldId={fieldId}
      />
      
    </div>
  );
}
