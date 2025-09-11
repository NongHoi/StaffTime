import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check login status on mount
  useEffect(() => {
    fetch('/api/auth/check-login')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setLoggedIn(true);
          setUser(data.user);
        }
      });
  }, []);


  const handleLoginSuccess = (userData) => {
    setLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      setLoggedIn(false);
      setUser(null);
    });
  };

  if (loggedIn) {
    return (
      <SocketProvider user={user}>
        <Dashboard onLogout={handleLogout} user={user} />
      </SocketProvider>
    );
  }

  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onSwitchToRegister={() => setShowRegister(true)} onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;
