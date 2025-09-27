// routes/items.js

const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const multer = require("multer");
const { storage } = require("../utils/cloudinaryStorage");
const upload = multer({ storage });

// ✅ Create new item without auth
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, value, rentPrice, category, city } = req.body;

    const item = new Item({
      name,
      value,
      rentPrice,
      category,
      city,
      image: req.file.path,
      available: true,
    });

    await item.save();
    res.status(201).json({ message: "Item listed successfully", item });
  } catch (err) {
    console.error("Upload error:", err); // 🔎 log full stack
    res.status(500).json({ message: "Failed to list item", error: err.message });
  }
});


module.exports = router;
