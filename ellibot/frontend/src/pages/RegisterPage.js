import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const BACKEND_URI = "http://localhost:5001/api/";

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate('/login');

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name || !email || !password || !department) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 7) {
      setError('Password must be at least 7 characters long.');
      return;
    }

    setIsSubmitting(true);

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department }),
    };

    try {
      const response = await fetch(BACKEND_URI + 'register', requestOptions);
      const data = await response.json();

      if (response.ok) {
        alert(data.msg);
        setName('');
        setEmail('');
        setPassword('');
        setDepartment('');
        navigate('/');
      } else {
        setError(data.msg || 'Registration failed.');
      }
    } catch (err) {
      setError('Something went wrong with the registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    'Underwriting', 'Claims', 'Actuarial', 'Sales and Marketing', 'Customer Service',
    'Policy Administration', 'Finance and Accounting', 'Legal and Compliance',
    'Information Technology (IT)', 'Human Resources (HR)', 'Risk Management',
    'Reinsurance', 'Product Development'
  ];

  return (
    <div className="register-container">
      <div className="welcome-section">
        <h1>Welcome to Ellibot</h1>
        <p>A Conversational Requirement Elicitation Tool for Reporting Domain</p>
      </div>

      <div className="register-form">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;