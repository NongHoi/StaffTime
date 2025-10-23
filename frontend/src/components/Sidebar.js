import React from 'react';
import { Offcanvas } from 'react-bootstrap';

const Sidebar = ({ role, active, onNavigate, show, onHide }) => {
  // Menu structure with groups
  const menuStructure = [
    {
      title: 'TỔNG QUAN',
      items: [
        { key: 'dashboard', label: 'Bảng điều khiển', icon: 'bi-speedometer2' },
      ]
    },
    {
      title: 'CÁ NHÂN',
      items: [
        { key: 'profile', label: 'Hồ sơ của tôi', icon: 'bi-person-circle' },
        { key: 'notification-history', label: 'Lịch sử thông báo', icon: 'bi-bell' },
        { key: 'attendance', label: 'Chấm công', icon: 'bi-calendar-check-fill' },
        { key: 'myRequests', label: 'Yêu cầu của tôi', icon: 'bi-journal-text' },
        { key: 'myPayrolls', label: 'Lương của tôi', icon: 'bi-wallet2' },
      ]
    },
    {
      title: 'QUẢN LÝ',
      roles: [1, 2],
      items: [
        { key: 'users', label: 'Nhân viên', icon: 'bi-people-fill' },
        { key: 'workSchedule', label: 'Lịch làm việc', icon: 'bi-calendar3' },
        { key: 'requestManagement', label: 'Yêu cầu', icon: 'bi-card-checklist' },
        { key: 'salary', label: 'Tính lương', icon: 'bi-calculator-fill' },
        { key: 'savedPayrolls', label: 'Bảng lương', icon: 'bi-file-earmark-text-fill' },
        { key: 'reports', label: 'Báo cáo', icon: 'bi-graph-up-arrow' },
        { key: 'announcement-management', label: 'Quản lý Thông báo', icon: 'bi-megaphone', roles: [1] },
      ]
    },
    {
      title: 'LỊCH LÀM VIỆC',
      roles: [3],
      items: [
        { key: 'registerWorkSchedule', label: 'Đăng ký lịch làm', icon: 'bi-calendar-plus-fill' },
        { key: 'myRegisteredWorkSchedule', label: 'Lịch đã đăng ký', icon: 'bi-calendar-week' },
      ]
    }
  ];

  const renderMenuGroups = (isMobile = false) => {
    return menuStructure.map((group, idx) => {
      // Check if group should be displayed based on role
      if (group.roles && !group.roles.includes(role)) {
        return null;
      }

      return (
        <div key={idx} className="nav-group">
          <div className="nav-group-title">{group.title}</div>
          {group.items.map(item => {
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
          })}
        </div>
      );
    });
  };

  // Mobile Offcanvas
  if (show !== undefined && onHide) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start" className="sidebar-mobile">
        <Offcanvas.Header closeButton className="sidebar-header border-bottom">
          <div className="sidebar-brand">
            <i className="bi bi-clock-history"></i>
            <span>StaffTime</span>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <nav className="sidebar-nav">
            {renderMenuGroups(true)}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }

  // Desktop Sidebar
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <i className="bi bi-clock-history"></i>
          <span>StaffTime</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {renderMenuGroups()}
      </nav>
    </div>
  );
};

export default Sidebar;
