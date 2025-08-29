import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';

const Header = ({ onLogout }) => (
  <Navbar bg="white" className="shadow-sm mb-3" expand="lg" style={{ minHeight: 60 }}>
    <Container fluid>
      <Navbar.Brand style={{ fontWeight: 700, color: '#6c63ff', fontSize: 24 }}>
        <span style={{ marginRight: 8, fontSize: 28 }}>⏰</span> StaffTime
      </Navbar.Brand>
      <Button variant="outline-secondary" onClick={onLogout} size="sm">
        Đăng xuất
      </Button>
    </Container>
  </Navbar>
);

export default Header;
