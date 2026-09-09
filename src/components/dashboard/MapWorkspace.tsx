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
  setCrop: (crop: string) => void;
  onFieldChange: (id: string) => void;
  onSaveField?: (boundary?: [number, number][], newCenter?: [number, number]) => void;
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
  setCrop,
  onFieldChange,
  onSaveField,
  onSelectField
}: MapWorkspaceProps) {
  
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mapStyle');
      if (saved === 'satellite' || saved === 'street') return saved;
    }
    return 'street';
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState<any[]>([]);



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
        <div className="pointer-events-auto flex flex-col items-end gap-2 shrink-0">
          <button 
            onClick={handleMapStyleToggle}
            className={`bg-white border border-soft-line p-2 rounded-md shadow-sm transition-colors text-ink ${mapStyle === 'satellite' ? 'bg-moss/10 border-moss text-moss' : 'hover:bg-moss/5'}`}
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
          markers={savedFields
            .filter(f => f.lat != null && f.lng != null)
            .filter((f, _, arr) => {
              if (!f.boundary || f.boundary.flat().length <= 2) {
                const hasPolygon = arr.some(other => 
                  other.id !== f.id && 
                  Math.abs(other.lat - f.lat) < 0.0001 && 
                  Math.abs(other.lng - f.lng) < 0.0001 && 
                  other.boundary && other.boundary.flat().length > 2
                );
                return !hasPolygon;
              }
              return true;
            })
            .map(f => ({ id: f.id, lat: f.lat, lng: f.lng, title: f.name, boundary: f.boundary }))}
          activeMarker={{ 
            lat: center[0], 
            lng: center[1], 
            boundary: drawnBoundary.flat().length > 2 ? drawnBoundary : (() => {
              const currentField = savedFields.find(f => f.id && f.id.toString() === fieldId);
              if (currentField && currentField.lat != null && Math.abs(currentField.lat - center[0]) < 0.0001 && Math.abs(currentField.lng - center[1]) < 0.0001) {
                return currentField.boundary;
              }
              return undefined;
            })()
          }}
          onLocationSelect={(lat, lng) => {
            if (isDrawing) {
              setDrawnBoundary(prev => { if (prev.length === 0) return [[[lat, lng]]]; const newArr = [...prev]; newArr[newArr.length - 1] = [...newArr[newArr.length - 1], [lat, lng]]; return newArr; });
            } else {
              const existingField = savedFields.find(f => f.lat != null && f.lng != null && Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lng - lng) < 0.0001);
              if (existingField && onSelectField) {
                onSelectField(existingField);
              } else {
                setCenter([lat, lng]);
              }
            }
          }} 
          temporalNdvi={temporalNdvi}
          mapStyle={mapStyle}
          isDrawingMode={isDrawing}
          drawnBoundary={drawnBoundary}
        />
      </div>

      {/* Floating Bottom Left Controls (Draw & Save) */}
      <div className="absolute bottom-24 left-4 z-[500] flex flex-col items-start gap-2 pointer-events-none">
        
        {/* Draw Controls */}
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!isDrawing) {
                setDrawnBoundary(prev => [...prev, []]);
              }
              setIsDrawing(!isDrawing);
            }}
            className={`px-4 py-2 rounded-full shadow-md text-sm font-medium transition-colors pointer-events-auto ${isDrawing ? 'bg-moss text-white' : 'bg-white text-ink hover:bg-moss/10 border border-soft-line'}`}
          >
            {isDrawing ? 'Finish Drawing' : 'Draw Boundary'}
          </button>

          {drawnBoundary.length > 0 && !isDrawing && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setDrawnBoundary([]);
              }}
              className="px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors pointer-events-auto border border-soft-line"
            >
              Clear Shape
            </button>
          )}
        </div>

        {/* Floating Save Button if location is new */}
        {!savedFields.find(f => f.lat != null && f.lng != null && Math.abs(f.lat - center[0]) < 0.0001 && Math.abs(f.lng - center[1]) < 0.0001) && onSaveField && (
          <button
            disabled={drawnBoundary.flat().length <= 2}
            onClick={() => {
              let newCenter: [number, number] | undefined = undefined;
              const allPts = drawnBoundary.flat();
              if (allPts.length > 2) {
                const sumLat = allPts.reduce((sum, p) => sum + p[0], 0);
                const sumLng = allPts.reduce((sum, p) => sum + p[1], 0);
                newCenter = [sumLat / allPts.length, sumLng / allPts.length];
                setCenter(newCenter);
              }
              onSaveField(allPts.length > 2 ? drawnBoundary : undefined, newCenter);
              setDrawnBoundary([]);
              setIsDrawing(false);
            }}
            className={`px-6 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all flex items-center gap-2 border border-white/20 pointer-events-auto ${
              drawnBoundary.flat().length <= 2 
                ? 'bg-ink/60 text-white/70 cursor-not-allowed backdrop-blur-sm' 
                : 'bg-deep-forest text-white hover:bg-moss hover:scale-105'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {drawnBoundary.flat().length <= 2 ? "Draw Boundary to Save" : "Save Field Location"}
          </button>
        )}
      </div>

      {/* Floating Bottom Controls (Above Drawer) */}
      <TemporalSlider dateOffset={dateOffset} setDateOffset={setDateOffset} maxDays={15} fieldData={fieldData} />

      {/* Bottom Drawer Intelligence */}
      <BottomDrawer 
        fieldData={fieldData}
        crop={crop}
        advisory={advisory}
        advisoryLoading={advisoryLoading}
        fieldId={fieldId}
        center={center}
        savedFields={savedFields}
        setCrop={setCrop}
        onFieldChange={onFieldChange}
      />
      
    </div>
  );
}
