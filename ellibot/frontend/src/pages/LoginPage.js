import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const BACKEND_URI = "http://localhost:5001/api/login";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(BACKEND_URI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.email === 'Admin@ellibot.com') {
          navigate('/admin');
        } else {
          navigate('/user');
          localStorage.setItem('userEmail', email);
        }
        localStorage.setItem('user', JSON.stringify(data));

        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setError(data.msg || 'Invalid email or password');
      }

    } catch (err) {
      console.error('Error logging in:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
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
              autoComplete='new-password'
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}  {/* Display error if any */}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <button onClick={handleRegisterRedirect}>Register here</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
