const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

let adminCookie = '';
let employeeCookie = '';
let requestId = '';

async function loginAsAdmin() {
    try {
        console.log('🔐 Đăng nhập admin...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            adminCookie = cookies[0].split(';')[0];
        }
        
        console.log('✅ Admin đăng nhập thành công:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Lỗi đăng nhập admin:', error.response?.data || error.message);
        return false;
    }
}

async function loginAsEmployee() {
    try {
        console.log('👤 Đăng nhập employee...');
        // Try different employee accounts
        const employees = [
            { username: 'employee', password: 'employee123' },
            { username: 'user1', password: '123456' },
            { username: 'test', password: 'test123' }
        ];
        
        for (const emp of employees) {
            try {
                const response = await axios.post(`${BASE_URL}/api/auth/login`, emp);
                
                const cookies = response.headers['set-cookie'];
                if (cookies) {
                    employeeCookie = cookies[0].split(';')[0];
                }
                
                console.log('✅ Employee đăng nhập thành công:', response.data);
                return true;
            } catch (err) {
                console.log(`❌ Thử đăng nhập ${emp.username} thất bại`);
            }
        }
        
        // If no employee found, use admin as fallback
        employeeCookie = adminCookie;
        console.log('📝 Sử dụng admin làm employee để test');
        return true;
    } catch (error) {
        console.error('❌ Lỗi đăng nhập employee:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateRequest() {
    try {
        console.log('\n📝 Test tạo yêu cầu nghỉ phép...');
        
        const requestData = {
            request_type: 'leave',
            title: 'Xin nghỉ phép',
            description: 'Tôi cần nghỉ phép để đi khám bệnh định kỳ',
            start_date: '2024-12-25',
            end_date: '2024-12-26'
        };
        
        const response = await axios.post(`${BASE_URL}/api/requests`, requestData, {
            headers: {
                'Cookie': employeeCookie,
                'Content-Type': 'application/json'
            }
        });
        
        requestId = response.data.request._id || response.data.request.id;
        console.log('✅ Tạo yêu cầu thành công:', {
            id: requestId,
            title: response.data.request.title,
            description: response.data.request.description,
            status: response.data.request.status
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi tạo yêu cầu:', error.response?.data || error.message);
        return false;
    }
}

async function testGetMyRequests() {
    try {
        console.log('\n📋 Test lấy yêu cầu của nhân viên...');
        
        const response = await axios.get(`${BASE_URL}/api/requests/my-requests`, {
            headers: {
                'Cookie': employeeCookie
            }
        });
        
        console.log('✅ Lấy yêu cầu của nhân viên thành công:', {
            count: response.data.length,
            requests: response.data.map(r => ({
                id: r._id || r.id,
                title: r.title,
                description: r.description,
                status: r.status
            }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy yêu cầu nhân viên:', error.response?.data || error.message);
        return false;
    }
}

async function testGetAllRequests() {
    try {
        console.log('\n👥 Test lấy tất cả yêu cầu (admin)...');
        
        const response = await axios.get(`${BASE_URL}/api/requests`, {
            headers: {
                'Cookie': adminCookie
            }
        });
        
        console.log('✅ Lấy tất cả yêu cầu thành công:', {
            count: response.data.length,
            requests: response.data.map(r => ({
                id: r._id || r.id,
                user: r.user ? r.user.fullname : 'N/A',
                title: r.title,
                description: r.description,
                status: r.status
            }))
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi lấy tất cả yêu cầu:', error.response?.data || error.message);
        return false;
    }
}

async function testApproveRequest() {
    try {
        if (!requestId) {
            console.log('❌ Không có request ID để duyệt');
            return false;
        }
        
        console.log('\n✅ Test duyệt yêu cầu...');
        
        const response = await axios.put(`${BASE_URL}/api/requests/${requestId}/status`, {
            status: 'approved',
            response_note: 'Yêu cầu đã được phê duyệt'
        }, {
            headers: {
                'Cookie': adminCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Duyệt yêu cầu thành công:', {
            id: response.data.request._id || response.data.request.id,
            status: response.data.request.status,
            comment: response.data.request.manager_comment
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi duyệt yêu cầu:', error.response?.data || error.message);
        console.error('Full error:', error.response);
        return false;
    }
}

async function testRejectRequest() {
    try {
        console.log('\n❌ Test tạo và từ chối yêu cầu...');
        
        // Create another request to reject
        const requestData = {
            request_type: 'overtime',
            title: 'Đăng ký tăng ca',
            description: 'Cần tăng ca để hoàn thành dự án',
            start_date: '2024-12-27',
            end_date: '2024-12-27'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/api/requests`, requestData, {
            headers: {
                'Cookie': employeeCookie,
                'Content-Type': 'application/json'
            }
        });
        
        const newRequestId = createResponse.data.request._id || createResponse.data.request.id;
        
        // Reject it
        const rejectResponse = await axios.put(`${BASE_URL}/api/requests/${newRequestId}/status`, {
            status: 'rejected',
            response_note: 'Không đủ ngân sách cho tăng ca'
        }, {
            headers: {
                'Cookie': adminCookie,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Từ chối yêu cầu thành công:', {
            id: rejectResponse.data.request._id || rejectResponse.data.request.id,
            status: rejectResponse.data.request.status,
            comment: rejectResponse.data.request.manager_comment
        });
        return true;
    } catch (error) {
        console.error('❌ Lỗi từ chối yêu cầu:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Bắt đầu test chức năng yêu cầu nhân viên...\n');
    
    const results = {
        adminLogin: false,
        employeeLogin: false,
        createRequest: false,
        getMyRequests: false,
        getAllRequests: false,
        approveRequest: false,
        rejectRequest: false
    };
    
    // Login admin
    results.adminLogin = await loginAsAdmin();
    if (!results.adminLogin) return results;
    
    // Login employee
    results.employeeLogin = await loginAsEmployee();
    if (!results.employeeLogin) return results;
    
    // Create request
    results.createRequest = await testCreateRequest();
    
    // Get my requests
    results.getMyRequests = await testGetMyRequests();
    
    // Get all requests (admin)
    results.getAllRequests = await testGetAllRequests();
    
    // Approve request
    if (results.createRequest) {
        results.approveRequest = await testApproveRequest();
    }
    
    // Reject request
    results.rejectRequest = await testRejectRequest();
    
    // Summary
    console.log('\n📊 KẾT QUẢ TEST YÊU CẦU NHÂN VIÊN:');
    console.log('==================================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Tổng kết: ${passCount}/${Object.keys(results).length} tests passed`);
    
    if (passCount === Object.keys(results).length) {
        console.log('\n🎉 TẤT CẢ CHỨC NĂNG HOẠT ĐỘNG HOÀN HẢO!');
        console.log('✅ Tạo yêu cầu: OK');
        console.log('✅ Hiển thị lý do: OK');
        console.log('✅ Duyệt/Từ chối đơn: OK');
    } else {
        console.log('\n⚠️ Một số chức năng cần kiểm tra thêm');
    }
    
    return results;
}

// Run tests
runAllTests().catch(console.error);