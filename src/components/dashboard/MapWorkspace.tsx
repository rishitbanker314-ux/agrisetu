'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import LocationSearch from '../LocationSearch';
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
  fieldId
}: MapWorkspaceProps) {
  
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  return (
    <div className="relative flex-grow w-full h-full bg-paper-ivory overflow-hidden">
      
      {/* Floating Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex justify-between items-start pointer-events-none gap-4">
        
        {/* Left Side: Search */}
        <div className="pointer-events-auto w-full max-w-sm">
          <LocationSearch onLocationFound={(lat, lng) => setCenter([lat, lng])} />
        </div>

        {/* Right Side: Map Controls */}
        <div className="pointer-events-auto flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setMapStyle(s => s === 'street' ? 'satellite' : 'street')}
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
          markers={[{ lat: center[0], lng: center[1], title: 'Selected Field' }]} 
          onLocationSelect={(lat, lng) => setCenter([lat, lng])} 
          temporalNdvi={temporalNdvi}
          mapStyle={mapStyle}
        />
      </div>

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
