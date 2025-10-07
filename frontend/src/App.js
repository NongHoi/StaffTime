import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './context/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register'
  const { user, setUser, loading } = useAuth();

  const handleLoginSuccess = (userData) => {
    setUser(userData); // Update AuthContext
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      setUser(null); // Clear AuthContext
    });
  };

  // Wait for auth check
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <SocketProvider user={user}>
        <Dashboard onLogout={handleLogout} user={user} />
      </SocketProvider>
    );
  }

  if (currentPage === 'register') {
    return <Register onSwitchToLogin={() => setCurrentPage('login')} onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'login') {
    return <Login onSwitchToRegister={() => setCurrentPage('register')} onLoginSuccess={handleLoginSuccess} onBackToHome={() => setCurrentPage('home')} />;
  }

  return <Home onSwitchToLogin={() => setCurrentPage('login')} onSwitchToRegister={() => setCurrentPage('register')} />;
}

export default App;
