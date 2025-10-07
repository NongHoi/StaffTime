import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';

const Profile = () => {
  const [form, setForm] = useState({ fullname: '', phone: '', email: '', bank_account_number: '', bank_name: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Lấy thông tin cá nhân hiện tại
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile...');
        const res = await fetch('/api/profile');
        
        console.log('Profile fetch response status:', res.status);
        
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            console.log('Profile data received:', data);
            
            setForm({
              fullname: data.fullname || data.full_name || '',
              phone: data.phone || '',
              email: data.email || '',
              bank_account_number: data.bank_account_number || '',
              bank_name: data.bank_name || ''
            });
          } else {
            console.error('Profile fetch returned non-JSON response');
            setError('Không thể tải thông tin profile');
          }
        } else {
          console.error('Profile fetch failed with status:', res.status);
          setError('Không thể tải thông tin profile');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Lỗi khi tải thông tin profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      console.log('Submitting profile data:', form);
      
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server trả về định dạng không đúng. Vui lòng kiểm tra server.');
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        throw new Error(data.message || `Cập nhật thất bại: ${res.status}`);
      }
      
      setMessage('Cập nhật thành công!');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Lỗi không xác định');
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Thông tin cá nhân</h5>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-2">
            <Col md={6}><Form.Group><Form.Label>Họ tên</Form.Label><Form.Control name="fullname" value={form.fullname} onChange={handleChange} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control name="email" value={form.email} onChange={handleChange} required /></Form.Group></Col>
          </Row>
          <Row className="mb-2">
            <Col md={6}><Form.Group><Form.Label>Số điện thoại</Form.Label><Form.Control name="phone" value={form.phone} onChange={handleChange} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Số tài khoản ngân hàng</Form.Label><Form.Control name="bank_account_number" value={form.bank_account_number} onChange={handleChange} /></Form.Group></Col>
          </Row>
          <Row className="mb-2">
            <Col md={6}><Form.Group><Form.Label>Tên ngân hàng</Form.Label><Form.Control name="bank_name" value={form.bank_name} onChange={handleChange} /></Form.Group></Col>
          </Row>
          <div className="d-grid mt-2">
            <Button type="submit" variant="primary" style={{ background: '#6c63ff', border: 'none' }}>Lưu</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Profile;
