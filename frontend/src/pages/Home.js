import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../styles/Home.css';

// Main Home Component
const Home = ({ onSwitchToLogin, onSwitchToRegister }) => {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar-custom">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-text">StaffTime</span>
          </div>
          <div className="nav-buttons">
            <button 
              className="btn btn-outline-light me-2" 
              onClick={onSwitchToLogin}
            >
              Đăng nhập
            </button>
            <button 
              className="btn btn-light" 
              onClick={onSwitchToRegister}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Quản lý nhân sự
                  <br />
                  <span className="highlight-text">Thông minh & Hiệu quả</span>
                </h1>
                <p className="hero-description">
                  StaffTime là giải pháp quản lý thời gian làm việc, chấm công và yêu cầu 
                  nghỉ phép toàn diện cho doanh nghiệp hiện đại. Đơn giản hóa quy trình HR 
                  và tăng năng suất làm việc.
                </p>
                <div className="hero-buttons">
                  <Button 
                    variant="light" 
                    size="lg" 
                    className="cta-btn me-3"
                    onClick={onSwitchToRegister}
                  >
                    Bắt đầu ngay
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg" 
                    className="learn-more-btn"
                    onClick={onSwitchToLogin}
                  >
                    Đăng nhập
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className="hero-visual">
                <div className="floating-cards">
                  <div className="card-1">
                    <div className="card-content">
                      <h6>Chấm công</h6>
                      <p>08:30 AM</p>
                    </div>
                  </div>
                  <div className="card-2">
                    <div className="card-content">
                      <h6>Yêu cầu nghỉ phép</h6>
                      <p>Đã duyệt</p>
                    </div>
                  </div>
                  <div className="card-3">
                    <div className="card-content">
                      <h6>Lương tháng</h6>
                      <p>15,000,000 VNĐ</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Tính năng nổi bật</h2>
              <p className="section-description">
                Khám phá các tính năng mạnh mẽ giúp doanh nghiệp quản lý nhân sự hiệu quả
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h5>Chấm công thông minh</h5>
                <p>Chấm công bằng QR code, theo dõi thời gian làm việc chính xác</p>
              </div>
            </Col>
            <Col lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <h5>Quản lý nghỉ phép</h5>
                <p>Gửi yêu cầu nghỉ phép online, theo dõi trạng thái duyệt</p>
              </div>
            </Col>
            <Col lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h5>Báo cáo chi tiết</h5>
                <p>Dashboard thống kê, báo cáo thời gian làm việc và hiệu suất</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer className="footer-section">
        <Container>
          <Row>
            <Col lg={12} className="text-center">
              <p>&copy; 2025 StaffTime. Tất cả quyền được bảo lưu.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Home;