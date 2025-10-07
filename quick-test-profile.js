const axios = require('axios');

async function quickProfileTest() {
    try {
        // Login
        console.log('🔐 Đăng nhập...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log('✅ Đăng nhập thành công');
        
        // Get profile
        console.log('\n📋 Lấy thông tin profile...');
        const getRes = await axios.get('http://localhost:3000/api/profile', {
            headers: { 'Cookie': cookie }
        });
        
        console.log('✅ Lấy profile thành công:', {
            fullname: getRes.data.fullname || getRes.data.full_name,
            email: getRes.data.email,
            phone: getRes.data.phone
        });
        
        // Update profile
        console.log('\n✏️ Cập nhật profile...');
        const updateRes = await axios.post('http://localhost:3000/api/profile/update', {
            fullname: 'Admin Test Updated',
            phone: '0123456789',
            email: 'admin.test@gmail.com',
            bank_account_number: '9876543210',
            bank_name: 'Test Bank'
        }, {
            headers: { 
                'Cookie': cookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Cập nhật thành công:', updateRes.data.message);
        console.log('🎉 PROFILE API HOẠT ĐỘNG TỐT!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
        
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
            console.error('🔍 Server trả về HTML thay vì JSON - có thể:');
            console.error('   1. Server chưa khởi động');
            console.error('   2. Route không tồn tại'); 
            console.error('   3. Lỗi server internal');
            console.error('   4. Middleware authentication có vấn đề');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔍 Không thể kết nối server - chạy: npm start');
        }
    }
}

quickProfileTest();