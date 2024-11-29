import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaModelUpload from '../components/MetaModelUpload';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummaries = async () => {
      setIsLoadingSummaries(true);
      try {
        const response = await fetch('http://localhost:5001/api/get-summaries');
        if (!response.ok) {
          throw new Error('Failed to fetch summaries');
        }
        const data = await response.json();
        setSummaries(data.summaries || []);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setIsLoadingSummaries(false);
      }
    };

    fetchSummaries();
  }, []);

  const handleSendToEngineers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/send-user-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixedEmails: ['xyz@gmail.com', 'abc@gmail.com'] }),
      });

      if (response.ok) {
        alert('User responses sent successfully to the data engineering team!');
        setEmailSent(true);
      } else {
        console.error('Error sending user responses:', await response.json());
        alert('Failed to send user responses.');
      }
    } catch (error) {
      console.error('Error sending user responses:', error);
      alert('An error occurred while sending user responses.');
    }
  };

  const handleLogout = () => {
    navigate('/');  // Redirect to Login Page
  };

  return (
    <div className="admin-container">
      {/* Logout button */}
      <div className="logout-section">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="welcome-section">
        <h1>Welcome, here you can upload your meta model</h1>
        <p>Upload the meta-model for user to interact with and review the generated report requirements.</p>
      </div>

      {/* Horizontal alignment for meta-model upload and requirements */}
      <div className="content-section">
        <div className="meta-model-section">
          <h2 className="meta-model-title">Upload Meta-Model</h2>
          <MetaModelUpload />
        </div>
        <div className="requirements-section">
          <h2 className="requirements-title">Report Summaries</h2>
          {isLoadingSummaries ? (
            <p>Loading summaries...</p>
          ) : summaries.length === 0 ? (
            <p>No summaries available yet.</p>
          ) : (
            <ul>
              {summaries.map((summary, index) => (
                <li key={index}>{summary}</li>
              ))}
            </ul>
          )}
          <button onClick={handleSendToEngineers} disabled={emailSent}>
            {emailSent ? 'Email Sent!' : 'Send User Responses to Engineers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
