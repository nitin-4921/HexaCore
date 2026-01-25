# Pothole Dashboard Backend API

A RESTful API for the Smart Pothole Detection & Road Health Rover system with **IoT Data Ingestion** capabilities.

## Quick Start

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3001`

## 🚀 NEW: IoT Data Ingestion

### Ingestion Endpoint
**POST** `/api/iot/pothole` - Ingest pothole data from IoT devices

**Request Body:**
```json
{
  "deviceId": "rover-001",
  "timestamp": "2026-01-24T18:30:00Z",
  "location": {
    "lat": 28.5362,
    "lng": 77.3918,
    "address": "Sector 62, Noida"
  },
  "severity": "high",
  "riskScore": 92,
  "imageUrl": "https://example.com/pothole-image.jpg",
  "metadata": {
    "weather": "clear",
    "resolution": "1920x1080",
    "fileSize": 245760
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Pothole data ingested successfully",
  "data": {
    "potholeId": "pot-iot-1737748200000-abc123def",
    "deviceId": "rover-001",
    "timestamp": "2026-01-24T18:30:00Z",
    "severity": "high",
    "riskScore": 92,
    "city": "Noida",
    "processingTime": "45ms"
  }
}
```

### Monitoring Endpoints
- **GET** `/api/iot/ingestion/stats` - Ingestion statistics and device activity
- **GET** `/api/iot/ingestion/health` - System health check

### Testing IoT Ingestion
```bash
# Run comprehensive tests
node test-iot-ingestion.js

# Simulate continuous ingestion
node test-iot-ingestion.js --continuous --count=20 --interval=1000
```

## API Endpoints

### 🔥 IoT Data Ingestion (NEW)
- `POST /api/iot/pothole` - Ingest pothole data from IoT devices
- `GET /api/iot/ingestion/stats` - Ingestion statistics and monitoring
- `GET /api/iot/ingestion/health` - System health check

### Cities
- `GET /api/cities` - Get all cities with statistics
- `GET /api/cities/:id` - Get specific city details

### Potholes
- `GET /api/potholes` - Get potholes with filtering
  - Query params: `city`, `severity`, `status`, `limit`, `offset`
- `GET /api/potholes/:id` - Get specific pothole details
- `GET /api/potholes/stats/summary` - Get pothole statistics

### Roads
- `GET /api/roads` - Get roads with filtering
  - Query params: `city`, `contractor`, `healthScore`, `limit`, `offset`
- `GET /api/roads/:id` - Get specific road details
- `GET /api/roads/stats/summary` - Get road statistics

### Contractors
- `GET /api/contractors` - Get all contractors with statistics
- `GET /api/contractors/:id` - Get specific contractor details
- `GET /api/contractors/:id/roads` - Get roads built by contractor

### IoT Devices
- `GET /api/iot/devices` - Get IoT devices with filtering
- `GET /api/iot/devices/:id` - Get specific device details
- `GET /api/iot/stats` - Get IoT system statistics

### Health Check
- `GET /api/health` - API health status

## Example Requests

```bash
# Get all cities
curl http://localhost:3001/api/cities

# Get potholes in Noida with high severity
curl "http://localhost:3001/api/potholes?city=Noida&severity=high"

# Get roads needing repair
curl "http://localhost:3001/api/roads?healthScore=<50"

# Get contractor details
curl http://localhost:3001/api/contractors/contractor-001
```

## Data Structure

The API uses realistic dummy data structured for IoT integration:

- **Cities**: Delhi, Noida, Mumbai, Pune, Kanpur
- **Contractors**: Infrastructure companies with ratings and specializations
- **Roads**: Detailed road information with health scores and maintenance history
- **Potholes**: GPS coordinates, severity levels, IoT sensor data
- **IoT Devices**: Rovers and sensors with real-time status

## Future IoT Integration

The data structure is designed to easily integrate with:
- Real IoT sensor streams
- ML prediction models
- Real-time GPS tracking
- Weather condition APIs
- Traffic management systems

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)