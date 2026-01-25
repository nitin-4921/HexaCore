const { v4: uuidv4 } = require('uuid');

// Cities data
const cities = [
  {
    id: 'city-001',
    name: 'Delhi',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    population: 32900000,
    area: 1484, // sq km
    totalRoads: 156,
    activeRovers: 12
  },
  {
    id: 'city-002',
    name: 'Noida',
    coordinates: { lat: 28.5355, lng: 77.3910 },
    population: 642381,
    area: 203, // sq km
    totalRoads: 89,
    activeRovers: 8
  },
  {
    id: 'city-003',
    name: 'Mumbai',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    population: 20400000,
    area: 603, // sq km
    totalRoads: 234,
    activeRovers: 15
  },
  {
    id: 'city-004',
    name: 'Pune',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    population: 7400000,
    area: 331, // sq km
    totalRoads: 127,
    activeRovers: 10
  },
  {
    id: 'city-005',
    name: 'Kanpur',
    coordinates: { lat: 26.4499, lng: 80.3319 },
    population: 3200000,
    area: 403, // sq km
    totalRoads: 78,
    activeRovers: 6
  }
];

// Contractors data
const contractors = [
  {
    id: 'contractor-001',
    name: 'Noida Infrastructure Corp',
    establishedYear: 2010,
    totalRoadsBuilt: 45,
    averageRoadHealth: 72,
    rating: 4.2,
    specialization: ['Highway Construction', 'Urban Roads', 'Bridge Construction'],
    contactInfo: {
      email: 'info@noidainfra.com',
      phone: '+91-120-4567890',
      address: 'Sector 62, Noida, UP'
    },
    certifications: ['ISO 9001:2015', 'CPWD Grade A', 'NHAI Approved']
  },
  {
    id: 'contractor-002',
    name: 'UP Urban Roads Ltd',
    establishedYear: 2008,
    totalRoadsBuilt: 67,
    averageRoadHealth: 68,
    rating: 3.9,
    specialization: ['Urban Development', 'Road Maintenance', 'Traffic Management'],
    contactInfo: {
      email: 'contact@upurbanroads.com',
      phone: '+91-120-9876543',
      address: 'Lucknow, UP'
    },
    certifications: ['ISO 14001:2015', 'CPWD Grade B', 'UP PWD Approved']
  },
  {
    id: 'contractor-003',
    name: 'City Development Authority',
    establishedYear: 2015,
    totalRoadsBuilt: 32,
    averageRoadHealth: 85,
    rating: 4.6,
    specialization: ['Smart City Projects', 'Sustainable Infrastructure', 'IoT Integration'],
    contactInfo: {
      email: 'info@citydev.gov.in',
      phone: '+91-11-2345678',
      address: 'New Delhi'
    },
    certifications: ['ISO 45001:2018', 'Green Building Council', 'Smart City Mission Approved']
  },
  {
    id: 'contractor-004',
    name: 'Metro Infrastructure Pvt Ltd',
    establishedYear: 2012,
    totalRoadsBuilt: 28,
    averageRoadHealth: 79,
    rating: 4.3,
    specialization: ['Metro Connectivity', 'Flyover Construction', 'Underground Infrastructure'],
    contactInfo: {
      email: 'projects@metroinfra.com',
      phone: '+91-22-8765432',
      address: 'Mumbai, Maharashtra'
    },
    certifications: ['ISO 9001:2015', 'RITES Approved', 'DMRC Certified']
  }
];

