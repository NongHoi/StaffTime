const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';
let testUserId = '';

async function loginAsAdmin() {
    try {
        console.log('🔐 Đăng nhập admin...');
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

async function testCalculateSalary() {
    try {
        // First, get users to find a test user
        console.log('\n👥 Lấy danh sách users...');
        const usersRes = await axios.get(`${BASE_URL}/api/users`, {
            headers: { 'Cookie': sessionCookie }
        });
        
        if (usersRes.data.length === 0) {
            console.log('❌ Không có user nào để test');
            return null;
        }
        
        testUserId = usersRes.data[0].id;
        console.log('✅ Sử dụng user:', usersRes.data[0].fullname || usersRes.data[0].username);
        
        // Calculate salary
        console.log('\n🧮 Tính lương parttime...');
        const salaryRes = await axios.post(`${BASE_URL}/api/salary/parttime`, {
            user_id: testUserId,
            month: 12,
            year: 2024,
            allowance: 500000,
            bonus: 200000
        }, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tính lương thành công:', {
            totalDay: salaryRes.data.totalDay,
            totalNight: salaryRes.data.totalNight,
            total: salaryRes.data.total
        });
        
        return salaryRes.data;
    } catch (error) {
        console.error('❌ Lỗi tính lương:', error.response?.data || error.message);
        return null;
    }
}

async function testSavePayroll(salaryData) {
    try {
        if (!salaryData) {
            console.log('❌ Không có dữ liệu lương để lưu');
            return false;
        }
        
        console.log('\n💾 Test lưu bảng lương...');
        
        const payrollData = {
            user_id: testUserId,
            month: 12,
            year: 2024,
            total_day: salaryData.totalDay || 0,
            total_night: salaryData.totalNight || 0,
            day_shift_rate: salaryData.day_shift_rate || 0,
            night_shift_rate: salaryData.night_shift_rate || 0,
            allowance: salaryData.allowance || 0,
            bonus: salaryData.bonus || 0,
            total: salaryData.total || 0
        };
        
        console.log('Dữ liệu lưu bảng lương:', payrollData);
        
        const response = await axios.post(`${BASE_URL}/api/payroll`, payrollData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Lưu bảng lương thành công:', response.data.message);
        console.log('Payroll ID:', response.data.payroll._id);
        return response.data.payroll._id;
    } catch (error) {
        console.error('❌ Lỗi lưu bảng lương:', error.response?.data || error.message);
        
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
            console.error('🔍 Server trả về HTML thay vì JSON');
        }
        
        return false;
    }
}

async function testGetUserPayrolls() {
    try {
        console.log('\n📋 Test lấy bảng lương của user...');
        
        const response = await axios.get(`${BASE_URL}/api/payroll/user/${testUserId}`, {
            headers: { 'Cookie': sessionCookie }
        });
        
        console.log('✅ Lấy bảng lương thành công:', {
            count: response.data.length,
            payrolls: response.data.map(p => ({
                id: p._id,
                month: p.month,
                year: p.year,
                total: p.total
            }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy bảng lương:', error.response?.data || error.message);
        return false;
    }
}

async function testGetAllPayrolls() {
    try {
        console.log('\n📊 Test lấy tất cả bảng lương...');
        
        const response = await axios.get(`${BASE_URL}/api/payroll`, {
            headers: { 'Cookie': sessionCookie }
        });
        
        console.log('✅ Lấy tất cả bảng lương thành công:', {
            count: response.data.length,
            payrolls: response.data.slice(0, 3).map(p => ({
                id: p._id,
                user: p.user ? p.user.fullname : 'N/A',
                month: p.month,
                year: p.year,
                total: p.total
            }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy tất cả bảng lương:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Bắt đầu test chức năng bảng lương...\n');
    
    const results = {
        login: false,
        calculateSalary: false,
        savePayroll: false,
        getUserPayrolls: false,
        getAllPayrolls: false
    };
    
    // Login
    results.login = await loginAsAdmin();
    if (!results.login) return results;
    
    // Calculate salary
    const salaryData = await testCalculateSalary();
    results.calculateSalary = !!salaryData;
    
    // Save payroll
    if (results.calculateSalary) {
        const payrollId = await testSavePayroll(salaryData);
        results.savePayroll = !!payrollId;
    }
    
    // Get user payrolls
    results.getUserPayrolls = await testGetUserPayrolls();
    
    // Get all payrolls
    results.getAllPayrolls = await testGetAllPayrolls();
    
    // Summary
    console.log('\n📊 KẾT QUẢ TEST BẢNG LƯƠNG:');
    console.log('============================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Tổng kết: ${passCount}/${Object.keys(results).length} tests passed`);
    
    if (passCount === Object.keys(results).length) {
        console.log('\n🎉 TẤT CẢ CHỨC NĂNG BẢNG LƯƠNG HOẠT ĐỘNG HOÀN HẢO!');
    } else {
        console.log('\n⚠️ Cần kiểm tra và sửa lỗi bảng lương');
    }
    
    return results;
}

// Run tests
runAllTests().catch(console.error);