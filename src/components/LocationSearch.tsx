'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';

interface LocationSearchProps {
  onLocationFound: (lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  name?: string;
}

export default function LocationSearch({ onLocationFound, placeholder = "Search location...", className = "", defaultValue = "", name }: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim() || query.length < 3) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await response.json();
        setSuggestions(data || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      // Only fetch if the user is actively typing and the query is not empty
      if (document.activeElement?.tagName === 'INPUT') {
        fetchSuggestions();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (lat: string, lon: string, displayName: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lon);
    
    // First update the query, then close the suggestions, then trigger the callback
    setQuery(displayName.split(',')[0]); // Use shorter name for the input
    setIsOpen(false);
    onLocationFound(latNum, lngNum);
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-soft-line rounded-md px-4 py-2 pr-10 text-sm font-sans font-medium text-deep-forest placeholder-ink/40 shadow-sm focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss"
        />
        {name && <input type="hidden" name={name} value={query} />}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-moss" /> : <Search className="w-4 h-4" />}
        </div>
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-soft-line rounded-md shadow-lg overflow-hidden z-[9999] max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelect(s.lat, s.lon, s.display_name)}
              className="flex items-start gap-3 p-3 hover:bg-moss/5 cursor-pointer border-b border-soft-line/50 last:border-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-moss mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-deep-forest">{s.display_name.split(',')[0]}</span>
                <span className="text-xs text-ink/60 truncate max-w-[250px]">{s.display_name.split(',').slice(1).join(',')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
