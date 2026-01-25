export interface Pothole {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high';
  detectedTime: string;
  sensorId: string;
  roadName: string;
  depth: number; // in mm
  width: number; // in cm
  riskScore: number; // 0-100
  // ✅ NEW FIELD - BACKWARD COMPATIBLE
  imageUrl?: string; // Optional for backward compatibility
  // Future-ready fields for IoT camera integration
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
  contractor: string;
  constructionYear: number;
  length: number; // in km
  maintenanceHistory: string[];
  potholeCount: number;
  healthScore: number; // 0-100
}

export interface Route {
  id: string;
  start: { lat: number; lng: number; name: string };
  end: { lat: number; lng: number; name: string };
  safestRoute: {
    distance: number;
    time: number;
    potholeCount: number;
    severityScore: number;
    safetyLevel: 'safe' | 'moderate' | 'risky';
  };
  alternativeRoutes: {
    distance: number;
    time: number;
    potholeCount: number;
    severityScore: number;
  }[];
}

export const mockPotholes: Pothole[] = [
  {
    id: 'pot-001',
    location: {
      lat: 28.5362,
      lng: 77.3918,
      address: 'Sector 62, Noida',
    },
    severity: 'high',
    detectedTime: '2024-01-22 14:32:00',
    sensorId: 'rover-001',
    roadName: 'Sector 62 Main Road',
    depth: 8.5,
    width: 12.3,
    riskScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1560782205-4dd83ceb0270?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageMetadata: {
      capturedAt: '2024-01-22 14:32:15',
      cameraId: 'rover-001-cam',
      resolution: '1920x1080'
    }
  },
  {
    id: 'pot-002',
    location: {
      lat: 28.5339,
      lng: 77.3875,
      address: 'Sector 59, Noida',
    },
    severity: 'medium',
    detectedTime: '2024-01-22 13:15:00',
    sensorId: 'rover-002',
    roadName: 'Sector 59 Link Road',
    depth: 5.2,
    width: 8.1,
    riskScore: 68,
    imageUrl: 'https://images.unsplash.com/photo-1587763483696-6d41d2de6084?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG90aG9sZXxlbnwwfHwwfHx8MA%3D%3D',
    imageMetadata: {
      capturedAt: '2024-01-22 13:15:10',
      cameraId: 'rover-002-cam',
      resolution: '1920x1080'
    }
  },
  {
    id: 'pot-003',
    location: {
      lat: 28.5287,
      lng: 77.3942,
      address: 'Sector 76, Noida',
    },
    severity: 'low',
    detectedTime: '2024-01-22 12:45:00',
    sensorId: 'rover-003',
    roadName: 'Sector 76 Internal Road',
    depth: 2.1,
    width: 4.5,
    riskScore: 32,
    imageUrl: 'https://imgs.search.brave.com/IvO5VgZhVYqfCb9o5ewIxSFUJgTJ0vV1EiXQe9q2MXc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTkv/MzQyLzExOS9zbWFs/bC9wb3Rob2xlcy1m/aWxsZWQtd2l0aC13/YXRlci1vbi1hLXBv/b3JseS1tYWludGFp/bmVkLXJvYWQtcGhv/dG8uanBn',
    imageMetadata: {
      capturedAt: '2024-01-22 12:45:05',
      cameraId: 'rover-003-cam',
      resolution: '1920x1080'
    }
  },
  {
    id: 'pot-004',
    location: {
      lat: 28.5421,
      lng: 77.3829,
      address: 'Sector 51, Noida',
    },
    severity: 'high',
    detectedTime: '2024-01-22 11:20:00',
    sensorId: 'rover-001',
    roadName: 'Sector 51 Main Road',
    depth: 9.1,
    width: 14.2,
    riskScore: 87,
    imageUrl: 'https://imgs.search.brave.com/PC923RtBNUo2fxXPFVB0xLZYQyLZYjJKLGYJ_m2fcTs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9wb3Rob2xl/cy1vbi1iYWQtYXNw/aGFsdC1yb2FkLTI2/MG53LTI0Mzc3OTQw/ODMuanBn',
    imageMetadata: {
      capturedAt: '2024-01-22 11:20:12',
      cameraId: 'rover-001-cam',
      resolution: '1920x1080'
    }
  },
  {
    id: 'pot-005',
    location: {
      lat: 28.5314,
      lng: 77.4023,
      address: 'Sector 75, Noida',
    },
    severity: 'medium',
    detectedTime: '2024-01-22 10:30:00',
    sensorId: 'rover-004',
    roadName: 'Sector 75 Service Road',
    depth: 4.8,
    width: 7.9,
    riskScore: 55,
    imageUrl: 'https://imgs.search.brave.com/q9sg7PtLnU1T6fwmgiUrMpThj0ni0TPSkwcfi3QTWAg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9wb3Ro/b2xlcy1maWxsZWQt/d2F0ZXItcnVyYWwt/dW5wYXZlZC1yb2Fk/LTkyMDczOTI4Lmpw/Zw',
    imageMetadata: {
      capturedAt: '2024-01-22 10:30:08',
      cameraId: 'rover-004-cam',
      resolution: '1920x1080'
    }
  },
  {
    id: 'pot-006',
    location: {
      lat: 28.5388,
      lng: 77.3986,
      address: 'Sector 63, Noida',
    },
    severity: 'high',
    detectedTime: '2024-01-22 09:15:00',
    sensorId: 'rover-005',
    roadName: 'Sector 63 Road',
    depth: 7.8,
    width: 11.5,
    riskScore: 82,
    imageUrl: 'https://imgs.search.brave.com/TYtw8-x14M_LGaEr9axrk_0S67XSnziUwWqJiB7gKMc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTIv/OTAwLzY1MC9zbWFs/bC9kYW1hZ2VkLWFz/cGhhbHQtcm9hZC13/aXRoLXBvdGhvbGVz/LWNhdXNlZC1ieS1m/cmVlemluZy1hbmQt/dGhhd2luZy1jeWNs/ZXMtZHVyaW5nLXRo/ZS13aW50ZXItcG9v/ci1yb2FkLWZyZWUt/cGhvdG8uanBn',
    imageMetadata: {
      capturedAt: '2024-01-22 09:15:18',
      cameraId: 'rover-005-cam',
      resolution: '1920x1080'
    }
  },
];

