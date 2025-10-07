require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");

// Connect to MongoDB
connectDB();

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

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
    methods: ["GET", "POST"],
    credentials: true
  }
});

const connectedUsers = {}; // Lưu trữ socket.id theo user.id

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    connectedUsers[userId] = socket.id;
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    
    // Emit user online event to all clients
    io.emit('user_online', { 
      userId, 
      onlineCount: Object.keys(connectedUsers).length 
    });
    
    // Send online users count update to dashboard
    io.emit('dashboard_update', { 
      onlineUsers: Object.keys(connectedUsers).length 
    });
  }

  socket.on('disconnect', () => {
    // Tìm và xóa user khỏi connectedUsers khi họ ngắt kết nối
    for (const [id, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[id];
        console.log(`User disconnected: ${id}`);
        
        // Emit user offline event to all clients
        io.emit('user_offline', { 
          userId: id, 
          onlineCount: Object.keys(connectedUsers).length 
        });
        
        // Send online users count update to dashboard
        io.emit('dashboard_update', { 
          onlineUsers: Object.keys(connectedUsers).length 
        });
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./api/auth/auth.routes');
const userRoutes = require('./api/users/users.routes')(io, connectedUsers);
const reportRoutes = require('./api/reports/reports.routes')();
const attendanceRoutes = require('./api/attendance/attendance.mongo.routes')(io, connectedUsers);
const profileRoutes = require('./api/profile/profile.mongo.routes')(io, connectedUsers);

// MongoDB-based routes
const salaryRoutes = require('./api/salary/salary.mongo.routes')(io, connectedUsers);
const payrollRoutes = require('./api/payroll/payroll.mongo.routes')(io, connectedUsers);
const workScheduleRoutes = require('./api/work-schedule/work-schedule.mongo.routes')(io, connectedUsers);
const requestRoutes = require('./api/requests/requests.mongo.routes')(io, connectedUsers);
const configRoutes = require('./api/config/config.mongo.routes')(io, connectedUsers);
const dashboardRoutes = require('./routes/dashboard.mongo.routes');

// Make connectedUsers available to all routes
app.locals.connectedUsers = connectedUsers;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/work-schedule', workScheduleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/config', configRoutes);
app.use('/', dashboardRoutes);

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
  console.log(`MongoDB connected successfully`);
  console.log(`StaffTime API ready!`);
});
