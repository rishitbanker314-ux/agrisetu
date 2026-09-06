'use client';

import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons missing issue in Webpack/Next
// Instead of default blue marker, we'll use a nice custom SVG marker
const iconDefault = L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="transform: translate(-50%, -100%);">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16C0 26.667 16 42 16 42C16 42 32 26.667 32 16C32 7.163 24.837 0 16 0Z" fill="#10b981" />
        <circle cx="16" cy="16" r="6" fill="white" />
      </svg>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, -42],
});

// A sleek dot for the points of drawn boundaries
const drawPointIcon = L.divIcon({
  className: 'draw-point-icon',
  html: `<div style="width: 14px; height: 14px; background-color: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// A component to automatically center the map on the selected coordinates
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

// A component to handle click events on the map
function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{ id?: string; lat: number; lng: number; title: string; boundary?: [number, number][] }>;
  activeMarker?: { lat: number; lng: number; boundary?: [number, number][] };
  onLocationSelect?: (lat: number, lng: number) => void;
  temporalNdvi?: number;
  mapStyle?: 'street' | 'satellite';
  isDrawingMode?: boolean;
  drawnBoundary?: [number, number][];
}

// Helper to get color based on NDVI value
function getNdviColor(ndvi: number) {
  if (ndvi > 0.6) return '#10b981'; // Green
  if (ndvi > 0.4) return '#eab308'; // Yellow
  if (ndvi > 0.2) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

const DraggableMarker = ({ marker, temporalNdvi, onLocationSelect }: { marker: { lat: number; lng: number; title: string; boundary?: [number, number][] }, temporalNdvi: number, onLocationSelect?: (lat: number, lng: number) => void }) => {
  const markerRef = useRef<any>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(position.lat, position.lng);
          }
        }
      },
    }),
    [onLocationSelect]
  );

  const fillColor = getNdviColor(temporalNdvi);

  return (
    <>
      <Marker 
        position={[marker.lat, marker.lng]} 
        icon={iconDefault}
        draggable={true}
        eventHandlers={eventHandlers}
        ref={markerRef}
      >
        <Popup>{marker.title} (Drag me!)</Popup>
      </Marker>
      {/* Dynamic Field Boundary for Temporal Simulation */}
      {marker.boundary && marker.boundary.flat().length > 2 ? (
        Array.isArray(marker.boundary[0]) && Array.isArray(marker.boundary[0][0]) ? (
          (marker.boundary as any[]).map((poly, idx) => (
            poly.length > 2 ? <Polygon key={idx} positions={poly} pathOptions={{ color: '#10b981', weight: 3, dashArray: '5, 5', fillColor: fillColor, fillOpacity: 0.45, lineCap: 'round', lineJoin: 'round' }} /> : null
          ))
        ) : (
          <Polygon 
            positions={marker.boundary as [number, number][]}
            pathOptions={{ color: '#10b981', weight: 3, dashArray: '5, 5', fillColor: fillColor, fillOpacity: 0.45, lineCap: 'round', lineJoin: 'round' }}
          />
        )
      ) : (
        <>
          <Polygon 
            positions={[
              [marker.lat + 0.005, marker.lng - 0.005],
              [marker.lat + 0.005, marker.lng + 0.005],
              [marker.lat - 0.005, marker.lng + 0.005],
              [marker.lat - 0.005, marker.lng - 0.005]
            ]}
            pathOptions={{ color: 'transparent', fillColor: fillColor, fillOpacity: 0.4 }}
          />
          <Polygon 
            positions={[
              [marker.lat + 0.002, marker.lng - 0.002],
              [marker.lat + 0.002, marker.lng + 0.002],
              [marker.lat - 0.002, marker.lng + 0.002],
              [marker.lat - 0.002, marker.lng - 0.002]
            ]}
            pathOptions={{ color: 'transparent', fillColor: getNdviColor(temporalNdvi - 0.1), fillOpacity: 0.5 }}
          />
        </>
      )}
    </>
  );
};

export default function Map({ center, zoom = 13, markers = [], activeMarker, onLocationSelect, temporalNdvi = 0.5, mapStyle = 'street', isDrawingMode = false, drawnBoundary = [] }: MapProps) {
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <div className="h-full w-full bg-gray-50 relative">
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-bottom.leaflet-right {
          bottom: 90px !important;
        }
      `}} />
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        {mapStyle === 'satellite' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <RecenterAutomatically lat={center[0]} lng={center[1]} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {markers.map((marker, idx) => (
          <Fragment key={marker.id || idx}>
            <Marker 
              position={[marker.lat, marker.lng]} 
              icon={iconDefault}
              eventHandlers={{
                click: () => onLocationSelect && onLocationSelect(marker.lat, marker.lng)
              }}
            >
              <Popup>{marker.title}</Popup>
            </Marker>
            {marker.boundary && marker.boundary.flat().length > 2 && (
              Array.isArray(marker.boundary[0]) && Array.isArray(marker.boundary[0][0]) ? (
                (marker.boundary as any[]).map((poly, idx) => (
                  poly.length > 2 ? <Polygon key={idx} positions={poly} pathOptions={{ color: '#10b981', weight: 2, dashArray: '4, 4', fillColor: '#10b981', fillOpacity: 0.2 }} eventHandlers={{ click: () => onLocationSelect && onLocationSelect(marker.lat, marker.lng) }} /> : null
                ))
              ) : (
                <Polygon 
                  positions={marker.boundary as [number, number][]}
                  pathOptions={{ color: '#10b981', weight: 2, dashArray: '4, 4', fillColor: '#10b981', fillOpacity: 0.2 }}
                  eventHandlers={{
                    click: () => onLocationSelect && onLocationSelect(marker.lat, marker.lng)
                  }}
                />
              )
            )}
          </Fragment>
        ))}
        {activeMarker && !isDrawingMode && (
          <DraggableMarker marker={{ lat: activeMarker.lat, lng: activeMarker.lng, title: 'Selected Location', boundary: activeMarker.boundary }} temporalNdvi={temporalNdvi} onLocationSelect={onLocationSelect} />
        )}
        
        {/* Drawing Mode Rendering */}
        {isDrawingMode && drawnBoundary.length > 0 && (
          <>
            {drawnBoundary.map((poly: any, idx: number) => {
              if (!Array.isArray(poly) || poly.length === 0 || !Array.isArray(poly[0])) return null;
              return (
                <Fragment key={idx}>
                  {poly.length === 2 && (
                    <Polyline positions={poly} pathOptions={{ color: '#10b981', weight: 3, dashArray: '6, 6', lineCap: 'round', lineJoin: 'round' }} />
                  )}
                  {poly.length > 2 && (
                    <Polygon positions={poly} pathOptions={{ color: '#10b981', weight: 3, dashArray: '6, 6', fillColor: '#10b981', fillOpacity: 0.3, lineCap: 'round', lineJoin: 'round' }} />
                  )}
                  {poly.map((pt: any, ptIdx: number) => (
                    <Marker key={`draw-pt-${idx}-${ptIdx}`} position={pt} icon={drawPointIcon} />
                  ))}
                </Fragment>
              );
            })}
          </>
        )}
      </MapContainer>
      {/* Field Health Forecast Legend Toggle */}
      <div className="absolute bottom-8 left-4 z-[50] pointer-events-auto flex flex-col-reverse gap-2">
        <button 
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="bg-white/90 backdrop-blur-sm border border-soft-line rounded-lg p-2 shadow-lg hover:bg-white transition-colors flex items-center gap-2 group w-fit"
          title="Toggle Health Legend"
        >
          <Activity className="w-5 h-5 text-deep-forest" />
          {isLegendOpen ? <ChevronDown className="w-4 h-4 text-ink/50" /> : <ChevronUp className="w-4 h-4 text-ink/50" />}
        </button>

        {isLegendOpen && (
          <div className="bg-white/90 backdrop-blur-sm border border-soft-line rounded-lg p-3 text-xs shadow-lg w-48 animate-in fade-in slide-in-from-top-2">
            <p className="text-deep-forest font-serif font-medium uppercase tracking-wider mb-2 text-[10px]">Field Health Forecast</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-green-500 rounded-sm inline-block border border-green-700"></span>
                <span className="text-gray-700 text-[10px]">Healthy (NDVI &gt; 0.6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-yellow-500 rounded-sm inline-block border border-yellow-700"></span>
                <span className="text-gray-700 text-[10px]">Mild Stress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-orange-500 rounded-sm inline-block border border-orange-700"></span>
                <span className="text-gray-700 text-[10px]">Moderate Drought</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500 rounded-sm inline-block border border-red-700"></span>
                <span className="text-gray-700 text-[10px]">Severe Drought</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
