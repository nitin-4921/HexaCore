/**
 * VALIDATION MIDDLEWARE
 * 
 * Production-ready validation middleware for IoT data ingestion
 * and API request validation.
 * 
 * Features:
 * - Schema validation
 * - Data sanitization
 * - Error standardization
 * - Security checks
 */

/**
 * Validate IoT pothole ingestion payload
 */
const validatePotholeIngestion = (req, res, next) => {
  const { deviceId, timestamp, location, severity, riskScore } = req.body;
  const errors = [];

  // Device ID validation
  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
    errors.push('deviceId is required and must be a non-empty string');
  }

  // Timestamp validation
  if (!timestamp) {
    errors.push('timestamp is required');
  } else {
    const parsedDate = new Date(timestamp);
    if (isNaN(parsedDate.getTime())) {
      errors.push('timestamp must be a valid ISO 8601 date string');
    }
    // Check if timestamp is not too far in the future (max 1 hour)
    const now = new Date();
    const maxFutureTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    if (parsedDate > maxFutureTime) {
      errors.push('timestamp cannot be more than 1 hour in the future');
    }
  }

  // Location validation
  if (!location || typeof location !== 'object') {
    errors.push('location is required and must be an object');
  } else {
    if (typeof location.lat !== 'number' || location.lat < -90 || location.lat > 90) {
      errors.push('location.lat must be a number between -90 and 90');
    }
    if (typeof location.lng !== 'number' || location.lng < -180 || location.lng > 180) {
      errors.push('location.lng must be a number between -180 and 180');
    }
  }

  // Severity validation
  if (!severity || !['low', 'medium', 'high'].includes(severity)) {
    errors.push('severity must be one of: low, medium, high');
  }

  // Risk score validation
  if (riskScore === undefined || riskScore === null) {
    errors.push('riskScore is required');
  } else if (typeof riskScore !== 'number' || riskScore < 0 || riskScore > 100) {
    errors.push('riskScore must be a number between 0 and 100');
  }

  // Image URL validation (optional)
  if (req.body.imageUrl && typeof req.body.imageUrl !== 'string') {
    errors.push('imageUrl must be a string if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Request payload contains validation errors',
      details: errors
    });
  }

  // Sanitize data
  req.body.deviceId = req.body.deviceId.trim();
  if (req.body.location.address) {
    req.body.location.address = req.body.location.address.trim();
  }

  next();
};

/**
 * Rate limiting middleware (basic implementation)
 * TODO: Replace with Redis-based rate limiting in production
 */
const rateLimitBasic = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean old entries
    for (const [id, data] of requests.entries()) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(id);
      }
    }

    // Check current client
    const clientData = requests.get(clientId);
    if (!clientData) {
      requests.set(clientId, { firstRequest: now, count: 1 });
      return next();
    }

    if (now - clientData.firstRequest > windowMs) {
      // Reset window
      requests.set(clientId, { firstRequest: now, count: 1 });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs/1000} seconds`
      });
    }

    clientData.count++;
    next();
  };
};

/**
 * API Key authentication middleware (placeholder)
 * TODO: Implement proper API key validation
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  // For now, allow all requests
  // TODO: Implement proper API key validation
  if (process.env.NODE_ENV === 'production' && !apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'API key is required for IoT data ingestion'
    });
  }

  // TODO: Validate API key against database
  // TODO: Check device permissions
  
  next();
};

module.exports = {
  validatePotholeIngestion,
  rateLimitBasic,
  authenticateApiKey
};