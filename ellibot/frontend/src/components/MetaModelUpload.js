import React, { useState } from 'react';

const MetaModelUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Meta-model uploaded: ${file ? file.name : 'No file uploaded'}`);
  };

  return (
    <div className="meta-model-upload">
      <h2>Upload Meta-Model (JSON Format)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default MetaModelUpload;
