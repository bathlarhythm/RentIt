const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup POST
router.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Save user ID only in session
    req.session.userId = user._id;

    res.redirect('/');
  } catch (err) {
    res.status(400).send('Signup error: ' + err.message);
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login POST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Simple password check; consider hashing in real app
  if (!user || user.password !== password) {
    return res.status(401).send('Invalid email or password');
  }

  // Store user ID in session
  req.session.userId = user._id;

  res.redirect('/');
});

// GET deposit page (only for users, not owners)
router.get('/deposit', async (req, res) => {
  if (!req.session.userId) return res.redirect('/users/login');

  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).send('User not found');

  if (user.role !== 'user') {
    return res.redirect('/items/list');
  }

  res.render('deposit');
});

// POST deposit (only for users, not owners)
router.post('/deposit', async (req, res) => {
  if (!req.session.userId) return res.status(401).send('Not logged in');

  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).send('User not found');

  if (user.role !== 'user') {
    return res.status(403).send('Only regular users can make a deposit.');
  }

  const { amount } = req.body;
  const depositAmount = Number(amount);

  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).send('Invalid deposit amount.');
  }

  user.deposit += depositAmount;
  user.wallet += depositAmount;
  user.trustFactor = Math.min(10, Math.floor(user.deposit / 1000));

  await user.save();

  res.send(' Deposit successful. Trust Factor updated.');
});
module.exports = router;
