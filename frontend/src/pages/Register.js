import React, { useState } from 'react';
import '../styles/Auth.css';

const Register = ({ onSwitchToLogin, onBackToHome }) => {
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    fullname: '', 
    phone: '', 
    email: '' 
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    
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
    <div className="auth-container">
      {/* Home Button - Top Left */}
      {onBackToHome && (
        <div className="home-link-top">
          <a href="#home" onClick={(e) => { e.preventDefault(); onBackToHome(); }}>← Về trang chủ</a>
        </div>
      )}
      
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Tài khoản mới</h1>
          <p className="auth-subtitle">Điền đầy đủ thông tin của bạn.</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle"></i>
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              name="fullname"
              className="form-control"
              value={form.fullname}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Điện thoại</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại của bạn"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="Tạo mật khẩu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

          <button 
            type="button"
            className="btn-google"
            onClick={() => console.log('Google signup')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng ký với Google
          </button>
        </form>

        <div className="auth-switch">
          Bạn đã có tài khoản? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Đăng nhập</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
