const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Test dashboard stats API
async function testDashboardStats() {
  try {
    console.log('🔍 Testing Dashboard Stats API...');
    
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
      withCredentials: true,
      timeout: 10000
    });

    console.log('✅ Dashboard Stats Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error.response?.data || error.message);
  }
}

// Test dashboard activities API
async function testDashboardActivities() {
  try {
    console.log('\n🔍 Testing Dashboard Activities API...');
    
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/activities`, {
      withCredentials: true,
      timeout: 10000
    });

    console.log('✅ Dashboard Activities Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Dashboard Activities Error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Dashboard API Tests...\n');
  
  await testDashboardStats();
  await testDashboardActivities();
  
  console.log('\n✨ Dashboard API Tests Complete!');
  process.exit(0);
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n👋 Tests interrupted by user');
  process.exit(0);
});

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});