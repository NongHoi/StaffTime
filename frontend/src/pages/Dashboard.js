import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, ListGroup, Alert } from 'react-bootstrap';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import '../styles/Dashboard.css';
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
import AnnouncementManagement from './AnnouncementManagement';
import NotificationHistory from './NotificationHistory';
import MaterialManagement from './MaterialManagement';
import MaterialIssuance from './MaterialIssuance';
import MaterialReturn from './MaterialReturn';

const Dashboard = ({ onLogout, user }) => {
  const [active, setActive] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  
  // Realtime dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    todayAttendance: 0,
    todayHours: 0,
    pendingRequests: 0,
    totalEmployees: 0,
    onlineUsers: 0,
    monthWorkSchedules: 0 // Changed from todayWorkSchedules
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const socket = useSocket();

  // Fetch initial data
  useEffect(() => {
    if (user?.role_id === 1 || user?.role_id === 2) {
      fetchDashboardData();
    }
  }, [user]);

  // Setup realtime listeners
  useEffect(() => {
    if (socket && active === 'dashboard') {
      // Listen for various realtime events
      socket.on('dashboard_update', handleDashboardUpdate);
      socket.on('new_attendance', handleNewAttendance);
      socket.on('new_request', handleNewRequest);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);
      socket.on('new_work_schedule', handleNewWorkSchedule);
      
      return () => {
        socket.off('dashboard_update');
        socket.off('new_attendance');
        socket.off('new_request');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('new_work_schedule');
      };
    }
  }, [socket, active]);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersRes = await axios.get('http://localhost:3000/api/users', {
        withCredentials: true
      });
      if (usersRes.data) {
        setAllUsers(usersRes.data);
        setDashboardStats(prev => ({ ...prev, totalEmployees: usersRes.data.length }));
      }

      // Fetch dashboard stats
      const statsRes = await axios.get('http://localhost:3000/api/dashboard/stats', {
        withCredentials: true
      });
      if (statsRes.data) {
        setDashboardStats(prev => ({ ...prev, ...statsRes.data }));
      }

      // Fetch recent activities
      const activitiesRes = await axios.get('http://localhost:3000/api/dashboard/activities', {
        withCredentials: true
      });
      if (activitiesRes.data) {
        setRecentActivities(activitiesRes.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleDashboardUpdate = (data) => {
    setDashboardStats(prev => ({ ...prev, ...data }));
    setLastUpdated(new Date());
  };

  const handleNewAttendance = (data) => {
    setDashboardStats(prev => ({ 
      ...prev, 
      todayAttendance: prev.todayAttendance + 1 
    }));
    
    const message = data.type === 'check_in' 
      ? `${data.userName} vừa chấm công vào ca ${data.shiftType === 'day' ? 'ngày' : 'đêm'}`
      : data.type === 'check_out'
      ? `${data.userName} vừa chấm công ra ca (${data.totalHours}h)`
      : `${data.userName} vừa chấm công show`;

    setRecentActivities(prev => [{
      id: Date.now(),
      type: 'attendance',
      icon: 'bi-clock',
      color: 'success',
      message: message,
      time: new Date().toLocaleString('vi-VN')
    }, ...prev.slice(0, 9)]);
  };

  const handleNewRequest = (data) => {
    setDashboardStats(prev => ({ 
      ...prev, 
      pendingRequests: prev.pendingRequests + 1 
    }));
    
    const requestTypeText = {
      'leave': 'nghỉ phép',
      'overtime': 'làm thêm giờ',
      'schedule_change': 'thay đổi lịch'
    }[data.type] || data.type;

    setRecentActivities(prev => [{
      id: Date.now(),
      type: 'request',
      icon: 'bi-file-text',
      color: 'warning',
      message: `${data.userName} gửi yêu cầu ${requestTypeText}`,
      time: new Date().toLocaleString('vi-VN')
    }, ...prev.slice(0, 9)]);
  };

  const handleUserOnline = (data) => {
    setDashboardStats(prev => ({ 
      ...prev, 
      onlineUsers: prev.onlineUsers + 1 
    }));
  };

  const handleUserOffline = (data) => {
    setDashboardStats(prev => ({ 
      ...prev, 
      onlineUsers: Math.max(0, prev.onlineUsers - 1) 
    }));
  };

  const handleNewWorkSchedule = (data) => {
    setDashboardStats(prev => ({ 
      ...prev, 
      monthWorkSchedules: prev.monthWorkSchedules + 1 // Changed from todayWorkSchedules
    }));
    
    const shiftText = {
      'morning': 'sáng',
      'afternoon': 'chiều',
      'night': 'tối',
      'day': 'ngày'
    }[data.shiftType] || data.shiftType;

    setRecentActivities(prev => [{
      id: Date.now(),
      type: 'schedule',
      icon: 'bi-calendar-plus',
      color: 'primary',
      message: `${data.userName} đăng ký ca ${shiftText} (${data.startTime} - ${data.endTime})`,
      time: new Date().toLocaleString('vi-VN')
    }, ...prev.slice(0, 9)]);
  };

  if (!user) return null;
  const role = user.role_id;

  const renderDashboardHome = () => (
    <div className="dashboard-home animate-fade-in">
      {/* Welcome Card with Liquid Glass */}
      <Card className="welcome-card glass-hover animate-slide-up mb-4">
        <Card.Body>
          <Row>
            <Col>
              <h2 className="mb-3">
                <i className="bi bi-sun me-2"></i>
                Xin chào, {user.full_name || user.username}!
              </h2>
              <p className="mb-0" style={{color: 'rgba(30, 41, 59, 0.7)'}}>
                Chào mừng bạn đến với hệ thống quản lý nhân sự StaffTime. 
                Hôm nay là {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </Col>
            <Col xs="auto" className="d-flex flex-column align-items-end">
              <Badge className="realtime-indicator mb-2">
                <i className="bi bi-wifi me-1"></i>
                Realtime
              </Badge>
              <small style={{color: 'rgba(30, 41, 59, 0.6)'}}>
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards with Liquid Glass */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card glass-hover h-100 animate-scale-in float">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-primary me-3">
                <i className="bi bi-person-check"></i>
              </div>
              <div>
                <h3 className="mb-0">{dashboardStats.todayAttendance}</h3>
                <p className="mb-0">Chấm công hôm nay</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card glass-hover h-100 animate-scale-in float">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-success me-3">
                <i className="bi bi-clock"></i>
              </div>
              <div>
                <h3 className="mb-0">{dashboardStats.todayHours.toFixed(1)}</h3>
                <p className="mb-0">Giờ làm hôm nay</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card glass-hover h-100 animate-scale-in float">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-warning me-3">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <h3 className="mb-0">{dashboardStats.pendingRequests}</h3>
                <p className="mb-0">Yêu cầu chờ duyệt</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {(role === 1 || role === 2) && (
          <Col md={3} className="mb-3">
            <Card className="stat-card glass-hover h-100 animate-scale-in float">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon bg-info me-3">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <h3 className="mb-0">{dashboardStats.totalEmployees}</h3>
                  <p className="mb-0">Tổng nhân viên</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Additional Stats for Admin/Manager */}
      {(role === 1 || role === 2) && (
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="stat-card glass-hover h-100 animate-scale-in">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon bg-success me-3" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-circle-fill" style={{fontSize: '12px'}}></i>
                </div>
                <div>
                  <h4 className="mb-0" style={{fontSize: '2rem', fontWeight: 'var(--font-weight-bold)'}}>{dashboardStats.onlineUsers}</h4>
                  <p className="mb-0">Đang online</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="stat-card glass-hover h-100 animate-scale-in">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon bg-primary me-3" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-calendar-month"></i>
                </div>
                <div>
                  <h4 className="mb-0" style={{fontSize: '2rem', fontWeight: 'var(--font-weight-bold)'}}>{dashboardStats.monthWorkSchedules || 0}</h4>
                  <p className="mb-0">Lịch làm tháng này</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={8}>
          <Card className="activity-card glass-hover animate-slide-up">
            <Card.Header>
              <Card.Title>
                <i className="bi bi-activity me-2"></i>
                Hoạt động gần đây
                <Badge bg="primary" className="ms-2">{recentActivities.length}</Badge>
              </Card.Title>
            </Card.Header>
            <Card.Body className="activity-list">
              {recentActivities.length === 0 ? (
                <Alert variant="info" className="mb-0" style={{
                  background: 'var(--gradient-primary)', 
                  border: 'none', 
                  color: 'white',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Chưa có hoạt động nào
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {recentActivities.map((activity, index) => (
                    <ListGroup.Item key={activity.id || index} className="activity-item">
                      <div className={`activity-icon bg-${activity.color}`}>
                        <i className={activity.icon}></i>
                      </div>
                      <div className="activity-content flex-grow-1">
                        <p className="mb-1">{activity.message}</p>
                        <small>{activity.time}</small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="notification-card glass-hover animate-slide-up">
            <Card.Header>
              <Card.Title>
                <i className="bi bi-chart-bar me-2"></i>
                Thống kê nhanh
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="quick-stats-item">
                  <div>
                    <i className="bi bi-clock text-primary me-2"></i>
                    Giờ làm trung bình
                  </div>
                  <Badge bg="primary">8.2h</Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="quick-stats-item">
                  <div>
                    <i className="bi bi-calendar-check text-success me-2"></i>
                    Công việc hoàn thành
                  </div>
                  <Badge bg="success">94%</Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="quick-stats-item">
                  <div>
                    <i className="bi bi-person-plus text-info me-2"></i>
                    Nhân viên mới tháng này
                  </div>
                  <Badge bg="info">3</Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="quick-stats-item">
                  <div>
                    <i className="bi bi-graph-up text-warning me-2"></i>
                    Hiệu suất làm việc
                  </div>
                  <Badge bg="warning">87%</Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Floating Action Button */}
      <button className="fab glow-blue" onClick={() => console.log('Quick action')}>
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  );

  return (
    <>
      <Notification />
      <div className="dashboard-layout">
        <Header onLogout={onLogout} onMenuClick={() => setShowSidebar(true)} onNavigate={setActive} />
        
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
              {active === 'reports' && (role === 1 || role === 2) && <Reports user={user} />}
              {active === 'announcement-management' && <AnnouncementManagement />}
              {active === 'notification-history' && <NotificationHistory />}
              {active === 'materialManagement' && (role === 1 || role === 2) && <MaterialManagement />}
              {active === 'materialIssuance' && (role === 1 || role === 2) && <MaterialIssuance />}
              {active === 'materialReturn' && (role === 1 || role === 2) && <MaterialReturn />}
            </Container>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
