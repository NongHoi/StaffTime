import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import { useState } from 'react';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = () => setLoggedIn(true);
  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => setLoggedIn(false));
  };

  if (loggedIn) return <Dashboard onLogout={handleLogout} />;
  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onSwitchToRegister={() => setShowRegister(true)} onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;
