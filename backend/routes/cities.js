const express = require('express');
const { cities, potholes, roads } = require('../data/mockData');
const router = express.Router();

// GET /api/cities - Get all cities
router.get('/', (req, res) => {
  try {
    const citiesWithStats = cities.map(city => {
      const cityPotholes = potholes.filter(p => p.cityId === city.id);
      const cityRoads = roads.filter(r => r.cityId === city.id);
      
      return {
        ...city,
        stats: {
          totalPotholes: cityPotholes.length,
          highRiskPotholes: cityPotholes.filter(p => p.severity === 'high').length,
          roadsNeedingRepair: cityRoads.filter(r => r.healthScore < 50).length,
          averageRoadHealth: cityRoads.length > 0 
            ? Math.round(cityRoads.reduce((acc, r) => acc + r.healthScore, 0) / cityRoads.length)
            : 0
        }
      };
    });
    
    res.json({
      success: true,
      data: citiesWithStats,
      count: citiesWithStats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities',
      message: error.message
    });
  }
});

// GET /api/cities/:id - Get specific city
router.get('/:id', (req, res) => {
  try {
    const city = cities.find(c => c.id === req.params.id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }
    
    const cityPotholes = potholes.filter(p => p.cityId === city.id);
    const cityRoads = roads.filter(r => r.cityId === city.id);
    
    const cityWithStats = {
      ...city,
      stats: {
        totalPotholes: cityPotholes.length,
        highRiskPotholes: cityPotholes.filter(p => p.severity === 'high').length,
        roadsNeedingRepair: cityRoads.filter(r => r.healthScore < 50).length,
        averageRoadHealth: cityRoads.length > 0 
          ? Math.round(cityRoads.reduce((acc, r) => acc + r.healthScore, 0) / cityRoads.length)
          : 0
      }
    };
    
    res.json({
      success: true,
      data: cityWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city',
      message: error.message
    });
  }
});

module.exports = router;