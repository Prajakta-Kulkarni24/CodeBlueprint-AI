const express = require("express");

const {
    chatWithAI,
} = require("../controllers/aiController");

const {
    getChats,
    getChatById,
    createChat,
    updateChat,
    deleteChat,
} = require("../controllers/aiChatController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All AI routes require authentication.
router.use(authMiddleware);

// Existing Gemini chat endpoint.
router.post("/chat", chatWithAI);

// Chat history endpoints.
router.get("/chats", getChats);
router.post("/chats", createChat);
router.get("/chats/:chatId", getChatById);
router.patch("/chats/:chatId", updateChat);
router.delete("/chats/:chatId", deleteChat);

module.exports = router;