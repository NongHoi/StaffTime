const cron = require('node-cron');
const WorkSchedule = require('../models/WorkSchedule');
const User = require('../models/User');

module.exports = (io, connectedUsers) => {
    console.log('Scheduler for reminders initialized.');

    const sendReminder = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', {
                title: 'Nhắc nhở lịch làm',
                message: message,
                type: 'info'
            });
            console.log(`Sent reminder to user ${userId}`);
        } else {
            console.log(`User ${userId} not connected, cannot send reminder.`);
        }
    };

    // Schedule a task to run every day at 7:00 AM
    // This will check for work schedules for the *next* day
    cron.schedule('0 7 * * *', async () => {
        console.log('Running daily work schedule reminder check...');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
        const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

        try {
            const schedules = await WorkSchedule.find({
                date: {
                    $gte: startOfTomorrow,
                    $lte: endOfTomorrow
                }
            }).populate('user_id', 'full_name');

            if (schedules.length === 0) {
                console.log('No schedules for tomorrow found.');
                return;
            }

            console.log(`Found ${schedules.length} schedules for tomorrow. Sending reminders...`);

            schedules.forEach(schedule => {
                if (schedule.user_id && schedule.user_id._id) {
                    const userId = schedule.user_id._id.toString();
                    const userName = schedule.user_id.full_name;
                    const shift = schedule.shift_type; // e.g., 'morning', 'afternoon'
                    const startTime = schedule.start_time;
                    const endTime = schedule.end_time;

                    const message = `Bạn có lịch làm vào ngày mai, ca ${shift} (${startTime} - ${endTime}). Đừng quên nhé!`;
                    
                    sendReminder(userId, message);
                }
            });

        } catch (error) {
            console.error('Error checking for schedule reminders:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
};
