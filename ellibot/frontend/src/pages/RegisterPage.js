import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  const handleRegister = (event) => {
    event.preventDefault();
    alert(`User Registered: ${name}, Department: ${department}`);
    navigate('/user');
  };

  const departmentOptions = [
    "Underwriting", "Claims", "Actuarial", "Sales and Marketing", "Customer Service",
    "Policy Administration", "Finance and Accounting", "Legal and Compliance",
    "Information Technology (IT)", "Human Resources (HR)", "Risk Management",
    "Reinsurance", "Product Development"
  ];

  return (
    <div className="register-container">
      {/* Left side with the welcome message */}
      <div className="welcome-section">
        <h1>Welcome to Ellibot</h1>
        <p>A Conversational Requirement Elicitation Tool for Reporting Domain</p>
      </div>

      {/* Right side with the registration form */}
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
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
