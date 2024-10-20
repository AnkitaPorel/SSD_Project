import React, { useState } from 'react';
import Chatbot from '../components/Chatbot';
import '../styles/UserPage.css';

const UserPage = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className="user-container">
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
