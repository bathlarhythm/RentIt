const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET: Signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST: Handle signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    const existingUser = await User.findOne({ email, userType });

    if (existingUser) {
      const message = encodeURIComponent(`An account already exists for ${userType} with this email.`);
      return res.redirect(`/users/signup?error=${message}`);
    }

    const newUser = new User({ name, email, password, userType });
    await newUser.save();

    req.session.userId = newUser._id;
    req.session.userType = newUser.userType;
    res.redirect('/');
  } catch (err) {
    const message = encodeURIComponent('Signup error: ' + err.message);
    res.redirect(`/users/signup?error=${message}`);
  }
});


// GET: Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST: Handle login
router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  const user = await User.findOne({ email, userType });

  if (!user || user.password !== password) {
    const message = encodeURIComponent('Invalid email, password, or role');
    return res.redirect(`/users/login?error=${message}`);
  }

  req.session.userId = user._id;
  req.session.userType = user.userType;
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

  if (user.userType !== 'user') {
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
