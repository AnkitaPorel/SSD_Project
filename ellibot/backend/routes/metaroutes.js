const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define your schema for the meta-model
const metaModelSchema = new mongoose.Schema({
  data: Object, // Assuming the JSON structure is an object
  createdAt: { type: Date, default: Date.now }
});

const MetaModel = mongoose.model('MetaModel', metaModelSchema);

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Directory to temporarily store uploaded files

// Endpoint to upload the JSON file
router.post('/upload-meta-model', upload.single('file'), async (req, res) => {
  try {
    // Read the uploaded file
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileData = fs.readFileSync(filePath);
    
    // Parse the JSON data
    const jsonData = JSON.parse(fileData);

    // Save to MongoDB
    const metaModel = new MetaModel({ data: jsonData });
    await metaModel.save();

    // Delete the file after saving
    fs.unlinkSync(filePath);

    res.status(201).json({ msg: 'Meta-model uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to upload meta-model' });
  }
});

module.exports = router;