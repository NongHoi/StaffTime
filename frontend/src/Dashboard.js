import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Attendance from './Attendance';
import Salary from './Salary';
import UserManagement from './UserManagement';
import NightShiftConfig from './NightShiftConfig';
import Profile from './Profile';
import Header from './Header';
import Sidebar from './Sidebar';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('dashboard');

  useEffect(() => {
    // Lấy thông tin user từ session
    fetch('/api/auth/me').then(async res => {
      if (res.ok) setUser(await res.json());
      else onLogout();
    });
  }, [onLogout]);

  if (!user) return null;
  const role = user.user?.role_id;

  return (
    <div style={{ background: '#f6f8fa', minHeight: '100vh' }}>
      <Header onLogout={onLogout} />
      <Container fluid>
        <Row>
          <Col md={2} className="d-none d-md-block">
            <Sidebar role={role} active={active} onNavigate={setActive} />
          </Col>
          <Col md={10} className="pt-3">
            {active === 'dashboard' && (
              <Card className="shadow-sm border-0 rounded-4 mb-3">
                <Card.Body>
                  <h4>Chào mừng, {user.user?.fullname || user.user?.username}!</h4>
                  <p className="text-muted mb-0">Hệ thống quản lý chấm công & tính lương sự kiện StaffTime.</p>
                </Card.Body>
              </Card>
            )}
            {active === 'attendance' && <Attendance />}
            {active === 'salary' && <Salary user={user.user} />}
            {active === 'users' && <UserManagement />}
            {active === 'config' && <NightShiftConfig />}
            {active === 'profile' && <Profile user={user.user} />}
            {/* Các trang chức năng sẽ bổ sung tại đây */}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
