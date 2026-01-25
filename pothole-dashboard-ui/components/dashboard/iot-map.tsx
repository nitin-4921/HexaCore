'use client';

import { useState, useEffect, useRef } from 'react';
import { mockPotholes, getSeverityColor, Pothole } from '@/lib/mock-data';
import { useCity } from '@/contexts/city-context';
import { dataService } from '@/lib/data-service';
import { Eye, EyeOff } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function IotMap() {
  const [showPotholes, setShowPotholes] = useState(true);
  const [showRoadHealth, setShowRoadHealth] = useState(true);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const { selectedCity } = useCity();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const defaultCenter = selectedCity?.coordinates || { lat: 28.5355, lng: 77.3910 };

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current as HTMLElement,
      style: 'https://data.lfmaps.fr/styles/bright',
      center: [defaultCenter.lng, defaultCenter.lat], // [lng, lat]
      zoom: 12,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl());
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (mapRef.current && selectedCity) {
      mapRef.current.flyTo({
        center: [selectedCity.coordinates.lng, selectedCity.coordinates.lat],
        zoom: 12,
        duration: 1000
      });
    }
  }, [selectedCity]);

  // Handle pothole markers - USE SAME DATA AS DASHBOARD
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!showPotholes) return;

    // ✅ SINGLE SOURCE OF TRUTH: Use dataService for consistent filtering
    const cityPotholes = dataService.getPotholes({ 
      city: selectedCity?.name 
    });

    cityPotholes.forEach((pothole) => {
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getSeverityColor(pothole.severity);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      el.onclick = () => setSelectedPothole(pothole);

      const marker = new maplibregl.Marker(el)
        .setLngLat([pothole.location.lng, pothole.location.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [showPotholes, selectedCity]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Interactive IoT Map</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Real-time pothole detection from sensor network
            {selectedCity && (
              <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                {selectedCity.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPotholes(!showPotholes)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors"
          >
            {showPotholes ? <Eye size={18} /> : <EyeOff size={18} />}
            Potholes
          </button>
          <button
            onClick={() => setShowRoadHealth(!showRoadHealth)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors"
          >
            {showRoadHealth ? <Eye size={18} /> : <EyeOff size={18} />}
            Road Health
          </button>
        </div>
      </div>

      {/* Map Container (LFMaps) */}
      <div
        ref={mapContainerRef}
        className="w-full h-96 border-b border-border"
      />

      {/* Info Panel */}
      {selectedPothole && (
        <div className="p-6 bg-secondary/30 border-t border-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Pothole Details</h3>
            <button
              onClick={() => setSelectedPothole(null)}
              className="text-foreground/60 hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-foreground/60">Location</p>
              <p className="font-semibold text-primary">
                {selectedPothole.location.address}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Severity</p>
              <p className="font-semibold capitalize text-accent">
                {selectedPothole.severity}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Detected</p>
              <p className="font-semibold">{selectedPothole.detectedTime}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Risk Score</p>
              <p className="font-semibold text-orange-400">
                {selectedPothole.riskScore}/100
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
