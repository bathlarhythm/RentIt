const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const User = require('../models/User');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login'); 
  }
}

// POST route for booking an item
router.post('/book', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { itemId, days } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(days));

    const rental = new Rental({
      itemId: item._id,
      renterId: userId,
      ownerId: item.ownerId,
      startDate,
      endDate,
      status: 'requested',
    });

    await rental.save();

    res.json({
      message: `Booking successful for ${days} day(s)!`,
      totalPrice: item.rentPrice * days,
      rentalId: rental._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET route to show user's bookings
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const rentals = await Rental.find({ renterId: userId })
      .populate('itemId')
      .populate('ownerId');

    res.render('myRentals', { rentals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET route to show owner's received bookings
router.get('/owner', isAuthenticated, async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const rentals = await Rental.find({ ownerId })
      .populate('itemId')
      .populate('renterId');

    res.render('ownerRentals', { rentals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST route to update rental status (approved, declined, returned)
router.post('/update-status', isAuthenticated, async (req, res) => {
  try {
    const { rentalId, status } = req.body;
    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).send('Rental not found');
    if (rental.ownerId.toString() !== req.session.userId) {
      return res.status(403).send('Not authorized');
    }

    rental.status = status;
    await rental.save();
    res.redirect('/rentals/owner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating rental status');
  }
});

module.exports = router;