export const mockRoads: Road[] = [
  {
    id: 'road-001',
    name: 'Sector 62 Main Road',
    contractor: 'Noida Infrastructure Corp',
    constructionYear: 2016,
    length: 4.2,
    maintenanceHistory: [
      'Last resurfaced: 2023-06-15',
      'Pothole repairs: 2024-01-15',
    ],
    potholeCount: 6,
    healthScore: 48,
  },
  {
    id: 'road-002',
    name: 'Sector 59 Link Road',
    contractor: 'UP Urban Roads Ltd',
    constructionYear: 2014,
    length: 3.1,
    maintenanceHistory: [
      'Last resurfaced: 2022-11-20',
      'Pothole repairs: 2024-01-10',
    ],
    potholeCount: 4,
    healthScore: 62,
  },
  {
    id: 'road-003',
    name: 'Sector 76 Internal Road',
    contractor: 'City Development Authority',
    constructionYear: 2019,
    length: 2.4,
    maintenanceHistory: ['Last resurfaced: 2023-09-12'],
    potholeCount: 2,
    healthScore: 82,
  },
  {
    id: 'road-004',
    name: 'Sector 51 Main Road',
    contractor: 'Noida Infrastructure Corp',
    constructionYear: 2013,
    length: 3.9,
    maintenanceHistory: [
      'Last resurfaced: 2022-01-08',
      'Pothole repairs: 2024-01-20',
    ],
    potholeCount: 7,
    healthScore: 41,
  },
];

export const summaryCards = {
  totalPotholes: mockPotholes.length,
  highRiskPotholes: mockPotholes.filter((p) => p.severity === 'high').length,
  roadsNeedingRepair: mockRoads.filter((r) => r.healthScore < 50).length,
  averageRoadHealth:
    mockRoads.reduce((acc, r) => acc + r.healthScore, 0) / mockRoads.length,
};

export const getSeverityColor = (
  severity: 'low' | 'medium' | 'high'
): string => {
  switch (severity) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#eab308';
    case 'high':
      return '#ff6b35';
  }
};

export const getSeverityBgColor = (
  severity: 'low' | 'medium' | 'high'
): string => {
  switch (severity) {
    case 'low':
      return 'bg-green-900/30 text-green-300';
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-300';
    case 'high':
      return 'bg-red-900/30 text-red-300';
  }
};
