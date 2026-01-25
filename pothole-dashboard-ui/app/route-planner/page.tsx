'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Route {
  type: 'recommended' | 'alternative';
  distance: number;
  time: number;
  potholes: number;
  severityScore: number;
  safetyLevel: 'safe' | 'moderate' | 'risky';
}

export default function RoutePlanner() {
  const [startLocation, setStartLocation] = useState(
    'Broadway & 42nd St, NYC'
  );
  const [endLocation, setEndLocation] = useState('Park Avenue & 28th St, NYC');
  const [routes, setRoutes] = useState<Route[]>([
    {
      type: 'recommended',
      distance: 8.5,
      time: 18,
      potholes: 2,
      severityScore: 24,
      safetyLevel: 'safe',
    },
    {
      type: 'alternative',
      distance: 9.2,
      time: 21,
      potholes: 5,
      severityScore: 58,
      safetyLevel: 'moderate',
    },
    {
      type: 'alternative',
      distance: 10.1,
      time: 25,
      potholes: 8,
      severityScore: 82,
      safetyLevel: 'risky',
    },
  ]);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'text-green-400 bg-green-900/30';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'risky':
        return 'text-red-400 bg-red-900/30';
    }
  };

  const handleCalculateRoute = () => {
    // In a real app, this would call an API
    console.log('Calculating route from', startLocation, 'to', endLocation);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pothole-Free Route Planner</h1>
          <p className="text-foreground/60">
            Find the safest routes based on real-time pothole data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Route input */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-8">
              <h2 className="text-xl font-semibold">Route Input</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Location
                </label>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter start location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter destination"
                />
              </div>

              <button
                onClick={handleCalculateRoute}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-foreground-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                Calculate Route
              </button>

              <div className="pt-4 border-t border-border/30">
                <h3 className="text-sm font-semibold mb-3 text-foreground/80">
                  Route Tips
                </h3>
                <ul className="text-xs text-foreground/60 space-y-2">
                  <li>• Green routes have minimal potholes</li>
                  <li>• Check severity scores for risk levels</li>
                  <li>• Real-time data updates every 5 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right panel - Route results */}
          <div className="lg:col-span-2 space-y-4">
            {routes.map((route, idx) => (
              <div
                key={idx}
                className={`border-l-4 bg-card rounded-lg p-6 transition-all hover:shadow-lg ${
                  route.type === 'recommended'
                    ? 'border-l-green-500 border border-green-500/30 shadow-lg shadow-green-500/20'
                    : 'border-l-border border border-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">
                        {route.type === 'recommended'
                          ? 'Recommended Route'
                          : `Alternative Route ${idx}`}
                      </h3>
                      {route.type === 'recommended' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-foreground/60">
                      {startLocation} to {endLocation}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getSafetyColor(route.safetyLevel)}`}
                  >
                    {route.safetyLevel.charAt(0).toUpperCase() +
                      route.safetyLevel.slice(1)}
                  </span>
                </div>

                {/* Route metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">Distance</p>
                    <p className="text-lg font-bold text-primary">
                      {route.distance} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">Est. Time</p>
                    <p className="text-lg font-bold text-primary">
                      {route.time} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">
                      Potholes on Route
                    </p>
                    <p className="text-lg font-bold text-accent">
                      {route.potholes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">
                      Severity Score
                    </p>
                    <p className="text-lg font-bold text-orange-400">
                      {route.severityScore}/100
                    </p>
                  </div>
                </div>

                {/* Route visualization */}
                <div className="mb-4 p-4 bg-secondary/10 border border-border/30 rounded-lg h-32 flex items-center justify-center">
                  <div className="w-full h-24 bg-gradient-to-r from-primary/20 via-secondary to-accent/20 rounded flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-foreground/60">
                        Route Visualization
                      </p>
                      <p className="text-xs text-foreground/40 mt-1">
                        {route.type === 'recommended'
                          ? 'Green line = Recommended path'
                          : 'Yellow/Red line = Alternative path'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-foreground/70">
                      {route.potholes === 0
                        ? 'No obstacles detected'
                        : `${route.potholes} pothole${route.potholes > 1 ? 's' : ''} detected`}
                    </span>
                  </div>
                  {route.type === 'recommended' && (
                    <button className="ml-auto px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded hover:bg-primary/30 transition-colors">
                      Use Route
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map simulation */}
        <div className="mt-8 bg-card border border-border rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
          <div className="w-full h-96 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg border border-border/30 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <p className="text-foreground/60">
                Map visualization would display here with routes rendered
              </p>
              <p className="text-sm text-foreground/40 mt-2">
                Green: Recommended, Yellow: Alternative, Red: High pothole density
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
