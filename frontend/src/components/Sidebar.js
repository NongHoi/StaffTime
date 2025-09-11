import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';

const Sidebar = ({ role, active, onNavigate, show, onHide }) => {
  const navItems = [
    { key: 'dashboard', label: 'Bảng điều khiển', icon: 'bi-grid' },
    { key: 'attendance', label: 'Chấm công', icon: 'bi-calendar-check' },
    { key: 'profile', label: 'Hồ sơ của tôi', icon: 'bi-person' },
    { key: 'myRequests', label: 'Yêu cầu của tôi', icon: 'bi-journal-text' }, // For all users
    { key: 'myPayrolls', label: 'Lương của tôi', icon: 'bi-cash-stack' }, // For all users
    // Admin & Manager only
    { key: 'salary', label: 'Tính lương', icon: 'bi-calculator', roles: [1, 2] },
    { key: 'savedPayrolls', label: 'Bảng lương đã lưu', icon: 'bi-archive', roles: [1, 2] },
    { key: 'users', label: 'Quản lý nhân viên', icon: 'bi-people', roles: [1, 2] },
    { key: 'workSchedule', label: 'Quản lý lịch làm', icon: 'bi-calendar-event', roles: [1, 2] },
    { key: 'requestManagement', label: 'Quản lý yêu cầu', icon: 'bi-card-checklist', roles: [1, 2] }, // For admin/manager
    // Staff only
    { key: 'registerWorkSchedule', label: 'Đăng ký lịch làm', icon: 'bi-calendar-plus', roles: [3] },
    { key: 'myRegisteredWorkSchedule', label: 'Lịch làm đã đăng ký', icon: 'bi-calendar-week', roles: [3] },
  ];

  // Hiển thị dạng Offcanvas nếu có prop show, onHide (mobile), còn lại là sidebar dọc (desktop)
  if (show !== undefined && onHide) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navItems.map(item => {
              if (item.roles === undefined || item.roles.includes(role)) {
                return (
                  <Nav.Link
                    key={item.key}
                    active={active === item.key}
                    onClick={() => { onNavigate(item.key); onHide(); }}
                    style={{ color: '#3a3a3a', fontWeight: active === item.key ? 600 : 400 }}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </Nav.Link>
                );
              }
              return null;
            })}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
  // Desktop sidebar
  return (
    <Nav className="flex-column bg-white shadow-sm rounded-4 p-3 h-100" style={{ minWidth: 200 }}>
      {navItems.map(item => {
        if (item.roles === undefined || item.roles.includes(role)) {
          return (
            <Nav.Link
              key={item.key}
              active={active === item.key}
              onClick={() => onNavigate(item.key)}
              style={{ color: '#3a3a3a', fontWeight: active === item.key ? 600 : 400 }}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </Nav.Link>
          );
        }
        return null;
      })}
    </Nav>
  );
};

export default Sidebar;
