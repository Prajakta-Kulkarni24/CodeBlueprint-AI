const mongoose = require("mongoose");

const AIChat = require("../models/AIChat");
const { getProjectById } = require("../services/projectService");

// Get all chats belonging to the logged-in user.
const getChats = async (req, res) => {
    try {
        const chats = await AIChat.find({
            user: req.user.userId,
        })
            .select("title project createdAt updatedAt messages")
            .sort({ updatedAt: -1 })
            .lean();

        const formattedChats = chats.map((chat) => ({
            _id: chat._id,
            title: chat.title,
            project: chat.project,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            messageCount: chat.messages.length,
            preview:
                chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1].text.slice(0, 100)
                    : "",
        }));

        return res.status(200).json({
            success: true,
            chats: formattedChats,
        });
    } catch (error) {
        console.error("Get chats error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load chat history.",
        });
    }
};

// Get one conversation, checking its owner.
const getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
            });
        }

        const chat = await AIChat.findOne({
            _id: chatId,
            user: req.user.userId,
        }).lean();

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        return res.status(200).json({
            success: true,
            chat,
        });
    } catch (error) {
        console.error("Get chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load this conversation.",
        });
    }
};

// Create a new conversation.
const createChat = async (req, res) => {
    try {
        const { title, projectId } = req.body;

        let project = null;

        if (projectId) {
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID.",
                });
            }

            project = await getProjectById(
                projectId,
                req.user.userId
            );
        }

        const chat = await AIChat.create({
            user: req.user.userId,
            project: project ? project._id : null,
            title:
                typeof title === "string" && title.trim()
                    ? title.trim().slice(0, 100)
                    : "New Chat",
            messages: [],
        });

        return res.status(201).json({
            success: true,
            chat,
        });
    } catch (error) {
        console.error("Create chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create a conversation.",
        });
    }
};

// Save messages and optional project context.
const updateChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { messages, projectId, title } = req.body;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
            });
        }

        const chat = await AIChat.findOne({
            _id: chatId,
            user: req.user.userId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        if (messages !== undefined) {
            if (
                !Array.isArray(messages) ||
                messages.length > 200 ||
                messages.some(
                    (item) =>
                        !item ||
                        !["user", "model"].includes(item.role) ||
                        typeof item.text !== "string" ||
                        !item.text.trim() ||
                        item.text.length > 10000
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid conversation messages.",
                });
            }

            chat.messages = messages.map((item) => ({
                role: item.role,
                text: item.text,
            }));
        }

        if (projectId !== undefined) {
            if (projectId === null || projectId === "") {
                chat.project = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(projectId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid project ID.",
                    });
                }

                const project = await getProjectById(
                    projectId,
                    req.user.userId
                );

                chat.project = project._id;
            }
        }

        if (typeof title === "string" && title.trim()) {
            chat.title = title.trim().slice(0, 100);
        }

        await chat.save();

        return res.status(200).json({
            success: true,
            chat,
        });
    } catch (error) {
        console.error("Update chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save this conversation.",
        });
    }
};

// Delete a conversation belonging to the logged-in user.
const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
            });
        }

        const chat = await AIChat.findOneAndDelete({
            _id: chatId,
            user: req.user.userId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully.",
        });
    } catch (error) {
        console.error("Delete chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete this conversation.",
        });
    }
};

module.exports = {
    getChats,
    getChatById,
    createChat,
    updateChat,
    deleteChat,
};