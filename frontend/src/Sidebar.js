import React from 'react';
import { Nav } from 'react-bootstrap';

const Sidebar = ({ role, onNavigate, active }) => {
  // role: 1-admin, 2-manager, 3-user
  const menu = [
    { key: 'dashboard', label: 'Tổng quan' },
    { key: 'attendance', label: 'Chấm công' },
    { key: 'profile', label: 'Thông tin cá nhân' },
  ];
  if (role === 1 || role === 2) {
    menu.push({ key: 'salary', label: 'Tính lương' });
    menu.push({ key: 'users', label: 'Quản lý nhân viên' });
  }
  return (
    <Nav className="flex-column bg-white shadow-sm rounded-4 p-3 h-100" style={{ minWidth: 200 }}>
      {menu.map(item => (
        <Nav.Link
          key={item.key}
          active={active === item.key}
          onClick={() => onNavigate(item.key)}
          style={{ color: '#3a3a3a', fontWeight: active === item.key ? 600 : 400 }}
        >
          {item.label}
        </Nav.Link>
      ))}
    </Nav>
  );
};

export default Sidebar;
