import { CloudRain, Thermometer, Droplets } from 'lucide-react';
import type { LiveFieldData } from '@/hooks/useFieldData';

interface WeatherWidgetProps {
  fieldData: LiveFieldData | null;
}

export default function WeatherWidget({ fieldData }: WeatherWidgetProps) {
  if (!fieldData) return null;

  return (
    <div className="bg-white border border-soft-line rounded-lg p-3 shadow-sm flex items-center gap-4 mt-2 w-full max-w-sm pointer-events-auto">
      <div className="flex items-center gap-2">
        <div className="bg-terracotta/10 p-1.5 rounded-md">
          <Thermometer className="w-4 h-4 text-terracotta" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Temp</div>
          <div className="text-sm font-medium text-deep-forest">{Math.round(fieldData.weather.temperature)}°C</div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-soft-line"></div>
      
      <div className="flex items-center gap-2">
        <div className="bg-sky-600/10 p-1.5 rounded-md">
          <CloudRain className="w-4 h-4 text-sky-600" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Humidity</div>
          <div className="text-sm font-medium text-deep-forest">{Math.round(fieldData.weather.humidity)}%</div>
        </div>
      </div>

      <div className="w-px h-8 bg-soft-line"></div>
      
      <div className="flex items-center gap-2">
        <div className="bg-emerald-600/10 p-1.5 rounded-md">
          <Droplets className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Soil</div>
          <div className="text-sm font-medium text-deep-forest">{fieldData.soil.moisture}%</div>
        </div>
      </div>
    </div>
  );
}
