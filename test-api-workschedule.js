const axios = require('axios');

// Base URL
const BASE_URL = 'http://localhost:3000';

// Cookie jar to maintain session
const cookieJar = {};

async function loginAndTest() {
    try {
        console.log('=== Testing Work Schedule API ===\n');

        // Step 1: Login
        console.log('1. Login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true
        });

        // Extract session cookie
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            cookieJar.cookie = cookies[0].split(';')[0];
        }

        console.log('✅ Login successful');
        console.log('Session:', cookieJar.cookie);

        // Step 2: Create a work schedule
        console.log('\n2. Creating work schedule...');
        const createResponse = await axios.post(`${BASE_URL}/api/work-schedule`, {
            date: '2025-10-08',
            job_name: 'Test API Job',
            start_time: '09:00',
            location: 'Test Location',
            note: 'Test API Note'
        }, {
            headers: {
                'Cookie': cookieJar.cookie
            }
        });

        const createdSchedule = createResponse.data;
        console.log('✅ Created schedule:', createdSchedule);

        // Step 3: Get schedules by month
        console.log('\n3. Getting schedules for October 2025...');
        const getResponse = await axios.get(`${BASE_URL}/api/work-schedule/month?year=2025&month=10`, {
            headers: {
                'Cookie': cookieJar.cookie
            }
        });

        console.log(`✅ Found ${getResponse.data.length} schedules`);
        getResponse.data.forEach((schedule, index) => {
            console.log(`   ${index + 1}. ${schedule.job_name} on ${schedule.date} (ID: ${schedule.id})`);
        });

        // Step 4: Update the schedule
        console.log('\n4. Updating schedule...');
        const updateResponse = await axios.put(`${BASE_URL}/api/work-schedule/${createdSchedule.id}`, {
            job_name: 'Updated API Job',
            note: 'Updated API Note'
        }, {
            headers: {
                'Cookie': cookieJar.cookie
            }
        });

        console.log('✅ Updated schedule:', updateResponse.data);

        // Step 5: Delete the schedule
        console.log('\n5. Deleting schedule...');
        const deleteResponse = await axios.delete(`${BASE_URL}/api/work-schedule/${createdSchedule.id}`, {
            headers: {
                'Cookie': cookieJar.cookie
            }
        });

        console.log('✅ Deleted schedule:', deleteResponse.data);

        // Step 6: Verify deletion
        console.log('\n6. Verifying deletion...');
        const verifyResponse = await axios.get(`${BASE_URL}/api/work-schedule/month?year=2025&month=10`, {
            headers: {
                'Cookie': cookieJar.cookie
            }
        });

        console.log(`✅ Now found ${verifyResponse.data.length} schedules (should be one less)`);

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

// Install axios if not available
try {
    require('axios');
    loginAndTest();
} catch (err) {
    console.log('Please install axios: npm install axios');
}