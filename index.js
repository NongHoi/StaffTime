require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const pool = require('./src/config/db');

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 ngày
}));


// Routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const attendanceRoutes = require('./src/routes/attendance');
const configRoutes = require('./src/routes/config');
const salaryRoutes = require('./src/routes/salary');

const profileRoutes = require('./src/routes/profile');
const workScheduleRoutes = require('./src/routes/workSchedule');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/work-schedule', workScheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
