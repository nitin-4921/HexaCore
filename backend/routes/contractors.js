const express = require('express');
const { contractors, roads, potholes } = require('../data/mockData');
const router = express.Router();

// GET /api/contractors - Get all contractors
router.get('/', (req, res) => {
  try {
    const { city, limit = 50, offset = 0 } = req.query;
    
    let contractorsWithStats = contractors.map(contractor => {
      let contractorRoads = roads.filter(r => r.contractorId === contractor.id);
      
      // Filter by city if specified
      if (city) {
        contractorRoads = contractorRoads.filter(r => 
          r.cityName.toLowerCase() === city.toLowerCase() || r.cityId === city
        );
      }
      
      const contractorPotholes = potholes.filter(p => p.contractorId === contractor.id);
      
      const averageHealthScore = contractorRoads.length > 0 
        ? Math.round(contractorRoads.reduce((acc, r) => acc + r.healthScore, 0) / contractorRoads.length)
        : 0;
      
      // Calculate rating based on road health and pothole count
      const rating = Math.min(5, Math.max(1, 
        (averageHealthScore / 20) + (5 - Math.min(4, contractorPotholes.length / 10))
      ));
      
      return {
        ...contractor,
        stats: {
          totalRoadsBuilt: contractorRoads.length,
          averageRoadHealth: averageHealthScore,
          totalPotholes: contractorPotholes.length,
          rating: Math.round(rating * 10) / 10,
          totalLength: Math.round(contractorRoads.reduce((acc, r) => acc + r.length, 0) * 10) / 10,
          roadsNeedingRepair: contractorRoads.filter(r => r.healthScore < 50).length
        }
      };
    });
    
    // Sort by rating (highest first)
    contractorsWithStats.sort((a, b) => b.stats.rating - a.stats.rating);
    
    // Pagination
    const total = contractorsWithStats.length;
    const paginatedContractors = contractorsWithStats.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: paginatedContractors,
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
      error: 'Failed to fetch contractors',
      message: error.message
    });
  }
});

// GET /api/contractors/:id - Get specific contractor
router.get('/:id', (req, res) => {
  try {
    const contractor = contractors.find(c => c.id === req.params.id);
    
    if (!contractor) {
      return res.status(404).json({
        success: false,
        error: 'Contractor not found'
      });
    }
    
    const contractorRoads = roads.filter(r => r.contractorId === contractor.id);
    const contractorPotholes = potholes.filter(p => p.contractorId === contractor.id);
    
    const averageHealthScore = contractorRoads.length > 0 
      ? Math.round(contractorRoads.reduce((acc, r) => acc + r.healthScore, 0) / contractorRoads.length)
      : 0;
    
    const rating = Math.min(5, Math.max(1, 
      (averageHealthScore / 20) + (5 - Math.min(4, contractorPotholes.length / 10))
    ));
    
    const contractorWithDetails = {
      ...contractor,
      stats: {
        totalRoadsBuilt: contractorRoads.length,
        averageRoadHealth: averageHealthScore,
        totalPotholes: contractorPotholes.length,
        rating: Math.round(rating * 10) / 10,
        totalLength: Math.round(contractorRoads.reduce((acc, r) => acc + r.length, 0) * 10) / 10,
        roadsNeedingRepair: contractorRoads.filter(r => r.healthScore < 50).length
      },
      roads: contractorRoads.map(road => ({
        ...road,
        potholeCount: potholes.filter(p => p.roadId === road.id).length
      }))
    };
    
    res.json({
      success: true,
      data: contractorWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contractor',
      message: error.message
    });
  }
});

// GET /api/contractors/:id/roads - Get roads built by specific contractor
router.get('/:id/roads', (req, res) => {
  try {
    const contractor = contractors.find(c => c.id === req.params.id);
    
    if (!contractor) {
      return res.status(404).json({
        success: false,
        error: 'Contractor not found'
      });
    }
    
    const contractorRoads = roads.filter(r => r.contractorId === contractor.id);
    
    // Add pothole details to each road
    const roadsWithPotholes = contractorRoads.map(road => {
      const roadPotholes = potholes.filter(p => p.roadId === road.id);
      return {
        ...road,
        potholeCount: roadPotholes.length,
        potholes: roadPotholes.map(p => ({
          id: p.id,
          severity: p.severity,
          riskScore: p.riskScore,
          detectedTime: p.detectedTime
        }))
      };
    });
    
    res.json({
      success: true,
      data: roadsWithPotholes,
      contractor: {
        id: contractor.id,
        name: contractor.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contractor roads',
      message: error.message
    });
  }
});

module.exports = router;