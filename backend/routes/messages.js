const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  deleteToken: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const deleteToken =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newMessage = new Message({ name, email, message, deleteToken });
    await newMessage.save();

    res.status(201).json({
      message: "Message saved",
      messageId: newMessage._id,
      deleteToken,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.delete("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.deleteToken !== token) {
      return res.status(401).json({ error: "Invalid delete token" });
    }
    await message.remove();
    res.json({ message: "Message deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
