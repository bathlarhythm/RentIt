const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

// Create new item (Owner only)
router.post("/", authMiddleware, async (req, res) => {
  const { title, image, marketValue, rentPrice, category, city } = req.body;
  try {
    const item = new Item({
      owner: req.user.id,
      title,
      image,
      marketValue,
      rentPrice,
      category,
      city,
      availability: true,
    });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all available items (with city filter)
router.get("/", async (req, res) => {
  const { city } = req.query;
  const filter = { availability: true };
  if (city) filter.city = city;
  try {
    const items = await Item.find(filter).populate("owner", "email trustFactor deposit");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
