const express = require('express');
const MetaModel = require('../models/metamodel');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');

const userResponsesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userResponses: { type: Object, required: true },
});

const UserResponses = mongoose.model('UserResponses', userResponsesSchema);

const summarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  summary: { type: String, required: true },
});

const Summary = mongoose.model('Summary', summarySchema);

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

router.post('/save-user-responses', async (req, res) => {
  try {
    const { userId, userResponses } = req.body;

    if (!userId || !userResponses) {
      return res.status(400).json({ message: 'userId and userResponses are required.' });
    }

    const newUserResponse = new UserResponses({ userId, userResponses });
    await newUserResponse.save();

    res.status(200).json({ message: 'User responses saved successfully.' });
  } catch (error) {
    console.error('Error saving user responses:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

router.post('/save-summary', async (req, res) => {
  try {
    const { userId, summary } = req.body;

    if (!userId || !summary) {
      return res.status(400).json({ message: 'userId and summary are required.' });
    }

    const newSummary = new Summary({ userId, summary });
    await newSummary.save();

    res.status(200).json({ message: 'Summary saved successfully.' });
  } catch (error) {
    console.error('Error saving summary:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

router.get('/get-summaries', async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 }).limit(3);
    const summaryTexts = summaries.map((summary) => summary.summary);

    res.status(200).json({ summaries: summaryTexts });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ message: 'Failed to fetch summaries.' });
  }
});

router.post('/send-user-responses', async (req, res) => {
  try {
    const { fixedEmails } = req.body;

    if (!fixedEmails || !Array.isArray(fixedEmails)) {
      return res.status(400).json({ message: 'Invalid email addresses provided.' });
    }

    const userResponses = await Summary.find().sort({ createdAt: -1 }).limit(3);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: fixedEmails,
      subject: 'User Responses Report',
      text: 'Attached are the user responses in JSON format.',
      attachments: [
        {
          filename: 'user-responses.json',
          content: JSON.stringify(userResponses, null, 2),
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email.' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'User responses sent successfully.' });
    });
  } catch (error) {
    console.error('Error sending user responses:', error);
    res.status(500).json({ message: 'Failed to send user responses.' });
  }
});

module.exports = router;