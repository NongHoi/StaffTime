import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
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

  return (
    <>
      <Notification />
      <div style={{ background: '#f6f8fa', minHeight: '100vh' }}>
        <Header onLogout={onLogout} onMenuClick={() => setShowSidebar(true)} />
        {/* Sidebar mobile */}
        <Sidebar
          role={role}
          active={active}
          onNavigate={setActive}
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
        />
        <Container fluid>
          <Row>
            <Col md={2} className="d-none d-md-block">
              <Sidebar role={role} active={active} onNavigate={setActive} />
            </Col>
            <Col md={10} className="pt-3">
              {active === 'dashboard' && (
                <Card className="shadow-sm border-0 rounded-4 mb-3">
                  <Card.Body>
                    <h4>Chào mừng, {user.fullname || user.username}!</h4>
                    <p className="text-muted mb-0">Hệ thống quản lý chấm công & tính lương sự kiện StaffTime.</p>
                  </Card.Body>
                </Card>
              )}
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
              {/* Các trang chức năng sẽ bổ sung tại đây */}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
