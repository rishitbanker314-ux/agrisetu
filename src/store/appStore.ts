import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Field {
  id: string;
  name: string;
  crop: string;
  area: string;
  status: 'Healthy' | 'Water Stress' | 'Harvest Ready' | 'Mild Stress';
  lastUpdate: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
}

export interface Settings {
  name: string;
  email: string;
  whatsappAlerts: boolean;
  emailSummary: boolean;
}

interface AppState {
  fields: Field[];
  reports: Report[];
  settings: Settings;
  
  // Actions
  addField: (field: Field) => void;
  removeField: (id: string) => void;
  
  addReport: (report: Report) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      fields: [
        { id: '1', name: 'North Field', crop: 'Wheat', area: '12.4 ha', status: 'Healthy', lastUpdate: '5m ago' },
        { id: '2', name: 'West Field', crop: 'Corn', area: '8.2 ha', status: 'Water Stress', lastUpdate: '1h ago' },
        { id: '3', name: 'Lowland Plot', crop: 'Rice', area: '15.1 ha', status: 'Harvest Ready', lastUpdate: '2h ago' },
      ],
      
      reports: [
        { id: '1', title: 'Rabi 2025 Yield Projection', type: 'Predictive Analysis', date: 'Oct 12, 2025', size: '2.4 MB' },
        { id: '2', title: 'Weekly Climate Impact Report', type: 'Weather & Environment', date: 'Oct 10, 2025', size: '1.1 MB' },
        { id: '3', title: 'Soil Nutrient Deficit Assessment', type: 'Soil Health', date: 'Sep 28, 2025', size: '3.8 MB' },
        { id: '4', title: 'Pest Risk & Vulnerability Index', type: 'Risk Management', date: 'Sep 15, 2025', size: '1.5 MB' },
      ],
      
      settings: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        whatsappAlerts: true,
        emailSummary: true,
      },
      
      addField: (field) => set((state) => ({ fields: [...state.fields, field] })),
      removeField: (id) => set((state) => ({ fields: state.fields.filter((f) => f.id !== id) })),
      
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    {
      name: 'agrisetu-storage',
    }
  )
);
