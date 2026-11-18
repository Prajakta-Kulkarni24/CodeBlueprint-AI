import React, { useState } from "react";
import axios from "axios";

const AITest = () => {
    const [message, setMessage] = useState(
        "Explain what a software dependency is."
    );
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const testAI = async () => {
        setLoading(true);
        setReply("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in first. Authentication token not found.");
            }

            const response = await axios.post(
                "http://localhost:5000/api/ai/chat",
                {
                    message,
                    chatHistory: [],
                    projectContext: "This is a test project for CodeBlueprint AI."
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setReply(response.data.reply || "No response received.");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to connect to AI."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px" }}>
            <h2>CodeBlueprint AI — Connection Test</h2>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "12px" }}
            />

            <button onClick={testAI} disabled={loading}>
                {loading ? "Generating response..." : "Test AI"}
            </button>

            {error && (
                <p style={{ color: "red" }}>{error}</p>
            )}

            {reply && (
                <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc" }}>
                    <h3>AI Response</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>{reply}</p>
                </div>
            )}
        </div>
    );
};

export default AITest;