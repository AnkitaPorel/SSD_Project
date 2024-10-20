import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';  // Import the CSS file for styling

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    // Check if Priyamwada (admin) is logging in
    if (email === 'Admin@ellibot.com' && password === 'Admin123') {
      navigate('/admin');  // Navigate to Priyamwada's Admin Page
    } else if (email && password) {
      // Assume Sushma (user) is logging in, navigate to her page
      navigate('/user');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');  // Redirect to Register Page
  };

  return (
    <div className="login-container">
      {/* Left side with the welcome message */}
      <div className="welcome-section">
        <h1>Welcome to Ellibot</h1>
        <p>A Conversational Requirement Elicitation Tool for Reporting Domain</p>
      </div>

      {/* Right side with the login form */}
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <button onClick={handleRegisterRedirect}>Register here</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
