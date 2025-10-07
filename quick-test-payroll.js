const axios = require('axios');

async function quickPayrollTest() {
    try {
        // Login
        console.log('🔐 Đăng nhập...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log('✅ Đăng nhập thành công');
        
        // Test save payroll directly
        console.log('\n💾 Test lưu bảng lương...');
        const payrollData = {
            user_id: loginRes.data.user.id,
            month: 12,
            year: 2024,
            total_day: 20.5,
            total_night: 5.2,
            day_shift_rate: 50000,
            night_shift_rate: 75000,
            allowance: 500000,
            bonus: 200000,
            total: 2090000
        };
        
        console.log('Dữ liệu gửi:', payrollData);
        
        const saveRes = await axios.post('http://localhost:3000/api/payroll', payrollData, {
            headers: { 
                'Cookie': cookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Lưu bảng lương thành công:', saveRes.data);
        
        // Get saved payrolls
        console.log('\n📋 Lấy bảng lương đã lưu...');
        const getRes = await axios.get(`http://localhost:3000/api/payroll/user/${loginRes.data.user.id}`, {
            headers: { 'Cookie': cookie }
        });
        
        console.log('✅ Lấy bảng lương thành công:', getRes.data.length, 'records');
        getRes.data.forEach(p => {
            console.log(`- Tháng ${p.month}/${p.year}: ${p.total?.toLocaleString()} VND`);
        });
        
        console.log('\n🎉 CHỨC NĂNG BẢNG LƯƠNG HOẠT ĐỘNG TỐT!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
        
        if (error.response?.status === 400) {
            console.error('🔍 Lỗi validation - kiểm tra dữ liệu đầu vào');
        } else if (error.response?.status === 401) {
            console.error('🔍 Lỗi authentication - session có thể hết hạn');
        } else if (error.response?.status === 500) {
            console.error('🔍 Lỗi server internal - kiểm tra database connection');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔍 Server không chạy - chạy: npm start');
        }
    }
}

quickPayrollTest();