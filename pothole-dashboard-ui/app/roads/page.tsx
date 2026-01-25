'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { CitySelector } from '@/components/city-selector';
import { useCity } from '@/contexts/city-context';
import { mockRoads, mockPotholes } from '@/lib/mock-data';
import { Road } from '@/lib/mock-data';
import { Building2, TrendingDown, AlertTriangle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dataService, consistencyUtils } from '@/lib/data-service';

/**
 * ROADS PAGE - SINGLE SOURCE OF TRUTH
 * 
 * CRITICAL: This page uses dataService.getRoads() which uses
 * the EXACT SAME filtering logic as the dashboard summary cards.
 * 
 * Data consistency is enforced through:
 * 1. Single dataService for all queries
 * 2. Consistent filter parameter parsing
 * 3. Validation utilities to catch inconsistencies
 */
export default function RoadsPage() {
  const searchParams = useSearchParams();
  const { selectedCity } = useCity();
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ CONSISTENT FILTER PARSING: Use utility function
  const urlFilters = consistencyUtils.parseFilterParams(searchParams);
  const [healthFilter, setHealthFilter] = useState(urlFilters.healthScore || 'all');

  // Update filter when URL params change
  useEffect(() => {
    if (urlFilters.healthScore) {
      setHealthFilter(urlFilters.healthScore);
    }
  }, [searchParams]);

  // ✅ SINGLE SOURCE OF TRUTH: Use dataService for all road queries
  const filteredRoads = dataService.getRoads({
    city: selectedCity?.name,
    healthScore: healthFilter === 'all' ? undefined : healthFilter,
    searchTerm: searchTerm || undefined
  });

  // ✅ CONSISTENCY VALIDATION: Validate against dashboard stats (development only)
  useEffect(() => {
    if (selectedCity && healthFilter === '<50') {
      const dashboardStats = dataService.getDashboardStats(selectedCity.name);
      consistencyUtils.validateConsistency(
        dashboardStats.roadsNeedingRepair,
        filteredRoads,
        'Roads Needing Repair'
      );
    }
  }, [selectedCity, healthFilter, filteredRoads]);

  const getRoadPotholes = (roadName: string) => {
    return mockPotholes.filter((p) => p.roadName === roadName);
  };

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-900/30';
    if (score >= 50) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Road Management</h1>
            <p className="text-foreground/60">
              Monitor road conditions, contractor history, and maintenance schedules
              {selectedCity && (
                <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  {selectedCity.name}
                </span>
              )}
              {healthFilter !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  Health: {healthFilter === '<50' ? 'Poor (<50%)' : 
                           healthFilter === '50-80' ? 'Fair (50-80%)' : 
                           'Good (≥80%)'}
                </span>
              )}
            </p>
          </div>
          <CitySelector />
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search roads or contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Health Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health Scores</SelectItem>
                <SelectItem value="<50">Poor (&lt; 50%)</SelectItem>
                <SelectItem value="50-80">Fair (50-80%)</SelectItem>
                <SelectItem value=">=80">Good (≥ 80%)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setHealthFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Roads</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {filteredRoads.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-cyan-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Needs Repair</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {filteredRoads.filter((r) => r.healthScore < 50).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Avg Health</p>
                <p className="text-3xl font-bold text-green-400">
                  {filteredRoads.length > 0 
                    ? Math.round(filteredRoads.reduce((acc, r) => acc + r.healthScore, 0) / filteredRoads.length)
                    : 0
                  }%
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-400/50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roads List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Roads List</h2>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredRoads.length > 0 ? (
                  filteredRoads.map((road) => (
                    <button
                      key={road.id}
                      onClick={() => setSelectedRoad(road)}
                      className={`w-full p-4 border-b border-border/30 text-left transition-colors hover:bg-secondary/30 ${
                        selectedRoad?.id === road.id ? 'bg-secondary/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{road.name}</h3>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${getHealthColor(road.healthScore)} ${getHealthBgColor(road.healthScore)}`}
                        >
                          {road.healthScore}%
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60">
                        {road.potholeCount} potholes • {road.length} km
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No roads found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Road Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRoad ? (
              <>
                {/* Header */}
                <div className="bg-card border border-border rounded-lg p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {selectedRoad.name}
                      </h1>
                      <p className="text-foreground/60">
                        Comprehensive road management profile
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRoad(null)}
                      className="text-foreground/60 hover:text-foreground text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-foreground/60 mb-2">
                        Road Length
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedRoad.length}
                      </p>
                      <p className="text-xs text-foreground/60">km</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-2">
                        Health Score
                      </p>
                      <p
                        className={`text-2xl font-bold ${getHealthColor(selectedRoad.healthScore)}`}
                      >
                        {selectedRoad.healthScore}
                      </p>
                      <p className="text-xs text-foreground/60">/ 100</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-2">
                        Total Potholes
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {selectedRoad.potholeCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-2">
                        Construction
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedRoad.constructionYear}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Road Health Status</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Overall Condition</span>
                        <span className="font-semibold">
                          {selectedRoad.healthScore}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-4">
                        <div
                          style={{ width: `${selectedRoad.healthScore}%` }}
                          className={`h-4 rounded-full transition-all ${
                            selectedRoad.healthScore >= 75
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                              : selectedRoad.healthScore >= 50
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                                : 'bg-gradient-to-r from-red-500 to-orange-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-4 text-sm text-foreground/60">
                      <p>
                        {selectedRoad.healthScore >= 75
                          ? '✓ Road is in good condition with minimal repairs needed.'
                          : selectedRoad.healthScore >= 50
                            ? '⚠ Road requires scheduled maintenance soon.'
                            : '✕ Road requires urgent repairs to ensure safety.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contractor Information */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-6">Contractor Info</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">
                        Primary Contractor
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        {selectedRoad.contractor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">
                        Last Constructed
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedRoad.constructionYear}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1">
                        {new Date().getFullYear() - selectedRoad.constructionYear}{' '}
                        years ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maintenance History */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-6">
                    Maintenance History
                  </h2>
                  <div className="space-y-3">
                    {selectedRoad.maintenanceHistory.length > 0 ? (
                      selectedRoad.maintenanceHistory.map((history, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-secondary/20 rounded border border-border/20 text-sm"
                        >
                          {history}
                        </div>
                      ))
                    ) : (
                      <p className="text-foreground/60 text-sm">
                        No maintenance records available
                      </p>
                    )}
                  </div>
                </div>

                {/* Potholes on this road */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Potholes on {selectedRoad.name}
                  </h2>
                  {getRoadPotholes(selectedRoad.name).length > 0 ? (
                    <div className="space-y-2">
                      {getRoadPotholes(selectedRoad.name).map((pothole) => (
                        <div
                          key={pothole.id}
                          className="p-4 bg-secondary/20 rounded border border-border/20 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              {pothole.location.address}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {pothole.detectedTime}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              pothole.severity === 'high'
                                ? 'bg-red-900/30 text-red-300'
                                : pothole.severity === 'medium'
                                  ? 'bg-yellow-900/30 text-yellow-300'
                                  : 'bg-green-900/30 text-green-300'
                            }`}
                          >
                            {pothole.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground/60 text-sm">
                      No potholes detected on this road
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 flex items-center justify-center text-center">
                <div>
                  <p className="text-xl font-semibold text-foreground/60 mb-2">
                    Select a road to view details
                  </p>
                  <p className="text-sm text-foreground/40">
                    Click on any road from the list to see comprehensive information,
                    maintenance history, and associated potholes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
