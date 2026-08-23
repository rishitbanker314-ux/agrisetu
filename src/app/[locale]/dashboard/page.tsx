import { Suspense } from 'react';
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading dashboard...</div>}>
      <Dashboard />
    </Suspense>
  );
}
