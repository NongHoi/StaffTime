import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Gọi API đăng nhập
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
  // Đăng nhập thành công, chuyển sang dashboard
  if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#f6f8fa' }}>
      <Row className="w-100 justify-content-center">
        <Col md={5}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h3 className="mb-4 text-center" style={{ color: '#3a3a3a' }}>Đăng nhập StaffTime</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </Form.Group>
                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={loading} style={{ background: '#6c63ff', border: 'none' }}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-2">
                <Button variant="link" onClick={onSwitchToRegister} style={{ color: '#6c63ff' }}>
                  Chưa có tài khoản? Đăng ký
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
