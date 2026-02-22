const express = require("express");
const Contact = require("../models/Contact");
const auth = require("../middleware/auth");

const router = express.Router();

// Public – save contact
router.post("/", async (req, res) => {
  await Contact.create(req.body);
  res.json({ msg: "Message received" });
});

// Admin – get all contacts
router.get("/", auth, async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// Mark as read
router.put("/:id", auth, async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ msg: "Marked as read" });
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
