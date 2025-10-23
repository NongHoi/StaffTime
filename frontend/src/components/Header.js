import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/SocketContext';
import { Dropdown, Badge } from 'react-bootstrap';

const Header = ({ onLogout, onMenuClick, onNavigate }) => {
  const { user } = useAuth();

  const getRoleText = (roleId) => {
    switch (roleId) {
      case 1: return 'Quản trị viên';
      case 2: return 'Quản lý';
      case 3: return 'Nhân viên';
      default: return 'Người dùng';
    }
  };

  const { notifications, removeNotification } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.length;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="menu-toggle d-lg-none"
            onClick={onMenuClick}
            type="button"
          >
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="header-right d-flex align-items-center">
          {/* Notification bell */}
          <Dropdown show={showDropdown} onToggle={setShowDropdown} align="end" className="me-3">
            <Dropdown.Toggle variant="light" id="dropdown-notifications" className="notification-bell">
              <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
              {unreadCount > 0 && <Badge bg="danger" pill className="ms-1">{unreadCount}</Badge>}
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <Dropdown.Header>Thông báo ({unreadCount} chưa đọc)</Dropdown.Header>
              {notifications.length === 0 ? (
                <Dropdown.ItemText>Không có thông báo</Dropdown.ItemText>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Dropdown.Item key={n.id} onClick={() => removeNotification(n.id)} className={!n.isRead ? 'fw-bold' : ''}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div style={{ fontWeight: 600 }}>{n.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{n.message}</div>
                      </div>
                      <small className="text-muted ms-2">{n.time ? new Date(n.time).toLocaleTimeString('vi-VN') : ''}</small>
                    </div>
                  </Dropdown.Item>
                ))
              )}
              <Dropdown.Divider />
              <Dropdown.Item as="div" className="text-center">
                <button className="btn btn-link" onClick={() => onNavigate('notification-history')}>
                  Xem tất cả thông báo
                </button>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {user && (
            <div className="user-info d-flex align-items-center">
              <div className="user-avatar me-2">
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="user-details me-3 text-end">
                <div className="user-name">{user.full_name || user.username}</div>
                <div className="user-role">{getRoleText(user.role_id)}</div>
              </div>
            </div>
          )}
          
          <button 
            className="logout-btn"
            onClick={onLogout}
            type="button"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-md-inline ms-2">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
