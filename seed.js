const mongoose = require('mongoose');
const User = require('./src/models/User');
const WorkSchedule = require('./src/models/WorkSchedule');
const Payroll = require('./src/models/Payroll');
const Request = require('./src/models/Request');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stafftime_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await WorkSchedule.deleteMany({});
    await Payroll.deleteMany({});
    await Request.deleteMany({});

    console.log('Đã xóa dữ liệu cũ');

    // Tạo users mẫu
    const users = await User.create([
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Quản trị viên',
        email: 'admin@stafftime.com',
        phone: '0123456789',
        role_id: 1,
        hourly_salary: 100000
      },
      {
        username: 'manager',
        password: 'manager123',
        full_name: 'Trưởng phòng',
        email: 'manager@stafftime.com',
        phone: '0123456788',
        role_id: 2,
        hourly_salary: 80000
      },
      {
        username: 'employee1',
        password: 'emp123',
        full_name: 'Nhân viên 1',
        email: 'emp1@stafftime.com',
        phone: '0123456787',
        role_id: 3,
        hourly_salary: 50000
      },
      {
        username: 'employee2',
        password: 'emp123',
        full_name: 'Nhân viên 2',
        email: 'emp2@stafftime.com',
        phone: '0123456786',
        role_id: 3,
        hourly_salary: 45000
      }
    ]);

    console.log('Đã tạo users mẫu');

    // Tạo work schedules mẫu
    const workSchedules = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const workDate = new Date(today);
      workDate.setDate(today.getDate() - i);
      
      users.slice(2).forEach(user => { // Chỉ tạo cho employees
        workSchedules.push({
          user_id: user._id,
          work_date: workDate,
          shift_type: Math.random() > 0.5 ? 'day' : 'night',
          start_time: '08:00',
          end_time: '17:00',
          total_hours: 8,
          overtime_hours: Math.floor(Math.random() * 3),
          status: 'completed'
        });
      });
    }

    await WorkSchedule.create(workSchedules);
    console.log('Đã tạo work schedules mẫu');

    // Tạo payrolls mẫu
    const payrolls = [];
    for (let month = 1; month <= 12; month++) {
      users.forEach(user => {
        const regularHours = 160; // 8 hours * 20 days
        const overtimeHours = Math.floor(Math.random() * 20);
        const regularPay = regularHours * user.hourly_salary;
        const overtimePay = overtimeHours * user.hourly_salary * 1.5;
        const grossSalary = regularPay + overtimePay;
        const netSalary = grossSalary * 0.9; // 10% deduction

        payrolls.push({
          user_id: user._id,
          pay_period_start: new Date(2024, month - 1, 1),
          pay_period_end: new Date(2024, month, 0),
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          gross_salary: grossSalary,
          deductions: grossSalary * 0.1,
          net_salary: netSalary,
          pay_date: new Date(2024, month - 1, 25),
          status: 'paid'
        });
      });
    }

    await Payroll.create(payrolls);
    console.log('Đã tạo payrolls mẫu');

    console.log('Khởi tạo dữ liệu mẫu thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});