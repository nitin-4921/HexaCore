import { Sidebar } from '@/components/sidebar';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { IotMap } from '@/components/dashboard/iot-map';
import { CitySelector } from '@/components/city-selector';
import { DataConsistencyValidator } from '@/components/data-consistency-validator';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Road Health Dashboard</h1>
            <p className="text-foreground/60">
              Monitor pothole detection and road infrastructure in real-time
            </p>
          </div>
          <CitySelector />
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* Interactive Map */}
        <IotMap />

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-foreground/60 mb-4">
              Sensor Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rover-001</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rover-002</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rover-003</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rover-004</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rover-005</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-foreground/60 mb-4">
              Recent Detections
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span>Broadway & 42nd St</span>
                <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span>5th Avenue & 44th St</span>
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs">
                  Medium
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>3rd Avenue & 52nd St</span>
                <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs">
                  High
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-foreground/60 mb-4">
              System Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Detection Accuracy</span>
                  <span className="text-sm font-semibold text-primary">
                    98%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-[98%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Network Coverage</span>
                  <span className="text-sm font-semibold text-primary">
                    94%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Data Consistency Validator (Development Only) */}
      <DataConsistencyValidator />
    </div>
  );
}
