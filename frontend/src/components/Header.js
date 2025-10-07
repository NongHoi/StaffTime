import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onLogout, onMenuClick }) => {
  const { user } = useAuth();

  const getRoleText = (roleId) => {
    switch (roleId) {
      case 1: return 'Quản trị viên';
      case 2: return 'Quản lý';
      case 3: return 'Nhân viên';
      default: return 'Người dùng';
    }
  };

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

        <div className="header-right">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
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
