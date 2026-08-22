'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons missing issue in Webpack/Next
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
  markers?: Array<{ lat: number; lng: number; title: string }>;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function Map({ center, zoom = 13, markers = [], onLocationSelect }: MapProps) {
  
  const DraggableMarker = ({ marker }: { marker: { lat: number; lng: number; title: string } }) => {
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
      [],
    );

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
        {/* Simulated Field Boundary for NDVI */}
        <Polygon 
          positions={[
            [marker.lat + 0.005, marker.lng - 0.005],
            [marker.lat + 0.005, marker.lng + 0.005],
            [marker.lat - 0.005, marker.lng + 0.005],
            [marker.lat - 0.005, marker.lng - 0.005]
          ]}
          pathOptions={{ color: 'transparent', fillColor: '#10b981', fillOpacity: 0.4 }}
        />
        <Polygon 
          positions={[
            [marker.lat + 0.002, marker.lng - 0.002],
            [marker.lat + 0.002, marker.lng + 0.002],
            [marker.lat - 0.002, marker.lng + 0.002],
            [marker.lat - 0.002, marker.lng - 0.002]
          ]}
          pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.5 }}
        />
      </>
    );
  };

  return (
    <div className="h-full w-full bg-gray-50 relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={center[0]} lng={center[1]} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {markers.map((marker, idx) => (
          <DraggableMarker key={idx} marker={marker} />
        ))}
      </MapContainer>
      {/* NDVI Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white border-2 border-gray-300 rounded-sm p-2 text-xs font-bold shadow-sm">
        <p className="text-gray-900 uppercase tracking-wider mb-1.5 text-[10px]">Field Health</p>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-3 bg-green-500 rounded-sm inline-block border border-green-700"></span>
          <span className="text-gray-700">Healthy (High NDVI)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-500 rounded-sm inline-block border border-red-700"></span>
          <span className="text-gray-700">Stressed (Low NDVI)</span>
        </div>
      </div>
    </div>
  );
}
