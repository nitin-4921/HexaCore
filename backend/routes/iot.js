const express = require('express');
const { iotDevices, potholes, cities } = require('../data/mockData');
const { v4: uuidv4 } = require('uuid');
const { validatePotholeIngestion, rateLimitBasic, authenticateApiKey } = require('../middleware/validation');
const ingestionLogger = require('../services/ingestionLogger');
const router = express.Router();

// ===== IOT DATA INGESTION ENDPOINT =====

/**
 * POST /api/iot/pothole - IoT Device Data Ingestion
 * 
 * Allows IoT devices (rovers, cameras, sensors) to send pothole detection data
 * to the backend for real-time dashboard integration.
 * 
 * PRODUCTION READY:
 * - Validates device authentication
 * - Maps IoT payload to internal schema
 * - Updates device tracking metadata
 * - Integrates with existing analytics APIs
 * 
 * SECURITY: TODO - Add API key authentication, rate limiting
 */
router.post('/pothole', 
  rateLimitBasic(50, 60000), // 50 requests per minute per IP
  authenticateApiKey,        // TODO: Enable in production
  validatePotholeIngestion,  // Validate payload
  (req, res) => {
  const startTime = Date.now();
  
  try {
    const { deviceId, timestamp, location, severity, riskScore, imageUrl, metadata } = req.body;

    // ===== DEVICE VERIFICATION =====
    
    const device = iotDevices.find(d => d.id === deviceId);
    if (!device) {
      ingestionLogger.logError(new Error('Device not found'), { 
        deviceId, 
        endpoint: '/api/iot/pothole' 
      });
      
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        message: `Device ${deviceId} is not registered in the system`
      });
    }

    // Log device activity
    ingestionLogger.logDeviceActivity(deviceId, 'ingestion_attempt', {
      severity,
      riskScore,
      hasImage: !!imageUrl
    });

    // ===== CITY MAPPING =====
    
    // Determine city based on coordinates (simplified logic)
    let cityId = 'city-002'; // Default to Noida
    let cityName = 'Noida';
    
    // Simple city detection based on coordinates
    // TODO: Replace with proper geofencing/reverse geocoding
    if (location.lat >= 28.4 && location.lat <= 28.7 && location.lng >= 77.2 && location.lng <= 77.5) {
      cityId = 'city-002';
      cityName = 'Noida';
    } else if (location.lat >= 28.5 && location.lat <= 28.8 && location.lng >= 76.9 && location.lng <= 77.3) {
      cityId = 'city-001';
      cityName = 'Delhi';
    }
    // Add more city detection logic as needed

    // ===== DATA MAPPING & GENERATION =====
    
    // Generate unique pothole ID
    const potholeId = `pot-iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Map IoT payload to internal pothole schema
    const newPothole = {
      // Core identification
      id: potholeId,
      
      // Location data (direct mapping)
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        address: location.address || `Lat: ${location.lat}, Lng: ${location.lng}` // Fallback address
      },
      
      // City mapping
      cityId: cityId,
      cityName: cityName,
      
      // Road information (TODO: Enhance with road detection)
      roadId: `road-${cityId}-auto`, // Auto-generated for now
      roadName: location.roadName || 'Auto-detected Road',
      
      // Contractor information (TODO: Map based on road ownership)
      contractorId: 'contractor-001', // Default contractor for now
      contractorName: 'Auto-assigned Contractor',
      
      // Detection data (direct mapping)
      severity: severity,
      riskScore: parseInt(riskScore),
      detectedTime: timestamp,
      
      // Device information (IoT → Backend mapping)
      sensorId: deviceId,           // deviceId → sensorId
      sensorName: device.name,
      
      // Physical measurements (TODO: Extract from ML analysis)
      depth: severity === 'high' ? Math.random() * 5 + 7 : 
             severity === 'medium' ? Math.random() * 3 + 4 : 
             Math.random() * 3 + 1,
      width: severity === 'high' ? Math.random() * 8 + 10 : 
             severity === 'medium' ? Math.random() * 5 + 6 : 
             Math.random() * 4 + 3,
      
      // Status and priority (auto-assigned based on severity)
      status: 'reported',
      priority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'high' : 'normal',
      
      // Cost estimation (TODO: ML-based estimation)
      estimatedRepairCost: severity === 'high' ? Math.floor(Math.random() * 3000) + 3000 :
                          severity === 'medium' ? Math.floor(Math.random() * 2000) + 1500 :
                          Math.floor(Math.random() * 1000) + 500,
      
      // Environmental data (from IoT metadata or defaults)
      weatherCondition: metadata?.weather || 'clear',
      trafficImpact: severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
      
      // Image data (direct mapping)
      imageUrl: imageUrl || undefined,
      imageMetadata: imageUrl ? {
        capturedAt: timestamp,
        cameraId: `${deviceId}-cam`,
        resolution: metadata?.resolution || '1920x1080',
        fileSize: metadata?.fileSize || undefined
      } : undefined
    };

    // ===== DATA STORAGE =====
    
    // Add to existing potholes array (in-memory for now)
    // TODO: Replace with database insertion in production
    potholes.push(newPothole);
    
    console.log(`✅ IoT Ingestion: New pothole ${potholeId} from device ${deviceId}`);

    // ===== DEVICE TRACKING UPDATE =====
    
    // Update device metadata to reflect successful ingestion
    device.lastPing = new Date().toISOString();
    device.dataCollected = (device.dataCollected || 0) + 1;
    device.status = 'active'; // Mark device as active
    
    // Update device coordinates if provided
    if (location.lat && location.lng) {
      device.coordinates = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
    }

    // ===== SUCCESS RESPONSE =====
    
    const processingTime = Date.now() - startTime;
    
    // Log successful ingestion
    ingestionLogger.logIngestion({
      deviceId,
      potholeId,
      severity,
      riskScore,
      location,
      city: cityName,
      processingTime
    });
    
    res.status(201).json({
      success: true,
      message: 'Pothole data ingested successfully',
      data: {
        potholeId: potholeId,
        deviceId: deviceId,
        timestamp: timestamp,
        severity: severity,
        riskScore: riskScore,
        city: cityName,
        processingTime: `${processingTime}ms`
      }
    });

    // ===== FUTURE INTEGRATIONS =====
    
    // TODO: Real-time notifications
    // TODO: ML pipeline trigger for image analysis
    // TODO: Government reporting integration
    // TODO: Maintenance crew assignment
    
  } catch (error) {
    ingestionLogger.logError(error, { 
      deviceId: req.body?.deviceId,
      endpoint: '/api/iot/pothole',
      payload: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process IoT data ingestion'
    });
  }
});

// ===== INGESTION MONITORING ENDPOINTS =====

/**
 * GET /api/iot/ingestion/stats - Ingestion Statistics
 * Monitor IoT data ingestion performance and device activity
 */
router.get('/ingestion/stats', (req, res) => {
  try {
    const stats = {
      totalDevices: iotDevices.length,
      activeDevices: iotDevices.filter(d => d.status === 'active').length,
      totalPotholes: potholes.length,
      recentIngestions: potholes.filter(p => 
        new Date(p.detectedTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      ingestionRate: {
        lastHour: potholes.filter(p => 
          new Date(p.detectedTime) > new Date(Date.now() - 60 * 60 * 1000)
        ).length,
        last24Hours: potholes.filter(p => 
          new Date(p.detectedTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      },
      severityDistribution: {
        high: potholes.filter(p => p.severity === 'high').length,
        medium: potholes.filter(p => p.severity === 'medium').length,
        low: potholes.filter(p => p.severity === 'low').length
      },
      deviceActivity: iotDevices.map(device => ({
        deviceId: device.id,
        name: device.name,
        status: device.status,
        lastPing: device.lastPing,
        dataCollected: device.dataCollected || 0,
        batteryLevel: device.batteryLevel
      }))
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    ingestionLogger.logError(error, { endpoint: '/api/iot/ingestion/stats' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ingestion statistics'
    });
  }
});

/**
 * GET /api/iot/ingestion/health - System Health Check
 * Check if ingestion system is operational
 */
router.get('/ingestion/health', (req, res) => {
  try {
    const recentIngestions = potholes.filter(p => 
      new Date(p.detectedTime) > new Date(Date.now() - 60 * 60 * 1000)
    ).length;

    const activeDevices = iotDevices.filter(d => d.status === 'active').length;
    const totalDevices = iotDevices.length;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        ingestionActive: recentIngestions > 0,
        devicesOnline: activeDevices > 0,
        systemResponsive: true
      },
      metrics: {
        recentIngestions,
        activeDevices,
        totalDevices,
        deviceOnlinePercentage: Math.round((activeDevices / totalDevices) * 100)
      }
    };

    // Determine overall health status
    if (activeDevices === 0) {
      health.status = 'warning';
      health.message = 'No active devices detected';
    } else if (recentIngestions === 0 && activeDevices > 0) {
      health.status = 'warning';
      health.message = 'Devices online but no recent ingestions';
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      status: 'unhealthy'
    });
  }
});

// ===== DEVICE REGISTRATION ENDPOINT (Future) =====

/**
 * POST /api/iot/register-device - Device Registration
 * TODO: Implement device registration for new IoT devices
 */
router.post('/register-device', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: 'Device registration endpoint - Coming soon'
  });
});

// ===== EXISTING ENDPOINTS (Unchanged) =====

// GET /api/iot/devices - Get all IoT devices
router.get('/devices', (req, res) => {
  try {
    const { city, status, type, limit = 50, offset = 0 } = req.query;
    
    let filteredDevices = [...iotDevices];
    
    // Filter by city
    if (city) {
      filteredDevices = filteredDevices.filter(d => d.cityId === city);
    }
    
    // Filter by status
    if (status) {
      filteredDevices = filteredDevices.filter(d => d.status === status);
    }
    
    // Filter by type
    if (type) {
      filteredDevices = filteredDevices.filter(d => d.type === type);
    }
    
    // Sort by last ping (most recent first)
    filteredDevices.sort((a, b) => new Date(b.lastPing) - new Date(a.lastPing));
    
    // Add detection count for each device
    const devicesWithStats = filteredDevices.map(device => {
      const deviceDetections = potholes.filter(p => p.sensorId === device.id);
      return {
        ...device,
        stats: {
          totalDetections: deviceDetections.length,
          recentDetections: deviceDetections.filter(p => 
            new Date(p.detectedTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length,
          highRiskDetections: deviceDetections.filter(p => p.severity === 'high').length
        }
      };
    });
    
    // Pagination
    const total = devicesWithStats.length;
    const paginatedDevices = devicesWithStats.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: paginatedDevices,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IoT devices',
      message: error.message
    });
  }
});

// GET /api/iot/devices/:id - Get specific device
router.get('/devices/:id', (req, res) => {
  try {
    const device = iotDevices.find(d => d.id === req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    const deviceDetections = potholes.filter(p => p.sensorId === device.id);
    
    const deviceWithStats = {
      ...device,
      stats: {
        totalDetections: deviceDetections.length,
        recentDetections: deviceDetections.filter(p => 
          new Date(p.detectedTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        highRiskDetections: deviceDetections.filter(p => p.severity === 'high').length,
        averageRiskScore: deviceDetections.length > 0 
          ? Math.round(deviceDetections.reduce((acc, p) => acc + p.riskScore, 0) / deviceDetections.length)
          : 0
      },
      recentDetections: deviceDetections
        .sort((a, b) => new Date(b.detectedTime) - new Date(a.detectedTime))
        .slice(0, 10)
    };
    
    res.json({
      success: true,
      data: deviceWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device',
      message: error.message
    });
  }
});

// GET /api/iot/stats - Get IoT system statistics
router.get('/stats', (req, res) => {
  try {
    const { city } = req.query;
    
    let filteredDevices = [...iotDevices];
    
    if (city) {
      filteredDevices = filteredDevices.filter(d => d.cityId === city);
    }
    
    const stats = {
      totalDevices: filteredDevices.length,
      activeDevices: filteredDevices.filter(d => d.status === 'active').length,
      maintenanceDevices: filteredDevices.filter(d => d.status === 'maintenance').length,
      averageBatteryLevel: filteredDevices.length > 0 
        ? Math.round(filteredDevices.reduce((acc, d) => acc + d.batteryLevel, 0) / filteredDevices.length)
        : 0,
      deviceTypes: {
        rover: filteredDevices.filter(d => d.type === 'rover').length,
        fixedSensor: filteredDevices.filter(d => d.type === 'fixed-sensor').length,
        mobileUnit: filteredDevices.filter(d => d.type === 'mobile-unit').length
      },
      totalDataCollected: filteredDevices.reduce((acc, d) => acc + d.dataCollected, 0),
      networkCoverage: Math.round((filteredDevices.filter(d => d.status === 'active').length / filteredDevices.length) * 100) || 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IoT statistics',
      message: error.message
    });
  }
});

module.exports = router;