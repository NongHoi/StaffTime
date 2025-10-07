const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');
const WorkSchedule = require('../models/WorkSchedule');
const Attendance = require('../models/Attendance');

// Get dashboard statistics
router.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total employees count
    const totalEmployees = await User.countDocuments({ role: { $gte: 2 } });

    // Get today's attendance
    const todayAttendance = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get pending requests
    const pendingRequests = await Request.countDocuments({
      status: 'pending'
    });

    // Get today's work hours (calculate from attendance)
    const todayAttendanceRecords = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const todayHours = todayAttendanceRecords.reduce((total, record) => {
      if (record.check_out && record.check_in) {
        const hours = (new Date(record.check_out) - new Date(record.check_in)) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    // Get online users count (simulation - in real app, track active sessions)
    const onlineUsers = Math.floor(totalEmployees * 0.6); // 60% online rate simulation

    // Get today's work schedules
    const todayWorkSchedules = await WorkSchedule.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const stats = {
      totalEmployees,
      todayAttendance,
      pendingRequests,
      todayHours: todayHours / Math.max(todayAttendance, 1), // Average hours per person
      onlineUsers,
      todayWorkSchedules
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Lỗi khi tải thống kê dashboard',
      details: error.message 
    });
  }
});

// Get recent activities
router.get('/api/dashboard/activities', async (req, res) => {
  try {
    const activities = [];

    // Get recent attendance records
    const recentAttendance = await Attendance.find()
      .populate('user_id', 'full_name username')
      .sort({ date: -1 })
      .limit(5);

    recentAttendance.forEach(record => {
      const timeAgo = getTimeAgo(record.date);
      activities.push({
        id: `attendance_${record._id}`,
        message: `${record.user_id?.full_name || record.user_id?.username} đã chấm công`,
        time: timeAgo,
        icon: 'bi-person-check',
        color: 'success',
        timestamp: record.date
      });
    });

    // Get recent requests
    const recentRequests = await Request.find()
      .populate('user_id', 'full_name username')
      .sort({ createdAt: -1 })
      .limit(5);

    recentRequests.forEach(request => {
      const timeAgo = getTimeAgo(request.createdAt);
      const color = request.status === 'approved' ? 'success' : 
                   request.status === 'rejected' ? 'danger' : 'warning';
      const icon = request.status === 'approved' ? 'bi-check-circle' : 
                  request.status === 'rejected' ? 'bi-x-circle' : 'bi-clock';
      
      activities.push({
        id: `request_${request._id}`,
        message: `${request.user_id?.full_name || request.user_id?.username} ${getRequestMessage(request)}`,
        time: timeAgo,
        icon,
        color,
        timestamp: request.createdAt
      });
    });

    // Get recent work schedules
    const recentSchedules = await WorkSchedule.find()
      .populate('user_id', 'full_name username')
      .sort({ createdAt: -1 })
      .limit(3);

    recentSchedules.forEach(schedule => {
      const timeAgo = getTimeAgo(schedule.createdAt);
      activities.push({
        id: `schedule_${schedule._id}`,
        message: `Lịch làm việc mới cho ${schedule.user_id?.full_name || schedule.user_id?.username}`,
        time: timeAgo,
        icon: 'bi-calendar-plus',
        color: 'primary',
        timestamp: schedule.createdAt
      });
    });

    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10)); // Return top 10 most recent
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ 
      error: 'Lỗi khi tải hoạt động dashboard',
      details: error.message 
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Vừa xong';
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else {
    return `${days} ngày trước`;
  }
}

// Helper function to get request message
function getRequestMessage(request) {
  switch (request.status) {
    case 'approved':
      return `đã được duyệt yêu cầu ${request.request_type}`;
    case 'rejected':
      return `bị từ chối yêu cầu ${request.request_type}`;
    default:
      return `gửi yêu cầu ${request.request_type}`;
  }
}

module.exports = router;