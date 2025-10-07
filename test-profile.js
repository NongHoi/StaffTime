const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';

async function loginTest() {
    try {
        console.log('🔐 Đăng nhập để test profile...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            sessionCookie = cookies[0].split(';')[0];
        }
        
        console.log('✅ Đăng nhập thành công:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Lỗi đăng nhập:', error.response?.data || error.message);
        return false;
    }
}

async function testGetProfile() {
    try {
        console.log('\n📋 Test lấy thông tin profile...');
        const response = await axios.get(`${BASE_URL}/api/profile`, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Lấy profile thành công:', {
            id: response.data.id || response.data._id,
            fullname: response.data.fullname || response.data.full_name,
            email: response.data.email,
            phone: response.data.phone
        });
        return response.data;
    } catch (error) {
        console.error('❌ Lỗi lấy profile:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error('   → Lỗi authentication, session có thể hết hạn');
        }
        return null;
    }
}

async function testUpdateProfile() {
    try {
        console.log('\n✏️ Test cập nhật profile...');
        
        const updateData = {
            fullname: 'Test User Updated',
            phone: '0987654321',
            email: 'test.updated@gmail.com',
            bank_account_number: '1234567890',
            bank_name: 'Test Bank Updated'
        };
        
        const response = await axios.post(`${BASE_URL}/api/profile/update`, updateData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Cập nhật profile thành công:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Lỗi cập nhật profile:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.error('   → Lỗi authentication');
        } else if (error.response?.status === 404) {
            console.error('   → Không tìm thấy user');
        } else if (error.response?.status === 500) {
            console.error('   → Lỗi server internal');
        }
        
        // Log raw response if it's HTML (like the error you're seeing)
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
            console.error('   → Server trả về HTML thay vì JSON - có thể lỗi routing hoặc server crash');
        }
        
        return false;
    }
}

async function testProfileWorkflow() {
    console.log('🚀 Bắt đầu test Profile API...\n');
    
    const results = {
        login: false,
        getProfile: false,
        updateProfile: false
    };
    
    // Login
    results.login = await loginTest();
    if (!results.login) {
        console.log('\n❌ Không thể đăng nhập, dừng test');
        return results;
    }
    
    // Get profile
    const profileData = await testGetProfile();
    results.getProfile = !!profileData;
    
    // Update profile
    if (results.getProfile) {
        results.updateProfile = await testUpdateProfile();
    }
    
    // Verify update by getting profile again
    if (results.updateProfile) {
        console.log('\n🔄 Xác nhận cập nhật...');
        const updatedProfile = await testGetProfile();
        if (updatedProfile && updatedProfile.fullname === 'Test User Updated') {
            console.log('✅ Xác nhận cập nhật thành công');
        } else {
            console.log('⚠️ Dữ liệu có thể chưa được cập nhật đúng');
        }
    }
    
    // Summary
    console.log('\n📊 KẾT QUẢ TEST PROFILE:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Tổng kết: ${passCount}/${Object.keys(results).length} tests passed`);
    
    if (passCount === Object.keys(results).length) {
        console.log('\n🎉 PROFILE API HOẠT ĐỘNG HOÀN HẢO!');
    } else {
        console.log('\n⚠️ Cần kiểm tra và sửa lỗi Profile API');
    }
    
    return results;
}

// Test server connection first
async function testServerConnection() {
    try {
        console.log('🔗 Kiểm tra kết nối server...');
        const response = await axios.get(`${BASE_URL}/api/auth/check`, {
            timeout: 5000
        });
        console.log('✅ Server đang hoạt động');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Không thể kết nối server - server có thể chưa khởi động');
            console.error('   → Vui lòng chạy: npm start');
        } else {
            console.error('❌ Lỗi kết nối:', error.message);
        }
        return false;
    }
}

// Run tests
async function runTests() {
    const serverOk = await testServerConnection();
    if (serverOk) {
        await testProfileWorkflow();
    }
}

runTests().catch(console.error);