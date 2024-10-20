import React, { useState } from 'react';
import MetaModelUpload from '../components/MetaModelUpload';
import '../styles/AdminPage.css';  // Importing the CSS for styling

const AdminPage = () => {
  const [requirements, setRequirements] = useState([]);

  const handleSendToEngineers = () => {
    alert("Requirements sent to the data engineering team!");
  };

  return (
    <div className="admin-container">
      <div className="welcome-section">
        <h1>Welcome, here you can upload your meta model</h1>
        <p>Upload the meta-model for user to interact with and review the generated report requirements.</p>
      </div>
      <div className="meta-model-section">
        <MetaModelUpload />
      </div>
      <div className="requirements-section">
        <h2>Report Requirements</h2>
        {/* Assuming requirements are coming from a database */}
        <ul>
          {requirements.length === 0 ? (
            <p>No requirements yet.</p>
          ) : (
            requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))
          )}
        </ul>
        <button onClick={handleSendToEngineers}>Send to Data Engineers</button>
      </div>
    </div>
  );
};

export default AdminPage;
