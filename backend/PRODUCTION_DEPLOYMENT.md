# IoT Ingestion - Production Deployment Guide

## 🚀 Production Readiness Checklist

### 1. Security Configuration

#### API Key Authentication
```javascript
// Enable in production
process.env.REQUIRE_API_KEY = 'true'
process.env.API_KEY_SECRET = 'your-secret-key'
```

#### Rate Limiting
```javascript
// Configure Redis-based rate limiting
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.RATE_LIMIT_REQUESTS = '1000' // per hour per device
```

#### HTTPS Only
```javascript
// Force HTTPS in production
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 2. Database Configuration

#### Replace In-Memory Storage
```javascript
// Replace arrays with database
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Example: Store pothole in PostgreSQL
async function storePothole(potholeData) {
  const query = `
    INSERT INTO potholes (id, device_id, location, severity, risk_score, detected_time, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  await pool.query(query, [
    potholeData.id,
    potholeData.sensorId,
    JSON.stringify(potholeData.location),
    potholeData.severity,
    potholeData.riskScore,
    potholeData.detectedTime,
    potholeData.imageUrl
  ]);
}
```

### 3. Monitoring & Logging

#### Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Health Monitoring
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected', // Check DB connection
    redis: 'connected'     // Check Redis connection
  });
});
```

### 4. Performance Optimization

#### Connection Pooling
```javascript
// Database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Caching
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache device information
async function getDevice(deviceId) {
  const cached = await client.get(`device:${deviceId}`);
  if (cached) return JSON.parse(cached);
  
  const device = await db.getDevice(deviceId);
  await client.setex(`device:${deviceId}`, 300, JSON.stringify(device));
  return device;
}
```

### 5. Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/potholes
REDIS_URL=redis://localhost:6379
API_KEY_SECRET=your-super-secret-key
REQUIRE_API_KEY=true
LOG_LEVEL=info
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600000
```

### 6. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/potholes
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: potholes
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    
volumes:
  postgres_data:
```

### 7. Load Balancing

```nginx
# nginx.conf
upstream api_servers {
    server api1:3001;
    server api2:3001;
    server api3:3001;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 8. Monitoring Dashboard

```javascript
// Add Prometheus metrics
const prometheus = require('prom-client');

const ingestionsTotal = new prometheus.Counter({
  name: 'iot_ingestions_total',
  help: 'Total number of IoT ingestions',
  labelNames: ['device_id', 'severity', 'status']
});

const ingestionDuration = new prometheus.Histogram({
  name: 'iot_ingestion_duration_seconds',
  help: 'Duration of IoT ingestion processing'
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### 9. Backup & Recovery

```bash
# Database backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### 10. Deployment Commands

```bash
# Production deployment
npm run build
npm run test
docker build -t pothole-api .
docker push your-registry/pothole-api:latest

# Deploy with zero downtime
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/pothole-api
```

## 🔒 Security Best Practices

1. **API Key Management**: Use environment variables, rotate keys regularly
2. **Input Validation**: Validate all IoT payloads, sanitize data
3. **Rate Limiting**: Prevent abuse, monitor unusual patterns
4. **Logging**: Log all ingestion attempts, monitor for anomalies
5. **HTTPS Only**: Encrypt all data in transit
6. **Database Security**: Use connection pooling, prepared statements
7. **Monitoring**: Set up alerts for failed ingestions, high error rates

## 📊 Monitoring Metrics

- **Ingestion Rate**: Potholes per minute/hour
- **Device Activity**: Active devices, last ping times
- **Error Rates**: Failed ingestions, validation errors
- **Response Times**: API latency, database query times
- **System Health**: Memory usage, CPU, disk space

## 🚨 Alerting Rules

```yaml
# Prometheus alerting rules
groups:
- name: iot_ingestion
  rules:
  - alert: HighIngestionFailureRate
    expr: rate(iot_ingestions_total{status="error"}[5m]) > 0.1
    for: 2m
    annotations:
      summary: "High IoT ingestion failure rate"
  
  - alert: NoRecentIngestions
    expr: increase(iot_ingestions_total[10m]) == 0
    for: 5m
    annotations:
      summary: "No IoT ingestions in the last 10 minutes"
```

This production setup ensures your IoT ingestion system is secure, scalable, and monitored for a real smart city deployment.