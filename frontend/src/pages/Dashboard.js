import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Attendance from './Attendance';
import Salary from './Salary';
import UserManagement from './UserManagement';
import NightShiftConfig from './NightShiftConfig';
import Profile from './Profile';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import WorkSchedule from './WorkSchedule';
import RegisterWorkSchedule from './RegisterWorkSchedule';
import MyRegisteredWorkSchedule from './MyRegisteredWorkSchedule';
import SavedPayrolls from './SavedPayrolls';
import RequestManagement from './RequestManagement';
import MyRequests from './MyRequests';
import Notification from '../components/Notification';
import MyPayrolls from './MyPayrolls';
import Reports from './Reports';

const Dashboard = ({ onLogout, user }) => {
  const [active, setActive] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Lấy danh sách user cho SavedPayrolls
    if (user?.role_id === 1 || user?.role_id === 2) {
      fetch('/api/users')
        .then(async res => {
          if (res.ok) setAllUsers(await res.json());
          else setAllUsers([]);
        });
    }
  }, [user]);

  if (!user) return null;
  const role = user.role_id;

  const renderDashboardHome = () => (
    <div className="dashboard-home">
      <div className="welcome-card card mb-4">
        <div className="card-body">
          <h2 className="mb-3">
            <i className="bi bi-sun me-2"></i>
            Xin chào, {user.full_name || user.username}!
          </h2>
          <p className="text-muted mb-0">
            Chào mừng bạn đến với hệ thống quản lý nhân sự StaffTime. 
            Hôm nay là {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>24</h3>
            <p>Ngày công tháng này</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <i className="bi bi-clock"></i>
          </div>
          <div className="stat-content">
            <h3>8.5</h3>
            <p>Giờ làm hôm nay</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <h3>2</h3>
            <p>Yêu cầu chờ duyệt</p>
          </div>
        </div>

        {(role === 1 || role === 2) && (
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-content">
              <h3>{allUsers.length}</h3>
              <p>Tổng nhân viên</p>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-activity me-2"></i>
                Hoạt động gần đây
              </h5>
            </div>
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">Chấm công thành công</p>
                    <small className="text-muted">2 giờ trước</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon warning">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">Yêu cầu nghỉ phép đã gửi</p>
                    <small className="text-muted">1 ngày trước</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-bell me-2"></i>
                Thông báo
              </h5>
            </div>
            <div className="card-body">
              <div className="notification-list">
                <div className="notification-item">
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  <div>
                    <p className="mb-1">Cập nhật lịch làm việc</p>
                    <small className="text-muted">30 phút trước</small>
                  </div>
                </div>
                <div className="notification-item">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <div>
                    <p className="mb-1">Lương đã được tính</p>
                    <small className="text-muted">2 giờ trước</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Notification />
      <div className="dashboard-layout">
        <Header onLogout={onLogout} onMenuClick={() => setShowSidebar(true)} />
        
        {/* Mobile Sidebar */}
        <Sidebar
          role={role}
          active={active}
          onNavigate={setActive}
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
        />

        <div className="dashboard-container">
          {/* Desktop Sidebar */}
          <div className="d-none d-lg-block">
            <Sidebar role={role} active={active} onNavigate={setActive} />
          </div>

          {/* Main Content */}
          <div className="dashboard-content">
            <Container fluid className="p-4">
              {active === 'dashboard' && renderDashboardHome()}
              {active === 'attendance' && <Attendance user={user} />}
              {active === 'salary' && <Salary user={user} />}
              {active === 'users' && <UserManagement user={user} />}
              {(active === 'workSchedule' && (role === 1 || role === 2)) && <WorkSchedule user={user} />}
              {active === 'registerWorkSchedule' && <RegisterWorkSchedule />}
              {active === 'myRegisteredWorkSchedule' && role === 3 && <MyRegisteredWorkSchedule user={user} />}
              {active === 'config' && <NightShiftConfig />}
              {active === 'profile' && <Profile user={user} />}
              {active === 'savedPayrolls' && (role === 1 || role === 2) && <SavedPayrolls users={allUsers} />}
              {active === 'requestManagement' && (role === 1 || role === 2) && <RequestManagement user={user} />}
              {active === 'myRequests' && <MyRequests user={user} />}
              {active === 'myPayrolls' && <MyPayrolls user={user} />}
              {active === 'reports' && (role === 1 || role === 2) && <Reports />}
            </Container>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
