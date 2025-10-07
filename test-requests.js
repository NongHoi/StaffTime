const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

let sessionCookie = '';

async function loginAsEmployee() {
    try {
        console.log('🔐 Đăng nhập nhân viên...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'employee1', // Thử với employee
            password: 'employee123'
        });
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            sessionCookie = cookies[0].split(';')[0];
        }
        
        console.log('✅ Đăng nhập thành công:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Lỗi đăng nhập employee, thử admin:', error.response?.data || error.message);
        
        // Fallback to admin
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                sessionCookie = cookies[0].split(';')[0];
            }
            
            console.log('✅ Đăng nhập admin thành công:', response.data);
            return true;
        } catch (adminError) {
            console.error('❌ Lỗi đăng nhập admin:', adminError.response?.data || adminError.message);
            return false;
        }
    }
}

async function testCreateRequest() {
    try {
        console.log('\n📝 Test tạo yêu cầu nghỉ phép...');
        
        const requestData = {
            request_type: 'leave',
            title: 'Xin nghỉ phép',
            description: 'Tôi muốn xin nghỉ phép để đi khám bệnh',
            start_date: '2024-12-20',
            end_date: '2024-12-21'
        };
        
        const response = await axios.post(`${BASE_URL}/api/requests`, requestData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tạo yêu cầu thành công:', {
            id: response.data.request._id,
            type: response.data.request.request_type,
            title: response.data.request.title,
            status: response.data.request.status
        });
        return response.data.request._id;
    } catch (error) {
        console.error('❌ Lỗi tạo yêu cầu:', error.response?.data || error.message);
        return null;
    }
}

async function testCreateOvertimeRequest() {
    try {
        console.log('\n⏰ Test tạo yêu cầu tăng ca...');
        
        const requestData = {
            request_type: 'overtime',
            title: 'Đăng ký tăng ca',
            description: 'Tôi muốn đăng ký tăng ca để hoàn thành dự án',
            start_date: '2024-12-22T18:00:00Z',
            end_date: '2024-12-22T22:00:00Z'
        };
        
        const response = await axios.post(`${BASE_URL}/api/requests`, requestData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tạo yêu cầu tăng ca thành công:', {
            id: response.data.request._id,
            type: response.data.request.request_type,
            title: response.data.request.title
        });
        return response.data.request._id;
    } catch (error) {
        console.error('❌ Lỗi tạo yêu cầu tăng ca:', error.response?.data || error.message);
        return null;
    }
}

async function testCreateLegacyFormatRequest() {
    try {
        console.log('\n🔄 Test tạo yêu cầu với format cũ...');
        
        const requestData = {
            type: 'schedule_change', // Old format
            reason: 'Xin đổi ca làm việc', // Old format
            start_date: '2024-12-23',
            end_date: '2024-12-23',
            note: 'Tôi có việc cá nhân cần đổi ca'
        };
        
        const response = await axios.post(`${BASE_URL}/api/requests`, requestData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tạo yêu cầu với format cũ thành công:', {
            id: response.data.request._id,
            type: response.data.request.request_type,
            title: response.data.request.title
        });
        return response.data.request._id;
    } catch (error) {
        console.error('❌ Lỗi tạo yêu cầu format cũ:', error.response?.data || error.message);
        return null;
    }
}

async function testGetMyRequests() {
    try {
        console.log('\n📋 Test lấy danh sách yêu cầu của tôi...');
        
        const response = await axios.get(`${BASE_URL}/api/requests/my-requests`, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        
        console.log('✅ Lấy danh sách yêu cầu thành công:', {
            count: response.data.length,
            requests: response.data.map(r => ({
                id: r._id,
                type: r.request_type,
                title: r.title,
                status: r.status
            }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách yêu cầu:', error.response?.data || error.message);
        return false;
    }
}

async function testInvalidRequest() {
    try {
        console.log('\n❗ Test tạo yêu cầu không hợp lệ...');
        
        const invalidData = {
            request_type: 'invalid_type',
            title: 'Test invalid'
        };
        
        const response = await axios.post(`${BASE_URL}/api/requests`, invalidData, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('❌ Không nên tạo được yêu cầu không hợp lệ');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Validation đúng - từ chối yêu cầu không hợp lệ:', error.response.data.message);
            return true;
        } else {
            console.error('❌ Lỗi không mong đợi:', error.response?.data || error.message);
            return false;
        }
    }
}

async function runAllTests() {
    console.log('🚀 Bắt đầu test chức năng tạo yêu cầu...\n');
    
    const results = {
        login: false,
        createLeave: false,
        createOvertime: false,
        createLegacy: false,
        getMyRequests: false,
        validation: false
    };
    
    // Login
    results.login = await loginAsEmployee();
    if (!results.login) {
        console.log('\n❌ Không thể đăng nhập, dừng test');
        return results;
    }
    
    // Test create leave request
    const leaveId = await testCreateRequest();
    results.createLeave = !!leaveId;
    
    // Test create overtime request
    const overtimeId = await testCreateOvertimeRequest();
    results.createOvertime = !!overtimeId;
    
    // Test create with legacy format
    const legacyId = await testCreateLegacyFormatRequest();
    results.createLegacy = !!legacyId;
    
    // Test get my requests
    results.getMyRequests = await testGetMyRequests();
    
    // Test validation
    results.validation = await testInvalidRequest();
    
    // Summary
    console.log('\n📊 KẾT QUẢ TEST YÊU CẦU:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Tổng kết: ${passCount}/${Object.keys(results).length} tests passed`);
    
    return results;
}

// Run tests
runAllTests().catch(console.error);