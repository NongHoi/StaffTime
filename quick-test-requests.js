const axios = require('axios');

async function quickTest() {
    try {
        // Login admin
        console.log('🔐 Đăng nhập admin...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log('✅ Đăng nhập thành công');
        
        // Create request
        console.log('\n📝 Tạo yêu cầu...');
        const createRes = await axios.post('http://localhost:3000/api/requests', {
            request_type: 'leave',
            title: 'Test yêu cầu',
            description: 'Đây là lý do test',
            start_date: '2024-12-25',
            end_date: '2024-12-26'
        }, {
            headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
        });
        
        const requestId = createRes.data.request._id;
        console.log('✅ Tạo yêu cầu thành công:', {
            id: requestId,
            title: createRes.data.request.title,
            description: createRes.data.request.description
        });
        
        // Get all requests
        console.log('\n📋 Lấy danh sách yêu cầu...');
        const getRes = await axios.get('http://localhost:3000/api/requests', {
            headers: { 'Cookie': cookie }
        });
        
        console.log('✅ Lấy danh sách thành công:', getRes.data.length, 'yêu cầu');
        getRes.data.forEach(req => {
            console.log(`- ${req.title}: "${req.description}" (${req.status})`);
        });
        
        // Approve request
        console.log('\n✅ Duyệt yêu cầu...');
        const approveRes = await axios.put(`http://localhost:3000/api/requests/${requestId}/status`, {
            status: 'approved',
            response_note: 'Đã duyệt test'
        }, {
            headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Duyệt thành công:', approveRes.data.message);
        console.log('🎉 TẤT CẢ CHỨC NĂNG HOẠT ĐỘNG TỐT!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

quickTest();