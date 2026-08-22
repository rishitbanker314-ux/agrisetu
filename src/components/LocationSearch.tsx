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
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=\${encodeURIComponent(query)}&format=json&limit=1`);
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
    <div className="absolute top-4 right-4 z-[400] w-64">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full bg-white border-2 border-gray-900 rounded-sm px-4 py-2 pr-10 text-sm font-bold text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-green-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-sm border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
