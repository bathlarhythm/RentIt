const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Item = require("../models/Item");
const Rental = require("../models/Rental");

const JWT_SECRET = "your_jwt_secret_here";

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Create rental request
router.post("/request", authMiddleware, async (req, res) => {
  const { itemId, rentStart, rentEnd } = req.body;

  try {
    const renter = await User.findById(req.user.id);
    if (!renter) return res.status(400).json({ message: "User not found" });

    const item = await Item.findById(itemId).populate("owner");
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Check deposit >= market value
    if (renter.deposit < item.marketValue) {
      return res.status(400).json({ message: "Increase deposit to rent this item" });
    }

    // Check item availability
    if (!item.availability) return res.status(400).json({ message: "Item not available" });

    const rental = new Rental({
      item: item._id,
      renter: renter._id,
      owner: item.owner._id,
      rentStart: new Date(rentStart),
      rentEnd: new Date(rentEnd),
      status: "pending",
      paymentBlocked: false,
    });

    await rental.save();
    res.json({ message: "Rental request created", rental });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Owner accepts rental request
router.post("/accept/:rentalId", authMiddleware, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId).populate("item renter owner");
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.owner._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    // Block payment from renter deposit (mock)
    const renter = await User.findById(rental.renter._id);
    if (renter.deposit < rental.item.marketValue)
      return res.status(400).json({ message: "Renter deposit insufficient" });

    renter.deposit -= rental.item.marketValue;
    await renter.save();

    rental.status = "accepted";
    rental.paymentBlocked = true;
    await rental.save();

    // Mark item unavailable
    const item = await Item.findById(rental.item._id);
    item.availability = false;
    await item.save();

    res.json({ message: "Rental accepted", rental });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark rental returned
router.post("/return/:rentalId", authMiddleware, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId).populate("item renter owner");
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.renter._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    rental.status = "returned";

    // Release payment back to renter deposit (mock)
    const renter = await User.findById(rental.renter._id);
    renter.deposit += rental.item.marketValue;
    // Increase trust factor as reward
    renter.trustFactor = Math.min(10, renter.trustFactor + 1);
    await renter.save();

    // Mark item available again
    const item = await Item.findById(rental.item._id);
    item.availability = true;
    await item.save();

    await rental.save();

    res.json({ message: "Rental marked returned", rental });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
