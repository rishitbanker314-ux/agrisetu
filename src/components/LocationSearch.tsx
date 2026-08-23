'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  onLocationFound: (lat: number, lng: number) => void;
}

export default function LocationSearch({ onLocationFound }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationFound(lat, lng);
        setQuery('');
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full bg-white border border-soft-line rounded-md px-4 py-2 pr-10 text-sm font-sans font-medium text-deep-forest placeholder-ink/40 shadow-sm focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-moss transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-terracotta/10 text-terracotta text-xs font-sans font-medium px-3 py-2 rounded-md border border-terracotta/20 shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
