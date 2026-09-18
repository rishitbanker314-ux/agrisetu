'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PricePoint } from '@/lib/forecasting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarketForecastChartProps {
  data: PricePoint[];
  cropName: string;
}

export default function MarketForecastChart({ data, cropName }: MarketForecastChartProps) {
  const chartData = useMemo(() => {
    const labels = data.map((d) => d.date);

    // Historical prices (solid line)
    const historicalPrices = data.map((d) => (d.isForecast ? null : d.price));

    // Forecasted prices (dashed line). We connect the last historical point to the forecast.
    const forecastedPrices = data.map((d, index) => {
      if (d.isForecast) return d.price;
      // Connect to the last historical point so the line doesn't break
      if (index === data.length - 1 || data[index + 1]?.isForecast) return d.price;
      return null;
    });

    // Confidence Intervals (shaded area)
    const lowerBound = data.map((d) => d.confidenceInterval?.[0] ?? null);
    const upperBound = data.map((d) => d.confidenceInterval?.[1] ?? null);

    return {
      labels,
      datasets: [
        {
          label: 'Historical Price (₹/Quintal)',
          data: historicalPrices,
          borderColor: 'rgb(34, 197, 94)', // Green
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: 'AI Forecast (Exponential Smoothing)',
          data: forecastedPrices,
          borderColor: 'rgb(59, 130, 246)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: 'Upper Confidence Limit',
          data: upperBound,
          borderColor: 'transparent',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: 1, // Fill to the next dataset (AI forecast)
          pointRadius: 0,
        },
        {
          label: 'Lower Confidence Limit',
          data: lowerBound,
          borderColor: 'transparent',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: 1, // Fill to the forecast line
          pointRadius: 0,
        }
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => !legendItem.text.includes('Confidence Limit')
        }
      },
      title: {
        display: true,
        text: `${cropName} APMC Price Forecast (30 Days)`,
        font: { size: 16 }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Price (₹/Quintal)'
        },
        suggestedMin: Math.min(...data.map(d => (d.confidenceInterval?.[0] ?? d.price))) * 0.95
      }
    }
  };

  return (
    <div className="w-full h-[400px] bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
