const mongoose = require('mongoose');
require('dotenv').config();

const LegacyWorkSchedule = require('./src/models/LegacyWorkSchedule');
const User = require('./src/models/User');

async function testWorkSchedule() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stafftime');
        console.log('Connected to MongoDB');

        // Test 1: Create a sample work schedule
        console.log('\n=== Test 1: Create Work Schedule ===');
        
        const admin = await User.findOne({ username: 'admin' });
        if (!admin) {
            console.log('❌ Admin user not found');
            return;
        }

        const testSchedule = new LegacyWorkSchedule({
            date: '2025-10-08',
            job_name: 'Test Job',
            start_time: '09:00',
            location: 'Test Location',
            note: 'Test Note',
            created_by: admin._id
        });

        await testSchedule.save();
        console.log('✅ Created test schedule:', testSchedule.toJSON());

        // Test 2: Get schedules by month
        console.log('\n=== Test 2: Get Schedules by Month ===');
        const schedules = await LegacyWorkSchedule.find({
            date: {
                $gte: '2025-10-01',
                $lte: '2025-10-31'
            }
        });
        console.log(`✅ Found ${schedules.length} schedules in October 2025`);

        // Test 3: Update schedule
        console.log('\n=== Test 3: Update Schedule ===');
        testSchedule.job_name = 'Updated Test Job';
        testSchedule.note = 'Updated Note';
        await testSchedule.save();
        console.log('✅ Updated schedule:', testSchedule.toJSON());

        // Test 4: Register for schedule
        console.log('\n=== Test 4: Register for Schedule ===');
        const employee = await User.findOne({ username: { $ne: 'admin' } });
        if (employee) {
            testSchedule.registrations.push({
                user_id: employee._id,
                user_name: employee.full_name,
                registered_at: new Date()
            });
            await testSchedule.save();
            console.log('✅ Registered employee for schedule');
        }

        // Test 5: Get registrations
        console.log('\n=== Test 5: Get Registrations ===');
        const scheduleWithRegs = await LegacyWorkSchedule.findById(testSchedule._id)
            .populate('registrations.user_id', 'full_name username');
        console.log('✅ Schedule with registrations:', scheduleWithRegs.toJSON());

        // Test 6: Delete schedule
        console.log('\n=== Test 6: Delete Schedule ===');
        await LegacyWorkSchedule.findByIdAndDelete(testSchedule._id);
        console.log('✅ Deleted test schedule');

        await mongoose.disconnect();
        console.log('\n✅ All tests completed successfully!');
        console.log('\n📱 You can now test the frontend at http://localhost:3002');
        console.log('🔐 Login with: admin/admin123');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack:', error.stack);
    }
}

testWorkSchedule();