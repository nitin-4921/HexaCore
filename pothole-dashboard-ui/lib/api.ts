// API service layer for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// API client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Cities API
  async getCities() {
    return this.request<City[]>('/cities');
  }

  async getCity(id: string) {
    return this.request<City>(`/cities/${id}`);
  }

  // Potholes API
  async getPotholes(params?: {
    city?: string;
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<Pothole[]>(`/potholes${query ? `?${query}` : ''}`);
  }

  async getPothole(id: string) {
    return this.request<Pothole>(`/potholes/${id}`);
  }

  async getPotholeStats(city?: string) {
    const query = city ? `?city=${city}` : '';
    return this.request<PotholeStats>(`/potholes/stats/summary${query}`);
  }

  // Roads API
  async getRoads(params?: {
    city?: string;
    contractor?: string;
    healthScore?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<Road[]>(`/roads${query ? `?${query}` : ''}`);
  }

  async getRoad(id: string) {
    return this.request<Road>(`/roads/${id}`);
  }

  // Contractors API
  async getContractors(params?: {
    city?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<Contractor[]>(`/contractors${query ? `?${query}` : ''}`);
  }

  async getContractor(id: string) {
    return this.request<Contractor>(`/contractors/${id}`);
  }

  async getContractorRoads(id: string) {
    return this.request<Road[]>(`/contractors/${id}/roads`);
  }

  // IoT API
  async getIoTDevices(params?: {
    city?: string;
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<IoTDevice[]>(`/iot/devices${query ? `?${query}` : ''}`);
  }

  async getIoTStats(city?: string) {
    const query = city ? `?city=${city}` : '';
    return this.request<IoTStats>(`/iot/stats${query}`);
  }
}

// Types (matching backend data structure)
export interface City {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  population: number;
  area: number;
  totalRoads: number;
  activeRovers: number;
  stats: {
    totalPotholes: number;
    highRiskPotholes: number;
    roadsNeedingRepair: number;
    averageRoadHealth: number;
  };
}

export interface Pothole {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  cityId: string;
  cityName: string;
  roadId: string;
  roadName: string;
  contractorId: string;
  contractorName: string;
  severity: 'low' | 'medium' | 'high';
  depth: number;
  width: number;
  riskScore: number;
  detectedTime: string;
  sensorId: string;
  sensorName: string;
  status: 'reported' | 'fixed';
  priority: 'normal' | 'high' | 'urgent';
  estimatedRepairCost: number;
  weatherCondition: string;
  trafficImpact: string;
  // ✅ NEW FIELDS - IoT Camera Integration Ready
  imageUrl?: string;
  imageMetadata?: {
    capturedAt: string;
    cameraId: string;
    resolution: string;
    fileSize?: number;
  };
}

export interface Road {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  contractorId: string;
  contractorName: string;
  constructionYear: number;
  length: number;
  width: number;
  lanes: number;
  surfaceType: string;
  healthScore: number;
  potholeCount: number;
  lastInspection: string;
  maintenanceHistory: string[];
  trafficVolume: number;
  speedLimit: number;
  potholes?: Pothole[];
}

export interface Contractor {
  id: string;
  name: string;
  establishedYear: number;
  totalRoadsBuilt: number;
  averageRoadHealth: number;
  rating: number;
  specialization: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  certifications: string[];
  stats: {
    totalRoadsBuilt: number;
    averageRoadHealth: number;
    totalPotholes: number;
    rating: number;
    totalLength: number;
    roadsNeedingRepair: number;
  };
  roads?: Road[];
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'rover' | 'fixed-sensor' | 'mobile-unit';
  cityId: string;
  status: 'active' | 'maintenance';
  lastPing: string;
  batteryLevel: number;
  coordinates: { lat: number; lng: number };
  firmware: string;
  dataCollected: number;
  stats?: {
    totalDetections: number;
    recentDetections: number;
    highRiskDetections: number;
    averageRiskScore?: number;
  };
}

export interface PotholeStats {
  total: number;
  byStatus: {
    reported: number;
    fixed: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
  };
  byPriority: {
    normal: number;
    high: number;
    urgent: number;
  };
  averageRiskScore: number;
  totalEstimatedCost: number;
}

export interface IoTStats {
  totalDevices: number;
  activeDevices: number;
  maintenanceDevices: number;
  averageBatteryLevel: number;
  deviceTypes: {
    rover: number;
    fixedSensor: number;
    mobileUnit: number;
  };
  totalDataCollected: number;
  networkCoverage: number;
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// Utility functions
export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#eab308';
    case 'high':
      return '#ff6b35';
  }
};

export const getSeverityBgColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'low':
      return 'bg-green-900/30 text-green-300';
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-300';
    case 'high':
      return 'bg-red-900/30 text-red-300';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};