const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const metaModelSchema = new mongoose.Schema({
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

const MetaModel = mongoose.model('MetaModel', metaModelSchema);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-meta-model', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileData = fs.readFileSync(filePath);
    
    const jsonData = JSON.parse(fileData);

    const metaModel = new MetaModel({ data: jsonData });
    await metaModel.save();

    fs.unlinkSync(filePath);

    res.status(201).json({ msg: 'Meta-model uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to upload meta-model' });
  }
});

module.exports = router;