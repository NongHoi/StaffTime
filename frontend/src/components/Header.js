import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';

const Header = ({ onLogout, onMenuClick }) => (
  <Navbar bg="white" className="shadow-sm mb-3" expand="lg" style={{ minHeight: 60 }}>
    <Container fluid>
      <div className="d-flex align-items-center">
        {/* Nút menu cho mobile */}
        {onMenuClick && (
          <Button
            variant="outline-primary"
            className="d-md-none me-2"
            style={{ border: 'none', fontSize: 22, padding: '2px 10px' }}
            onClick={onMenuClick}
          >
            <span className="navbar-toggler-icon" />
          </Button>
        )}
        <Navbar.Brand style={{ fontWeight: 700, color: '#050506ff', fontSize: 24 }}>
          <span style={{ marginRight: 8, fontSize: 28 }}></span> StaffTime
        </Navbar.Brand>
      </div>
      <Button variant="outline-secondary" onClick={onLogout} size="sm">
        Đăng xuất
      </Button>
    </Container>
  </Navbar>
);

export default Header;