// Generate IoT devices/rovers
const generateIoTDevices = () => {
  const devices = [];
  const deviceTypes = ['rover', 'fixed-sensor', 'mobile-unit'];
  
  for (let i = 1; i <= 25; i++) {
    devices.push({
      id: `device-${String(i).padStart(3, '0')}`,
      name: `Rover-${String(i).padStart(3, '0')}`,
      type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      cityId: cities[Math.floor(Math.random() * cities.length)].id,
      status: Math.random() > 0.1 ? 'active' : 'maintenance',
      lastPing: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
      batteryLevel: Math.floor(Math.random() * 100),
      coordinates: {
        lat: cities[1].coordinates.lat + (Math.random() - 0.5) * 0.1, // Around Noida
        lng: cities[1].coordinates.lng + (Math.random() - 0.5) * 0.1
      },
      firmware: '2.1.4',
      dataCollected: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return devices;
};

// Generate roads data
const generateRoads = () => {
  const roads = [];
  const roadTypes = ['Highway', 'Main Road', 'Link Road', 'Service Road', 'Internal Road'];
  
  cities.forEach(city => {
    const roadCount = Math.floor(Math.random() * 20) + 10; // 10-30 roads per city
    
    for (let i = 1; i <= roadCount; i++) {
      const contractor = contractors[Math.floor(Math.random() * contractors.length)];
      const constructionYear = 2010 + Math.floor(Math.random() * 14); // 2010-2024
      const healthScore = Math.floor(Math.random() * 100);
      const potholeCount = healthScore < 50 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5);
      
      roads.push({
        id: `road-${city.id}-${String(i).padStart(3, '0')}`,
        name: `${roadTypes[Math.floor(Math.random() * roadTypes.length)]} ${i}`,
        cityId: city.id,
        cityName: city.name,
        contractorId: contractor.id,
        contractorName: contractor.name,
        constructionYear,
        length: Math.round((Math.random() * 10 + 0.5) * 10) / 10, // 0.5-10.5 km
        width: Math.floor(Math.random() * 20) + 8, // 8-28 meters
        lanes: Math.floor(Math.random() * 6) + 2, // 2-8 lanes
        surfaceType: Math.random() > 0.3 ? 'Asphalt' : 'Concrete',
        healthScore,
        potholeCount,
        lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 3600000).toISOString(), // Within 90 days
        maintenanceHistory: [
          `Last resurfaced: ${new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0]}`,
          `Pothole repairs: ${new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString().split('T')[0]}`
        ],
        trafficVolume: Math.floor(Math.random() * 50000) + 5000, // vehicles per day
        speedLimit: [30, 40, 50, 60, 80][Math.floor(Math.random() * 5)]
      });
    }
  });
  
  return roads;
};

// Generate potholes data
const generatePotholes = (roads) => {
  const potholes = [];
  const severityLevels = ['low', 'medium', 'high'];
  const devices = generateIoTDevices();
  
  roads.forEach(road => {
    const city = cities.find(c => c.id === road.cityId);
    
    for (let i = 0; i < road.potholeCount; i++) {
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      
      // Generate coordinates along the road (simplified)
      const lat = city.coordinates.lat + (Math.random() - 0.5) * 0.05;
      const lng = city.coordinates.lng + (Math.random() - 0.5) * 0.05;
      
      const depth = severity === 'high' ? Math.random() * 5 + 7 : 
                   severity === 'medium' ? Math.random() * 3 + 4 : 
                   Math.random() * 3 + 1;
      
      const width = severity === 'high' ? Math.random() * 8 + 10 : 
                   severity === 'medium' ? Math.random() * 5 + 6 : 
                   Math.random() * 4 + 3;
      
      const riskScore = severity === 'high' ? Math.floor(Math.random() * 20) + 80 : 
                       severity === 'medium' ? Math.floor(Math.random() * 30) + 50 : 
                       Math.floor(Math.random() * 40) + 10;
      
      potholes.push({
        id: `pothole-${road.id}-${String(i + 1).padStart(3, '0')}`,
        location: {
          lat,
          lng,
          address: `${road.name}, ${city.name}`
        },
        cityId: city.id,
        cityName: city.name,
        roadId: road.id,
        roadName: road.name,
        contractorId: road.contractorId,
        contractorName: road.contractorName,
        severity,
        depth: Math.round(depth * 10) / 10,
        width: Math.round(width * 10) / 10,
        riskScore,
        detectedTime: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(), // Within 30 days
        sensorId: device.id,
        sensorName: device.name,
        status: Math.random() > 0.2 ? 'reported' : 'fixed',
        priority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'high' : 'normal',
        estimatedRepairCost: Math.floor(Math.random() * 5000) + 1000, // ₹1000-6000
        weatherCondition: ['clear', 'rainy', 'foggy'][Math.floor(Math.random() * 3)],
        trafficImpact: severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
        // ✅ NEW FIELD - IoT Camera Integration Ready
        imageUrl: Math.random() > 0.2 ? `https://images.unsplash.com/photo-${[
          '1578662996442-48f60103fc96', // Road damage
          '1558618666-fcd25c85cd64', // Asphalt crack
          '1621905251189-08b45d6a269e', // Road surface
          '1606041008023-472dfb5e530f', // Pothole
          '1584464491033-06628f3a6b7b', // Road repair
          '1607400201515-c2c41c07d307'  // Street damage
        ][Math.floor(Math.random() * 6)]}?w=400&h=300&fit=crop&crop=center` : undefined,
        imageMetadata: Math.random() > 0.2 ? {
          capturedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
          cameraId: `${device.id}-cam`,
          resolution: '1920x1080',
          fileSize: Math.floor(Math.random() * 500000) + 100000 // 100KB - 600KB
        } : undefined
      });
    }
  });
  
  return potholes;
};

// Generate all data
const roads = generateRoads();
const potholes = generatePotholes(roads);
const iotDevices = generateIoTDevices();

module.exports = {
  cities,
  contractors,
  roads,
  potholes,
  iotDevices
};