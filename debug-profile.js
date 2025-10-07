const axios = require('axios');

async function debugProfile() {
    const BASE_URL = 'http://localhost:3000';
    
    try {
        // Step 1: Test server connection
        console.log('🔗 Bước 1: Kiểm tra server...');
        await axios.get(`${BASE_URL}/api/profile/test`);
        console.log('✅ Server và profile routes hoạt động');
        
        // Step 2: Test auth endpoint
        console.log('\n🔐 Bước 2: Test auth...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        if (!loginRes.headers['set-cookie']) {
            throw new Error('Không nhận được session cookie');
        }
        
        const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log('✅ Đăng nhập thành công, session cookie:', cookie.substring(0, 30) + '...');
        
        // Step 3: Test profile GET with detailed logging
        console.log('\n📋 Bước 3: Test GET profile với auth...');
        try {
            const profileRes = await axios.get(`${BASE_URL}/api/profile`, {
                headers: { 'Cookie': cookie },
                timeout: 10000
            });
            console.log('✅ GET profile thành công');
            console.log('Response data:', JSON.stringify(profileRes.data, null, 2));
        } catch (profileError) {
            console.error('❌ GET profile failed');
            console.error('Status:', profileError.response?.status);
            console.error('Data:', profileError.response?.data);
            throw profileError;
        }
        
        // Step 4: Test profile UPDATE with detailed logging
        console.log('\n✏️ Bước 4: Test POST profile update...');
        const updateData = {
            fullname: 'Debug Test User',
            phone: '0999888777',
            email: 'debug@test.com',
            bank_account_number: '123456789',
            bank_name: 'Debug Bank'
        };
        
        console.log('Update data:', JSON.stringify(updateData, null, 2));
        
        try {
            const updateRes = await axios.post(`${BASE_URL}/api/profile/update`, updateData, {
                headers: { 
                    'Cookie': cookie,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('✅ POST profile update thành công');
            console.log('Response:', JSON.stringify(updateRes.data, null, 2));
        } catch (updateError) {
            console.error('❌ POST profile update failed');
            console.error('Status:', updateError.response?.status);
            console.error('Headers:', updateError.response?.headers);
            console.error('Data type:', typeof updateError.response?.data);
            
            if (typeof updateError.response?.data === 'string') {
                console.error('String response (first 200 chars):', updateError.response.data.substring(0, 200));
                
                if (updateError.response.data.includes('<!DOCTYPE')) {
                    console.error('🔍 PHÂN TÍCH: Server trả về HTML thay vì JSON');
                    console.error('   → Có thể do:');
                    console.error('     1. Route không đúng (404 error page)');
                    console.error('     2. Server error (500 error page)');
                    console.error('     3. Middleware redirect');
                    console.error('     4. Authentication middleware issue');
                }
            } else {
                console.error('JSON response:', updateError.response?.data);
            }
            
            throw updateError;
        }
        
        console.log('\n🎉 TẤT CẢ BƯỚC ĐỀU THÀNH CÔNG!');
        
    } catch (error) {
        console.error('\n💥 DEBUG FAILED:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔍 Server không chạy - hãy khởi động server trước');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🔍 Không thể resolve hostname');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('🔍 Request timeout - server có thể bị treo');
        }
    }
}

debugProfile();