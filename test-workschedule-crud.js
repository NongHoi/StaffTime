const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testSchedule = {
    date: '2024-12-25',
    job_name: 'Test Job CRUD',
    start_time: '08:00',
    location: 'Test Location',
    note: 'Test note for CRUD'
};

let sessionCookie = '';
let scheduleId = '';

async function loginAsAdmin() {
    try {
        console.log('🔐 Đăng nhập với admin...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        // Get session cookie
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

async function testCreateSchedule() {
    try {
        console.log('\n📝 Test tạo lịch làm...');
        const response = await axios.post(`${BASE_URL}/api/work-schedule`, testSchedule, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        scheduleId = response.data._id || response.data.id;
        console.log('✅ Tạo lịch thành công:', {
            id: scheduleId,
            job_name: response.data.job_name,
            date: response.data.date
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi tạo lịch:', error.response?.data || error.message);
        return false;
    }
}

async function testGetMonthSchedules() {
    try {
        console.log('\n📅 Test lấy lịch theo tháng...');
        const response = await axios.get(`${BASE_URL}/api/work-schedule/month?year=2024&month=12`, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Lấy lịch thành công:', {
            count: response.data.length,
            schedules: response.data.map(s => ({ id: s._id || s.id, job_name: s.job_name, date: s.date }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy lịch:', error.response?.data || error.message);
        return false;
    }
}

async function testUpdateSchedule() {
    try {
        if (!scheduleId) {
            console.log('❌ Không có schedule ID để update');
            return false;
        }
        
        console.log('\n✏️ Test cập nhật lịch làm...');
        const updateData = {
            job_name: 'Updated Test Job',
            location: 'Updated Location',
            note: 'Updated note'
        };
        
        const response = await axios.put(`${BASE_URL}/api/work-schedule/${scheduleId}`, updateData, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Cập nhật lịch thành công:', {
            id: response.data._id || response.data.id,
            job_name: response.data.job_name,
            location: response.data.location
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi cập nhật lịch:', error.response?.data || error.message);
        return false;
    }
}

async function testRegisterSchedule() {
    try {
        if (!scheduleId) {
            console.log('❌ Không có schedule ID để đăng ký');
            return false;
        }
        
        console.log('\n👥 Test đăng ký lịch làm...');
        const response = await axios.post(`${BASE_URL}/api/work-schedule/register`, {
            schedule_id: scheduleId
        }, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Đăng ký lịch thành công:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Lỗi đăng ký lịch:', error.response?.data || error.message);
        return false;
    }
}

async function testGetRegistrations() {
    try {
        if (!scheduleId) {
            console.log('❌ Không có schedule ID để lấy danh sách đăng ký');
            return false;
        }
        
        console.log('\n👥 Test lấy danh sách đăng ký...');
        const response = await axios.get(`${BASE_URL}/api/work-schedule/${scheduleId}/registrations`, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Lấy danh sách đăng ký thành công:', {
            count: response.data.length,
            users: response.data
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách đăng ký:', error.response?.data || error.message);
        return false;
    }
}

async function testDeleteSchedule() {
    try {
        if (!scheduleId) {
            console.log('❌ Không có schedule ID để xóa');
            return false;
        }
        
        console.log('\n🗑️ Test xóa lịch làm...');
        const response = await axios.delete(`${BASE_URL}/api/work-schedule/${scheduleId}`, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Xóa lịch thành công:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Lỗi xóa lịch:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Bắt đầu test CRUD Work Schedule...\n');
    
    const results = {
        login: false,
        create: false,
        getMonth: false,
        update: false,
        register: false,
        getRegistrations: false,
        delete: false
    };
    
    // Login
    results.login = await loginAsAdmin();
    if (!results.login) return results;
    
    // Create
    results.create = await testCreateSchedule();
    
    // Get month schedules  
    results.getMonth = await testGetMonthSchedules();
    
    // Update
    if (results.create) {
        results.update = await testUpdateSchedule();
    }
    
    // Register
    if (results.create) {
        results.register = await testRegisterSchedule();
    }
    
    // Get registrations
    if (results.register) {
        results.getRegistrations = await testGetRegistrations();
    }
    
    // Delete
    if (results.create) {
        results.delete = await testDeleteSchedule();
    }
    
    // Summary
    console.log('\n📊 KẾT QUẢ TEST:');
    console.log('====================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Tổng kết: ${passCount}/${Object.keys(results).length} tests passed`);
    
    return results;
}

// Run tests
runAllTests().catch(console.error);