const mongoose = require("mongoose");

const aiMessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "model"],
            required: true,
        },

        text: {
            type: String,
            required: true,
            maxlength: 10000,
        },
    },
    {
        _id: false,
    }
);

const aiChatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },

        title: {
            type: String,
            default: "New Chat",
            trim: true,
            maxlength: 100,
        },

        messages: {
            type: [aiMessageSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

aiChatSchema.index({
    user: 1,
    updatedAt: -1,
});

module.exports = mongoose.model("AIChat", aiChatSchema);