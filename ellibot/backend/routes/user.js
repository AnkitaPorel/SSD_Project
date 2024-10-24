const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated, ensureAdmin } = require('../routes/authroutes');

router.get('/user', ensureAuthenticated, (req, res) => {
    res.status(200).json({ msg:'Welcome to the user section. You are logged in!', user: req.session.user });
});

router.get('/admin',ensureAdmin, (req, res) => {
  if (req.session.user.email === 'Admin@ellibot.com') {
    return res.status(200).json({ msg: 'Welcome to the admin dashboard' });
  } else {
    return res.status(403).json({ msg: 'Forbidden: You do not have access to this route' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({ msg: 'Please fill all fields.' });
  }

  if (password.length < 7) {
    return res.status(400).json({ msg: 'Password must be at least 7 characters long.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email is already registered.' });
    }

    const newUser = new User({ name, email, password, department });
    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminEmail = 'Admin@ellibot.com';
    const adminPassword = 'Admin123';

    if (email === adminEmail && password === adminPassword) {
      return res.status(200).json({
        name: 'Admin User',
        email: adminEmail,
        department: 'Admin'
      });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    req.session.user = {email: user.email, role: 'user'};

    res.status(200).json({
      name: user.name,
      email: user.email,
      department: user.department
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error, please try again later' });
  }
});

module.exports = router;