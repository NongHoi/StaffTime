import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Register = ({ onSwitchToLogin }) => {
  const [form, setForm] = useState({ username: '', password: '', fullname: '', phone: '', email: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      setForm({ username: '', password: '', fullname: '', phone: '', email: '' });
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#f6f8fa' }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h3 className="mb-4 text-center" style={{ color: '#3a3a3a' }}>Đăng ký tài khoản</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control name="username" value={form.username} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Xác nhận lại mật khẩu</Form.Label>
                  <Form.Control type="password" name="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="fullname">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control name="fullname" value={form.fullname} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
                </Form.Group>
                <div className="d-grid mb-2">
                  <Button type="submit" variant="primary" disabled={loading} style={{ background: '#6c63ff', border: 'none' }}>
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="link" onClick={onSwitchToLogin} style={{ color: '#6c63ff' }}>
                    Đã có tài khoản? Đăng nhập
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
