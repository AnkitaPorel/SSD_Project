const express = require('express');
const MetaModel = require('../models/metamodel');

const router = express.Router();

router.get('/meta-model', async (req, res) => {
  try {
    const metaModelDoc = await MetaModel.findOne().sort({ createdAt: -1 });

    if (!metaModelDoc) {
      console.log("No meta-model found.");
      return res.status(404).json({ msg: "No meta-model found." });
    }
    res.status(200).json({data: metaModelDoc.data });
  } catch (err) {
    console.error("Error fetching meta-model:", err);
    res.status(500).json({ msg: "Failed to fetch meta-model.", error: err.message });
  }
});

module.exports = router;