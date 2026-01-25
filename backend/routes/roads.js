const express = require('express');
const { roads, potholes } = require('../data/mockData');
const router = express.Router();

// GET /api/roads - Get roads with filtering
router.get('/', (req, res) => {
  try {
    const { city, contractor, healthScore, limit = 50, offset = 0 } = req.query;
    
    let filteredRoads = [...roads];
    
    // Filter by city
    if (city) {
      filteredRoads = filteredRoads.filter(r => 
        r.cityName.toLowerCase() === city.toLowerCase() || r.cityId === city
      );
    }
    
    // Filter by contractor
    if (contractor) {
      filteredRoads = filteredRoads.filter(r => 
        r.contractorName.toLowerCase().includes(contractor.toLowerCase()) || 
        r.contractorId === contractor
      );
    }
    
    // Filter by health score (e.g., healthScore=<50 for roads needing repair)
    if (healthScore) {
      const operator = healthScore.startsWith('<') ? '<' : 
                      healthScore.startsWith('>') ? '>' : '=';
      const value = parseInt(healthScore.replace(/[<>=]/g, ''));
      
      if (operator === '<') {
        filteredRoads = filteredRoads.filter(r => r.healthScore < value);
      } else if (operator === '>') {
        filteredRoads = filteredRoads.filter(r => r.healthScore > value);
      } else {
        filteredRoads = filteredRoads.filter(r => r.healthScore === value);
      }
    }
    
    // Sort by health score (worst first)
    filteredRoads.sort((a, b) => a.healthScore - b.healthScore);
    
    // Add pothole details to each road
    const roadsWithPotholes = filteredRoads.map(road => {
      const roadPotholes = potholes.filter(p => p.roadId === road.id);
      return {
        ...road,
        potholes: roadPotholes.map(p => ({
          id: p.id,
          severity: p.severity,
          riskScore: p.riskScore,
          detectedTime: p.detectedTime,
          location: p.location
        }))
      };
    });
    
    // Pagination
    const total = roadsWithPotholes.length;
    const paginatedRoads = roadsWithPotholes.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: paginatedRoads,
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
      error: 'Failed to fetch roads',
      message: error.message
    });
  }
});

// GET /api/roads/:id - Get specific road
router.get('/:id', (req, res) => {
  try {
    const road = roads.find(r => r.id === req.params.id);
    
    if (!road) {
      return res.status(404).json({
        success: false,
        error: 'Road not found'
      });
    }
    
    // Add pothole details
    const roadPotholes = potholes.filter(p => p.roadId === road.id);
    const roadWithPotholes = {
      ...road,
      potholes: roadPotholes
    };
    
    res.json({
      success: true,
      data: roadWithPotholes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch road',
      message: error.message
    });
  }
});

// GET /api/roads/stats/summary - Get road statistics
router.get('/stats/summary', (req, res) => {
  try {
    const { city } = req.query;
    
    let filteredRoads = [...roads];
    
    if (city) {
      filteredRoads = filteredRoads.filter(r => 
        r.cityName.toLowerCase() === city.toLowerCase() || r.cityId === city
      );
    }
    
    const stats = {
      total: filteredRoads.length,
      needingRepair: filteredRoads.filter(r => r.healthScore < 50).length,
      goodCondition: filteredRoads.filter(r => r.healthScore >= 80).length,
      averageHealthScore: filteredRoads.length > 0 
        ? Math.round(filteredRoads.reduce((acc, r) => acc + r.healthScore, 0) / filteredRoads.length)
        : 0,
      totalLength: Math.round(filteredRoads.reduce((acc, r) => acc + r.length, 0) * 10) / 10,
      byConstructionYear: filteredRoads.reduce((acc, road) => {
        const year = road.constructionYear;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {}),
      bySurfaceType: {
        asphalt: filteredRoads.filter(r => r.surfaceType === 'Asphalt').length,
        concrete: filteredRoads.filter(r => r.surfaceType === 'Concrete').length
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch road statistics',
      message: error.message
    });
  }
});

module.exports = router;