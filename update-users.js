const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function updateUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stafftime');
        console.log('Connected to MongoDB');

        // Update all users without salary_config
        const result = await User.updateMany(
            { salary_config: { $exists: false } },
            { 
                $set: { 
                    salary_config: {
                        type: 'parttime',
                        day_shift_rate: 0,
                        night_shift_rate: 0,
                        base_salary: 0,
                        allowance: 0,
                        bonus: 0,
                        show_salary: 0
                    }
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} users with default salary_config`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating users:', error);
    }
}

updateUsers();