const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function testSalaryConfig() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stafftime');
        console.log('Connected to MongoDB');

        // Find all users and show their salary config
        const users = await User.find({}, 'username full_name salary_config hourly_salary');
        
        console.log('\n--- Thông tin cấu hình lương của các users ---');
        users.forEach(user => {
            console.log(`\nUser: ${user.full_name} (${user.username})`);
            console.log(`  hourly_salary: ${user.hourly_salary}`);
            console.log(`  salary_config:`, user.salary_config);
            
            if (user.salary_config) {
                console.log(`    - day_shift_rate: ${user.salary_config.day_shift_rate}`);
                console.log(`    - night_shift_rate: ${user.salary_config.night_shift_rate}`);
                console.log(`    - type: ${user.salary_config.type}`);
            }
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

testSalaryConfig();