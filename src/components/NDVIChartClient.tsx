'use client';

import { Activity } from 'lucide-react';
import type { LiveFieldData } from '@/hooks/useFieldData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  zoomPlugin
);

interface NDVIChartProps {
  fieldData: LiveFieldData | null;
}

export default function NDVIChartClient({ fieldData }: NDVIChartProps) {
  // @ts-ignore - temporal data
  const ndviProgression = fieldData?.temporal?.ndviProgression as number[] || [];
  
  if (!ndviProgression.length) return <div className="p-4 text-center text-ink/50 text-sm">No NDVI data available</div>;

  const currentNdvi = ndviProgression[0];
  
  // Create labels for 15 days (Today, Day +1, etc)
  const labels = ndviProgression.map((_, i) => i === 0 ? 'Today' : `Day +${i}`);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'NDVI Forecast',
        data: ndviProgression,
        borderColor: '#22c55e', // moss
        backgroundColor: 'rgba(134, 239, 172, 0.4)', // moss with opacity
        borderWidth: 3,
        pointBackgroundColor: '#14532d',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14532d',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(20, 83, 45, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, family: 'Inter', weight: 'bold' as const },
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `NDVI: ${context.parsed.y.toFixed(3)}`;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy' as const,
        }
      }
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            Live NDVI & Forecast Trends
          </h3>
          <p className="text-sm text-ink/60 mt-1">15-Day Real-Time Extrapolation (Scroll to Zoom, Drag to Pan)</p>
        </div>
        <div className="bg-moss/10 px-3 py-1.5 rounded-md flex items-center gap-2 shrink-0">
          <Activity className="w-4 h-4 text-moss" />
          <span className="text-sm font-bold text-moss">Current: {currentNdvi.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="bg-paper-ivory/50 border border-soft-line p-3 rounded-md mb-2 text-sm text-ink/80 font-sans">
        <strong>What is NDVI?</strong> The Normalized Difference Vegetation Index (NDVI) is a satellite-based measure of crop health. It detects the amount of near-infrared light reflected by plant leaves. Values closer to <strong>1.0</strong> indicate lush, healthy crops, while values below <strong>0.3</strong> indicate severe stress, drought, or bare soil.
      </div>
      
      <div className="flex-grow relative mt-4 h-64 w-full bg-paper-ivory/50 rounded-xl border border-soft-line p-4 cursor-crosshair">
        <Line options={options} data={data} />
      </div>
      
      <div className="mt-4 text-xs text-ink/60 bg-white border border-soft-line p-3 rounded-md flex items-start gap-2">
        <Activity className="w-4 h-4 shrink-0 text-moss mt-0.5" />
        <p>This model reflects a live 15-day NDVI extrapolation by analyzing actual hyper-local weather forecasts and satellite baseline data. Use your mouse or touch to zoom seamlessly into fractional micro-variations.</p>
      </div>
    </div>
  );
}
