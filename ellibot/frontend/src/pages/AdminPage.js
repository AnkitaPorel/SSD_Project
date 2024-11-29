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

  useEffect(() => {
    fetchSummaries();
  }, []);
  

  const handleRedirectToMail = () => {
    const mailboxUrl = 'https://mail.google.com/';
    if (mailboxUrl) {
      window.open(mailboxUrl, '_blank');
    } else {
      console.error("Mailbox URL is not defined.");
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
            {summaries.map(({ userId, summary }, index) => (
              <li key={index}>
                <strong>User ID:</strong> {userId || "Unknown User"} <br />
                <strong>Summary:</strong> <pre>{summary}</pre>
              </li>
              ))}
            </ul>
          )}
          <button onClick={fetchSummaries}>Refresh Summaries</button>
          <button onClick={handleRedirectToMail}>
            Send the summary to engineers
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
