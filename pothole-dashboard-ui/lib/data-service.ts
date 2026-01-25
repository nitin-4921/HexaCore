/**
 * SINGLE SOURCE OF TRUTH for all dashboard data
 * 
 * This service ensures data consistency across:
 * - Dashboard summary cards
 * - Detailed view pages
 * - All filtering operations
 * 
 * CRITICAL: All data queries must go through this service
 * to maintain consistency between summary cards and detail views.
 */

import { mockPotholes, mockRoads, Pothole, Road } from '@/lib/mock-data';
import { api, City } from '@/lib/api';

// ===== FILTER DEFINITIONS (SINGLE SOURCE OF TRUTH) =====

/**
 * Central filter definitions - these MUST be used consistently
 * across dashboard cards and detail pages
 */
export const FILTER_DEFINITIONS = {
  HIGH_RISK_POTHOLES: (pothole: Pothole) => pothole.severity === 'high',
  ROADS_NEEDING_REPAIR: (road: Road) => road.healthScore < 50,
  CITY_FILTER: (cityName: string) => ({
    pothole: (p: Pothole) => p.location.address.includes(cityName),
    road: (r: Road) => r.name.includes('Sector') // Mock city filtering - in real app use cityId
  })
} as const;

// ===== DATA SERVICE CLASS =====

class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Get filtered potholes with consistent logic
   * Used by both dashboard cards and pothole detail page
   */
  getPotholes(filters: {
    city?: string;
    severity?: 'low' | 'medium' | 'high';
    status?: string;
    searchTerm?: string;
  } = {}): Pothole[] {
    let filteredPotholes = [...mockPotholes];

    // City filter - CONSISTENT LOGIC
    if (filters.city) {
      filteredPotholes = filteredPotholes.filter(
        FILTER_DEFINITIONS.CITY_FILTER(filters.city).pothole
      );
    }

    // Severity filter - CONSISTENT LOGIC
    if (filters.severity) {
      if (filters.severity === 'high') {
        filteredPotholes = filteredPotholes.filter(FILTER_DEFINITIONS.HIGH_RISK_POTHOLES);
      } else {
        filteredPotholes = filteredPotholes.filter(p => p.severity === filters.severity);
      }
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredPotholes = filteredPotholes.filter(p => 
        p.location.address.toLowerCase().includes(term) ||
        p.roadName.toLowerCase().includes(term)
      );
    }

    return filteredPotholes;
  }

  /**
   * Get filtered roads with consistent logic
   * Used by both dashboard cards and road detail page
   */
  getRoads(filters: {
    city?: string;
    healthScore?: string;
    contractor?: string;
    searchTerm?: string;
  } = {}): Road[] {
    let filteredRoads = [...mockRoads];

    // City filter - CONSISTENT LOGIC
    if (filters.city) {
      filteredRoads = filteredRoads.filter(
        FILTER_DEFINITIONS.CITY_FILTER(filters.city).road
      );
    }

    // Health score filter - CONSISTENT LOGIC
    if (filters.healthScore) {
      if (filters.healthScore === '<50') {
        filteredRoads = filteredRoads.filter(FILTER_DEFINITIONS.ROADS_NEEDING_REPAIR);
      } else if (filters.healthScore === '50-80') {
        filteredRoads = filteredRoads.filter(r => r.healthScore >= 50 && r.healthScore < 80);
      } else if (filters.healthScore === '>=80') {
        filteredRoads = filteredRoads.filter(r => r.healthScore >= 80);
      }
    }

    // Contractor filter
    if (filters.contractor && filters.contractor !== 'all') {
      filteredRoads = filteredRoads.filter(r => 
        r.contractor.toLowerCase().includes(filters.contractor!.toLowerCase())
      );
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredRoads = filteredRoads.filter(r => 
        r.name.toLowerCase().includes(term) ||
        r.contractor.toLowerCase().includes(term)
      );
    }

    return filteredRoads;
  }

  /**
   * Get dashboard summary statistics
   * CRITICAL: Uses the same filtering logic as detail pages
   */
  getDashboardStats(city?: string) {
    // Use the SAME filtering logic as detail pages
    const cityPotholes = this.getPotholes({ city });
    const cityRoads = this.getRoads({ city });
    
    // Use the SAME filter definitions
    const highRiskPotholes = cityPotholes.filter(FILTER_DEFINITIONS.HIGH_RISK_POTHOLES);
    const roadsNeedingRepair = cityRoads.filter(FILTER_DEFINITIONS.ROADS_NEEDING_REPAIR);
    
    const averageRoadHealth = cityRoads.length > 0 
      ? Math.round(cityRoads.reduce((acc, r) => acc + r.healthScore, 0) / cityRoads.length)
      : 0;

    return {
      totalPotholes: cityPotholes.length,
      highRiskPotholes: highRiskPotholes.length,
      roadsNeedingRepair: roadsNeedingRepair.length,
      averageRoadHealth
    };
  }

  /**
   * Generate consistent navigation URLs for summary cards
   * Ensures click-through contract is maintained
   */
  getNavigationUrls(city?: string) {
    const cityParam = city ? `?city=${encodeURIComponent(city)}` : '';
    
    return {
      totalPotholes: `/potholes${cityParam}`,
      highRiskPotholes: `/potholes${cityParam}${city ? '&' : '?'}severity=high`,
      roadsNeedingRepair: `/roads${cityParam}${city ? '&' : '?'}healthScore=<50`,
      averageRoadHealth: `/roads${cityParam}`
    };
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

/**
 * CONSISTENCY ENFORCEMENT UTILITIES
 * These functions ensure the same logic is used everywhere
 */

export const consistencyUtils = {
  /**
   * Validates that summary card count matches detail page count
   * Use this in development/testing to catch inconsistencies
   */
  validateConsistency: (
    summaryCount: number, 
    detailItems: any[], 
    context: string
  ) => {
    if (summaryCount !== detailItems.length) {
      console.error(`❌ DATA CONSISTENCY ERROR in ${context}:`, {
        summaryCount,
        actualCount: detailItems.length,
        difference: Math.abs(summaryCount - detailItems.length)
      });
      return false;
    }
    console.log(`✅ Data consistency validated for ${context}`);
    return true;
  },

  /**
   * Ensures filter parameters are correctly parsed from URL
   */
  parseFilterParams: (searchParams: URLSearchParams) => {
    return {
      city: searchParams.get('city') || undefined,
      severity: searchParams.get('severity') as 'low' | 'medium' | 'high' | undefined,
      healthScore: searchParams.get('healthScore') || undefined,
      contractor: searchParams.get('contractor') || undefined
    };
  }
};

export default dataService;