/**
 * IOT INGESTION LOGGING SERVICE
 * 
 * Production-ready logging service for IoT data ingestion
 * tracking, monitoring, and debugging.
 * 
 * Features:
 * - Structured logging
 * - Performance metrics
 * - Error tracking
 * - Device activity monitoring
 */

const fs = require('fs');
const path = require('path');

class IngestionLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log successful pothole ingestion
   */
  logIngestion(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'INGESTION_SUCCESS',
      deviceId: data.deviceId,
      potholeId: data.potholeId,
      severity: data.severity,
      riskScore: data.riskScore,
      location: data.location,
      city: data.city,
      processingTime: data.processingTime || null
    };

    this.writeLog('ingestion.log', logEntry);
    console.log(`✅ [INGESTION] Device ${data.deviceId} → Pothole ${data.potholeId} (${data.severity})`);
  }

  /**
   * Log ingestion errors
   */
  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'INGESTION_ERROR',
      error: error.message,
      stack: error.stack,
      context: context,
      deviceId: context.deviceId || null,
      endpoint: context.endpoint || null
    };

    this.writeLog('errors.log', logEntry);
    console.error(`❌ [INGESTION ERROR] ${error.message}`, context);
  }

  /**
   * Log device activity
   */
  logDeviceActivity(deviceId, activity, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'DEVICE_ACTIVITY',
      deviceId: deviceId,
      activity: activity, // 'ping', 'ingestion', 'registration', etc.
      metadata: metadata
    };

    this.writeLog('devices.log', logEntry);
    console.log(`📡 [DEVICE] ${deviceId} → ${activity}`);
  }

  /**
   * Log validation failures
   */
  logValidationError(errors, payload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'VALIDATION_ERROR',
      errors: errors,
      payload: this.sanitizePayload(payload),
      deviceId: payload?.deviceId || null
    };

    this.writeLog('validation.log', logEntry);
    console.warn(`⚠️ [VALIDATION] Errors: ${errors.join(', ')}`);
  }

  /**
   * Log system metrics
   */
  logMetrics(metrics) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'METRICS',
      ...metrics
    };

    this.writeLog('metrics.log', logEntry);
  }

  /**
   * Write log entry to file
   */
  writeLog(filename, logEntry) {
    const logPath = path.join(this.logDir, filename);
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logPath, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Sanitize payload for logging (remove sensitive data)
   */
  sanitizePayload(payload) {
    if (!payload) return null;
    
    const sanitized = { ...payload };
    
    // Remove potentially sensitive fields
    delete sanitized.apiKey;
    delete sanitized.authToken;
    
    // Truncate large fields
    if (sanitized.imageUrl && sanitized.imageUrl.length > 100) {
      sanitized.imageUrl = sanitized.imageUrl.substring(0, 100) + '...';
    }
    
    return sanitized;
  }

  /**
   * Get ingestion statistics
   */
  getIngestionStats() {
    // TODO: Implement log parsing for statistics
    // This would read log files and generate metrics
    return {
      totalIngestions: 0,
      successRate: 0,
      averageProcessingTime: 0,
      activeDevices: 0,
      lastHourIngestions: 0
    };
  }
}

// Export singleton instance
const ingestionLogger = new IngestionLogger();
module.exports = ingestionLogger;