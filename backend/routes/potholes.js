const express = require('express');
const { potholes } = require('../data/mockData');
const router = express.Router();

// GET /api/potholes - Get potholes with filtering
router.get('/', (req, res) => {
  try {
    const { city, severity, status, limit = 50, offset = 0 } = req.query;
    
    let filteredPotholes = [...potholes];
    
    // Filter by city
    if (city) {
      filteredPotholes = filteredPotholes.filter(p => 
        p.cityName.toLowerCase() === city.toLowerCase() || p.cityId === city
      );
    }
    
    // Filter by severity
    if (severity) {
      filteredPotholes = filteredPotholes.filter(p => p.severity === severity);
    }
    
    // Filter by status
    if (status) {
      filteredPotholes = filteredPotholes.filter(p => p.status === status);
    }
    
    // Sort by detection time (newest first)
    filteredPotholes.sort((a, b) => new Date(b.detectedTime) - new Date(a.detectedTime));
    
    // Pagination
    const total = filteredPotholes.length;
    const paginatedPotholes = filteredPotholes.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: paginatedPotholes,
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
      error: 'Failed to fetch potholes',
      message: error.message
    });
  }
});

// GET /api/potholes/:id - Get specific pothole
router.get('/:id', (req, res) => {
  try {
    const pothole = potholes.find(p => p.id === req.params.id);
    
    if (!pothole) {
      return res.status(404).json({
        success: false,
        error: 'Pothole not found'
      });
    }
    
    res.json({
      success: true,
      data: pothole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pothole',
      message: error.message
    });
  }
});

// GET /api/potholes/stats/summary - Get pothole statistics
router.get('/stats/summary', (req, res) => {
  try {
    const { city } = req.query;
    
    let filteredPotholes = [...potholes];
    
    if (city) {
      filteredPotholes = filteredPotholes.filter(p => 
        p.cityName.toLowerCase() === city.toLowerCase() || p.cityId === city
      );
    }
    
    const stats = {
      total: filteredPotholes.length,
      byStatus: {
        reported: filteredPotholes.filter(p => p.status === 'reported').length,
        fixed: filteredPotholes.filter(p => p.status === 'fixed').length
      },
      bySeverity: {
        low: filteredPotholes.filter(p => p.severity === 'low').length,
        medium: filteredPotholes.filter(p => p.severity === 'medium').length,
        high: filteredPotholes.filter(p => p.severity === 'high').length
      },
      byPriority: {
        normal: filteredPotholes.filter(p => p.priority === 'normal').length,
        high: filteredPotholes.filter(p => p.priority === 'high').length,
        urgent: filteredPotholes.filter(p => p.priority === 'urgent').length
      },
      averageRiskScore: filteredPotholes.length > 0 
        ? Math.round(filteredPotholes.reduce((acc, p) => acc + p.riskScore, 0) / filteredPotholes.length)
        : 0,
      totalEstimatedCost: filteredPotholes.reduce((acc, p) => acc + p.estimatedRepairCost, 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pothole statistics',
      message: error.message
    });
  }
});

module.exports = router;