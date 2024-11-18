import React, { useState } from 'react';

const MetaModelUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please upload a JSON file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append the file to form data

    try {
      const response = await fetch('http://localhost:5001/api/upload-meta-model', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.msg);
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error uploading meta-model:', error);
      alert('Failed to upload meta-model.');
    }
  };

  return (
    <div className="meta-model-upload">
      <p>(Json Format)</p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default MetaModelUpload;