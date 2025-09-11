require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const pool = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 ngày
}));

// Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Địa chỉ của React app
    methods: ["GET", "POST"]
  }
});

const connectedUsers = {}; // Lưu trữ socket.id theo user.id

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    connectedUsers[userId] = socket.id;
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
  }

  socket.on('disconnect', () => {
    // Tìm và xóa user khỏi connectedUsers khi họ ngắt kết nối
    for (const [id, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[id];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./api/auth/auth.routes');
const userRoutes = require('./api/users/users.routes')(io, connectedUsers);
const attendanceRoutes = require('./api/attendance/attendance.routes');
const configRoutes = require('./api/config/config.routes');
const salaryRoutes = require('./api/salary/salary.routes');
const profileRoutes = require('./api/profile/profile.routes');
const workScheduleRoutes = require('./api/work-schedule/work-schedule.routes')(io, connectedUsers);
const payrollRoutes = require('./api/payroll/payroll.routes')(io, connectedUsers);
const requestRoutes = require('./api/requests/requests.routes')(io, connectedUsers);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Changed from /api/admin
app.use('/api/attendance', attendanceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/work-schedule', workScheduleRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/requests', requestRoutes);

// Thêm một route để test gửi thông báo
app.post('/api/notify', (req, res) => {
  const { userId, message } = req.body;
  const socketId = connectedUsers[userId];
  if (socketId) {
    io.to(socketId).emit('notification', { message });
    res.status(200).send({ success: true, message: `Đã gửi thông báo đến user ${userId}` });
  } else {
    res.status(404).send({ success: false, message: `User ${userId} không có kết nối.` });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
