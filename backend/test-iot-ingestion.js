/**
 * IOT INGESTION TESTING SCRIPT
 * 
 * Test script to simulate IoT device data ingestion
 * for development and testing purposes.
 * 
 * Usage:
 * node test-iot-ingestion.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data samples
const testDevices = ['device-001', 'device-002', 'device-003'];
const testLocations = [
  { lat: 28.5362, lng: 77.3918, address: 'Sector 62, Noida' },
  { lat: 28.5339, lng: 77.3875, address: 'Sector 59, Noida' },
  { lat: 28.5287, lng: 77.3942, address: 'Sector 76, Noida' },
  { lat: 28.5421, lng: 77.3829, address: 'Sector 51, Noida' }
];
const testSeverities = ['low', 'medium', 'high'];
const testImages = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300'
];

/**
 * Generate random test pothole data
 */
function generateTestPothole() {
  const deviceId = testDevices[Math.floor(Math.random() * testDevices.length)];
  const location = testLocations[Math.floor(Math.random() * testLocations.length)];
  const severity = testSeverities[Math.floor(Math.random() * testSeverities.length)];
  const riskScore = severity === 'high' ? Math.floor(Math.random() * 20) + 80 :
                   severity === 'medium' ? Math.floor(Math.random() * 30) + 50 :
                   Math.floor(Math.random() * 40) + 10;

  return {
    deviceId,
    timestamp: new Date().toISOString(),
    location,
    severity,
    riskScore,
    imageUrl: Math.random() > 0.3 ? testImages[Math.floor(Math.random() * testImages.length)] : undefined,
    metadata: {
      weather: ['clear', 'rainy', 'foggy'][Math.floor(Math.random() * 3)],
      resolution: '1920x1080',
      fileSize: Math.floor(Math.random() * 500000) + 100000
    }
  };
}

/**
 * Send test pothole data to ingestion API
 */
async function sendTestPothole(potholeData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/iot/pothole`, potholeData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key-123' // Test API key
      }
    });

    console.log('✅ Ingestion Success:', {
      potholeId: response.data.data.potholeId,
      deviceId: response.data.data.deviceId,
      severity: response.data.data.severity,
      processingTime: response.data.data.processingTime
    });

    return response.data;
  } catch (error) {
    console.error('❌ Ingestion Failed:', {
      deviceId: potholeData.deviceId,
      error: error.response?.data || error.message
    });
    return null;
  }
}

/**
 * Test ingestion statistics endpoint
 */
async function testIngestionStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/iot/ingestion/stats`);
    console.log('📊 Ingestion Stats:', response.data.data);
  } catch (error) {
    console.error('❌ Stats Failed:', error.response?.data || error.message);
  }
}

/**
 * Test system health endpoint
 */
async function testSystemHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/iot/ingestion/health`);
    console.log('🏥 System Health:', response.data.data);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.response?.data || error.message);
  }
}

/**
 * Run comprehensive ingestion tests
 */
async function runTests() {
  console.log('🚀 Starting IoT Ingestion Tests...\n');

  // Test 1: Single pothole ingestion
  console.log('📍 Test 1: Single Pothole Ingestion');
  const testPothole = generateTestPothole();
  console.log('Sending:', testPothole);
  await sendTestPothole(testPothole);
  console.log('');

  // Test 2: Multiple potholes
  console.log('📍 Test 2: Multiple Pothole Ingestion');
  for (let i = 0; i < 3; i++) {
    const pothole = generateTestPothole();
    await sendTestPothole(pothole);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  console.log('');

  // Test 3: Invalid data
  console.log('📍 Test 3: Invalid Data Handling');
  const invalidPothole = {
    deviceId: '', // Invalid: empty
    timestamp: 'invalid-date', // Invalid: not ISO date
    location: { lat: 200, lng: 300 }, // Invalid: out of range
    severity: 'extreme', // Invalid: not in allowed values
    riskScore: 150 // Invalid: out of range
  };
  await sendTestPothole(invalidPothole);
  console.log('');

  // Test 4: Unknown device
  console.log('📍 Test 4: Unknown Device');
  const unknownDevicePothole = {
    ...generateTestPothole(),
    deviceId: 'unknown-device-999'
  };
  await sendTestPothole(unknownDevicePothole);
  console.log('');

  // Test 5: System statistics
  console.log('📍 Test 5: System Statistics');
  await testIngestionStats();
  console.log('');

  // Test 6: Health check
  console.log('📍 Test 6: Health Check');
  await testSystemHealth();
  console.log('');

  console.log('✅ All tests completed!');
}

/**
 * Simulate continuous ingestion (for load testing)
 */
async function simulateContinuousIngestion(count = 10, intervalMs = 2000) {
  console.log(`🔄 Simulating ${count} continuous ingestions (${intervalMs}ms interval)...\n`);

  for (let i = 0; i < count; i++) {
    const pothole = generateTestPothole();
    console.log(`[${i + 1}/${count}] Sending pothole from ${pothole.deviceId}...`);
    await sendTestPothole(pothole);
    
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log('\n📊 Final Statistics:');
  await testIngestionStats();
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--continuous')) {
    const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 10;
    const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 2000;
    simulateContinuousIngestion(count, interval);
  } else {
    runTests();
  }
}

module.exports = {
  generateTestPothole,
  sendTestPothole,
  testIngestionStats,
  testSystemHealth
};