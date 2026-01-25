'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { mockPotholes, getSeverityBgColor, Pothole } from '@/lib/mock-data';
import { ChevronDown, MapPin, Calendar, Search, Filter, Camera, Image } from 'lucide-react';
import { useCity } from '@/contexts/city-context';
import { CitySelector } from '@/components/city-selector';
import { Input } from '@/components/ui/input';
import { PotholeImageViewer } from '@/components/pothole-image-viewer';
import { dataService, consistencyUtils } from '@/lib/data-service';

/**
 * POTHOLE PAGE - SINGLE SOURCE OF TRUTH
 * 
 * CRITICAL: This page uses dataService.getPotholes() which uses
 * the EXACT SAME filtering logic as the dashboard summary cards.
 * 
 * Data consistency is enforced through:
 * 1. Single dataService for all queries
 * 2. Consistent filter parameter parsing
 * 3. Validation utilities to catch inconsistencies
 */
export default function PotholesPage() {
  const searchParams = useSearchParams();
  const { selectedCity } = useCity();
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerPothole, setImageViewerPothole] = useState<Pothole | null>(null);

  // ✅ CONSISTENT FILTER PARSING: Use utility function
  const urlFilters = consistencyUtils.parseFilterParams(searchParams);
  const [filterSeverity, setFilterSeverity] = useState<string>(urlFilters.severity || 'all');

  // Update filter when URL params change
  useEffect(() => {
    if (urlFilters.severity) {
      setFilterSeverity(urlFilters.severity);
    }
  }, [searchParams]);

  // ✅ SINGLE SOURCE OF TRUTH: Use dataService for all pothole queries
  const filteredPotholes = dataService.getPotholes({
    city: selectedCity?.name,
    severity: filterSeverity === 'all' ? undefined : filterSeverity as 'low' | 'medium' | 'high',
    searchTerm: searchTerm || undefined
  });

  // ✅ CONSISTENCY VALIDATION: Validate against dashboard stats (development only)
  useEffect(() => {
    if (selectedCity && filterSeverity === 'high') {
      const dashboardStats = dataService.getDashboardStats(selectedCity.name);
      consistencyUtils.validateConsistency(
        dashboardStats.highRiskPotholes,
        filteredPotholes,
        'High-Risk Potholes'
      );
    }
  }, [selectedCity, filterSeverity, filteredPotholes]);

  const sortedPotholes = [...filteredPotholes].sort((a, b) => {
    return b.riskScore - a.riskScore; // Sort by risk score (highest first)
  });

  const handleImageView = (pothole: Pothole) => {
    setImageViewerPothole(pothole);
    setImageViewerOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pothole Management</h1>
            <p className="text-foreground/60">
              Comprehensive list of detected potholes with detailed information
              {selectedCity && (
                <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  {selectedCity.name}
                </span>
              )}
              {filterSeverity !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                  Severity: {filterSeverity}
                </span>
              )}
            </p>
          </div>
          <CitySelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Search Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by location or road..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Severity filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Severity Level
                  </label>
                  <div className="space-y-2">
                    {['all', 'low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="severity"
                          value={level}
                          checked={filterSeverity === level}
                          onChange={(e) => setFilterSeverity(e.target.value)}
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-sm capitalize cursor-pointer">
                          {level === 'all' ? 'All Levels' : level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats - CONSISTENT WITH DASHBOARD */}
              <div className="pt-6 border-t border-border/30">
                <h3 className="text-sm font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">Showing</span>
                    <span className="font-semibold">{filteredPotholes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">High Risk</span>
                    <span className="font-semibold text-red-400">
                      {filteredPotholes.filter((p) => p.severity === 'high').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">Medium Risk</span>
                    <span className="font-semibold text-yellow-400">
                      {filteredPotholes.filter((p) => p.severity === 'medium').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">Low Risk</span>
                    <span className="font-semibold text-green-400">
                      {filteredPotholes.filter((p) => p.severity === 'low').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Table and Detail Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Potholes Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">
                  Detected Potholes ({sortedPotholes.length})
                </h2>
                {filterSeverity !== 'all' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Filtered by severity: <span className="font-medium capitalize">{filterSeverity}</span>
                  </p>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/30 bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Date/Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPotholes.map((pothole) => (
                      <tr
                        key={pothole.id}
                        className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {pothole.imageUrl ? (
                            <button
                              onClick={() => handleImageView(pothole)}
                              className="relative group"
                            >
                              <img
                                src={pothole.imageUrl}
                                alt={`Pothole at ${pothole.location.address}`}
                                className="w-12 h-12 object-cover rounded border-2 border-border group-hover:border-primary transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded flex items-center justify-center transition-colors">
                                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-12 h-12 bg-secondary/50 rounded border-2 border-dashed border-border flex items-center justify-center">
                              <Image className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td 
                          className="px-6 py-4 text-foreground/80 cursor-pointer"
                          onClick={() => setSelectedPothole(pothole)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {pothole.location.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityBgColor(pothole.severity)}`}
                          >
                            {pothole.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-accent">
                            {pothole.riskScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground/60">
                          {pothole.detectedTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedPotholes.length === 0 && (
                <div className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No potholes found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selectedPothole && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold">Pothole Details</h2>
                  <button
                    onClick={() => setSelectedPothole(null)}
                    className="text-foreground/60 hover:text-foreground text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/60 mb-4 uppercase">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Location
                        </p>
                        <p className="font-semibold text-primary">
                          {selectedPothole.location.address}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">
                          Lat: {selectedPothole.location.lat.toFixed(4)}, Lng:{' '}
                          {selectedPothole.location.lng.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Road Name
                        </p>
                        <p className="font-semibold">
                          {selectedPothole.roadName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Sensor/Rover ID
                        </p>
                        <p className="font-semibold">{selectedPothole.sensorId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Specs */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/60 mb-4 uppercase">
                      Physical Specifications
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Depth
                        </p>
                        <p className="font-semibold">{selectedPothole.depth} mm</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">Width</p>
                        <p className="font-semibold">
                          {selectedPothole.width} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Severity Level
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityBgColor(selectedPothole.severity)}`}
                        >
                          {selectedPothole.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Analysis */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-foreground/60 mb-4 uppercase">
                      Risk Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Accident Probability</span>
                          <span className="font-semibold text-accent">
                            {selectedPothole.riskScore}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div
                            style={{
                              width: `${selectedPothole.riskScore}%`,
                            }}
                            className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60 pt-2">
                        This pothole has a{' '}
                        <span className="font-semibold text-accent">
                          {selectedPothole.riskScore}% probability
                        </span>{' '}
                        of causing vehicle damage or accidents. Immediate repair
                        is recommended.
                      </p>
                    </div>
                  </div>

                  {/* Detection Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-foreground/60 mb-4 uppercase">
                      Detection Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                        <span className="text-foreground/60">Detected On</span>
                        <span className="font-semibold">
                          {selectedPothole.detectedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-border/30 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded hover:bg-primary/30 transition-colors font-medium">
                    Assign to Crew
                  </button>
                  <button className="flex-1 px-4 py-2 bg-accent/20 text-accent border border-accent/50 rounded hover:bg-accent/30 transition-colors font-medium">
                    View Map
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      {imageViewerPothole && (
        <PotholeImageViewer
          pothole={imageViewerPothole}
          isOpen={imageViewerOpen}
          onClose={() => {
            setImageViewerOpen(false);
            setImageViewerPothole(null);
          }}
        />
      )}
    </div>
  );
}
