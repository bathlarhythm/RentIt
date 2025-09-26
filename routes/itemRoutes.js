const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Middleware to check login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
}

// Show item listing form only if logged in
router.get('/list', requireLogin, (req, res) => {
  res.render('listItem');
});

// Handle item listing form submission
router.post('/list', requireLogin, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      ownerId: req.session.userId,
    };
    const item = new Item(itemData);
    await item.save();

    res.status(200).send("Item listed successfully"); // ✅ AJAX expects this
  } catch (err) {
    res.status(400).send("Error listing item: " + err.message);
  }
});



// Display all available items
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find({ available: true });
    res.render('browseItems', { items });
  } catch (err) {
    res.status(500).send('Error fetching items: ' + err.message);
  }
});

module.exports = router;
