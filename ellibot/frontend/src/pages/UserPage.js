import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // For navigation
import Chatbot from '../components/Chatbot';
import '../styles/UserPage.css';

const UserPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();  // Initialize navigation

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const handleLogout = () => {
    navigate('/');  // Redirect to Login Page
  };

  return (
    <div className="user-container">
      {/* Logout button */}
      <div className="logout-section">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="welcome-section">
        <h1>Welcome to the chat application</h1>
        <p>Click the button below to chat and submit your report requirements.</p>
        <button onClick={toggleChat}>
          {chatOpen ? "Close Chat" : "Chat with us"}
        </button>
      </div>
      
      {chatOpen && <Chatbot />}
    </div>
  );
};

export default UserPage;
