import React from 'react';
import { Offcanvas } from 'react-bootstrap';

const Sidebar = ({ role, active, onNavigate, show, onHide }) => {
  const navItems = [
    { key: 'dashboard', label: 'Bảng điều khiển', icon: 'bi-grid' },
    { key: 'attendance', label: 'Chấm công', icon: 'bi-calendar-check' },
    { key: 'profile', label: 'Hồ sơ của tôi', icon: 'bi-person' },
    { key: 'myRequests', label: 'Yêu cầu của tôi', icon: 'bi-journal-text' },
    { key: 'myPayrolls', label: 'Lương của tôi', icon: 'bi-cash-stack' },
    // Admin & Manager only
    { key: 'salary', label: 'Tính lương', icon: 'bi-calculator', roles: [1, 2] },
    { key: 'savedPayrolls', label: 'Bảng lương đã lưu', icon: 'bi-archive', roles: [1, 2] },
    { key: 'users', label: 'Quản lý nhân viên', icon: 'bi-people', roles: [1, 2] },
    { key: 'workSchedule', label: 'Quản lý lịch làm', icon: 'bi-calendar-event', roles: [1, 2] },
    { key: 'requestManagement', label: 'Quản lý yêu cầu', icon: 'bi-card-checklist', roles: [1, 2] },
    { key: 'reports', label: 'Báo cáo & Thống kê', icon: 'bi-graph-up', roles: [1, 2] },
    // Staff only
    { key: 'registerWorkSchedule', label: 'Đăng ký lịch làm', icon: 'bi-calendar-plus', roles: [3] },
    { key: 'myRegisteredWorkSchedule', label: 'Lịch làm đã đăng ký', icon: 'bi-calendar-week', roles: [3] },
  ];

  const renderNavItems = (isMobile = false) => {
    return navItems.map(item => {
      if (item.roles === undefined || item.roles.includes(role)) {
        return (
          <button
            key={item.key}
            type="button"
            className={`nav-link ${active === item.key ? 'active' : ''}`}
            onClick={() => { 
              onNavigate(item.key); 
              if (isMobile && onHide) onHide(); 
            }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        );
      }
      return null;
    });
  };

  // Mobile Offcanvas
  if (show !== undefined && onHide) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start" className="sidebar">
        <Offcanvas.Header closeButton className="sidebar-header">
        </Offcanvas.Header>
        <Offcanvas.Body className="sidebar-nav p-0">
          {renderNavItems(true)}
        </Offcanvas.Body>
      </Offcanvas>
    );
  }

  // Desktop Sidebar
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {renderNavItems()}
      </nav>
    </div>
  );
};

export default Sidebar;
