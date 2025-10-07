const fetch = require('node-fetch');

async function testSalaryAPI() {
    try {
        // First, get list of users
        console.log('=== Testing Salary API ===');
        
        // Test parttime salary calculation
        const response = await fetch('http://localhost:3000/api/salary/parttime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: '68e4f4b43e55c538fb62f109', // NV Partime
                month: 10,
                year: 2025,
                allowance: 0,
                bonus: 0
            })
        });

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.day_shift_rate && result.night_shift_rate) {
            console.log(`\nLương được tính:`);
            console.log(`- Giá giờ ngày: ${result.day_shift_rate}`);
            console.log(`- Giá giờ đêm: ${result.night_shift_rate}`);
            console.log(`- Tổng giờ ngày: ${result.totalDay}`);
            console.log(`- Tổng giờ đêm: ${result.totalNight}`);
            
            if (result.night_shift_rate === 60000 && result.day_shift_rate === 40000) {
                console.log('\n❌ LỖI: Lương đêm đang được tính 60000 (1.5x day rate) thay vì 50000 như cấu hình!');
            } else if (result.night_shift_rate === 50000) {
                console.log('\n✅ OK: Lương đêm đúng theo cấu hình 50000');
            } else {
                console.log(`\n❓ UNKNOWN: Lương đêm là ${result.night_shift_rate}, không rõ nguyên nhân`);
            }
        }

    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testSalaryAPI();