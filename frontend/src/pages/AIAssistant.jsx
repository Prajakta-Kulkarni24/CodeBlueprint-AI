
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/aiAssistant.css";
import "../styles/sidebar.css";

const API_URL = "http://localhost:5000/api";

const FormattedMessage = ({ text }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyCode = async (code, index) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedIndex(index);

            setTimeout(() => {
                setCopiedIndex(null);
            }, 2000);
        } catch (error) {
            console.error("Unable to copy code:", error);
        }
    };

    const renderInline = (line, keyPrefix) => {
        const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith("`") && part.endsWith("`")) {
                return (
                    <code className="inline-code" key={`${keyPrefix}-${index}`}>
                        {part.slice(1, -1)}
                    </code>
                );
            }

            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={`${keyPrefix}-${index}`}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }

            return <span key={`${keyPrefix}-${index}`}>{part}</span>;
        });
    };

    const blocks = text.split(/```([\w+-]*)\n([\s\S]*?)```/g);

    return (
        <div className="formatted-message">
            {blocks.map((block, index) => {
                // Code blocks are captured as language + code pairs.
                if (index % 3 === 1) {
                    const language = block || "code";
                    const code = blocks[index + 1] || "";
                    const codeIndex = Math.floor(index / 3);

                    return (
                        <div className="message-code-block" key={index}>
                            <div className="message-code-header">
                                <span>{language}</span>

                                <button
                                    type="button"
                                    onClick={() => copyCode(code, codeIndex)}
                                    className="copy-code-button"
                                >
                                    {copiedIndex === codeIndex ? "Copied!" : "Copy code"}
                                </button>
                            </div>

                            <pre>
                                <code>{code.replace(/\n$/, "")}</code>
                            </pre>
                        </div>
                    );
                }

                // Skip the code content because it is rendered with its language.
                if (index % 3 === 2) {
                    return null;
                }

                return (
                    <div key={index} className="message-text-block">
                        {block.split("\n").map((line, lineIndex) => {
                            const trimmed = line.trim();

                            if (!trimmed) {
                                return <div key={lineIndex} className="message-line-space" />;
                            }

                            if (trimmed.startsWith("### ")) {
                                return (
                                    <h4 key={lineIndex}>
                                        {renderInline(trimmed.slice(4), lineIndex)}
                                    </h4>
                                );
                            }

                            if (trimmed.startsWith("## ")) {
                                return (
                                    <h3 key={lineIndex}>
                                        {renderInline(trimmed.slice(3), lineIndex)}
                                    </h3>
                                );
                            }

                            if (trimmed.startsWith("# ")) {
                                return (
                                    <h2 key={lineIndex}>
                                        {renderInline(trimmed.slice(2), lineIndex)}
                                    </h2>
                                );
                            }

                            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                                return (
                                    <div className="message-list-item" key={lineIndex}>
                                        • {renderInline(trimmed.slice(2), lineIndex)}
                                    </div>
                                );
                            }

                            return (
                                <p key={lineIndex}>
                                    {renderInline(line, lineIndex)}
                                </p>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const generalSuggestions = [
    "Explain object-oriented programming in Java.",
    "Explain REST API with a practical example.",
    "How do I debug a Node.js application?",
    "How can I improve my code quality?"
];

const getProjectSuggestions = (project) => {
    if (!project) {
        return generalSuggestions;
    }

    const projectName = project.name || "this project";

    return [
        `Explain the architecture of ${projectName}.`,
        `Explain the dependencies used in ${projectName}.`,
        `What security issues should I investigate in ${projectName}?`,
        `Suggest ways to improve the code quality of ${projectName}.`
    ];
};


const AIAssistant = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("dashboardTheme") !== "light";
    });

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const requestControllerRef = useRef(null);
    const chatSessionRef = useRef(0);

    const selectedProjectData = projects.find(
    (project) => project._id === selectedProject
    );

    const suggestions = getProjectSuggestions(selectedProjectData);

    // Save the selected theme.
    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    // Load the user's projects.
    useEffect(() => {
        const controller = new AbortController();

        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(`${API_URL}/projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load projects."
                    );
                }

                setProjects(data.projects || []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Project loading error:", err);
                    setError(
                        "Unable to load your projects. You can still use general chat."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setProjectsLoading(false);
                }
            }
        };

        fetchProjects();


        return () => controller.abort();
    }, []);

    // Load the user's saved chat history.
useEffect(() => {
    fetchChatHistory();
}, []);

const loadChat = async (chatId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/ai/chats/${chatId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load chat.");
        }

        chatSessionRef.current += 1;
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;

        setLoading(false);
        setMessages(data.chat.messages || []);
        setActiveChatId(data.chat._id);
        setSelectedProject(data.chat.project?._id || data.chat.project || "");
        setMessage("");
        setError("");
    } catch (err) {
        console.error("Load chat error:", err);
        setError(err.message || "Unable to load conversation.");
    }
};

const renameChat = async (chat) => {
    const newTitle = window.prompt("Enter a new chat name:", chat.title);

    if (!newTitle || !newTitle.trim()) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/ai/chats/${chat._id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to rename chat.");
        }

        await fetchChatHistory();
    } catch (err) {
        console.error("Rename chat error:", err);
        setError(err.message || "Unable to rename chat.");
    }
};

const deleteChat = async (chatId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/ai/chats/${chatId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete chat.");
        }

        if (activeChatId === chatId) {
            startNewChat();
        }

        await fetchChatHistory();
    } catch (err) {
        console.error("Delete chat error:", err);
        setError(err.message || "Unable to delete chat.");
    }
};


    // Scroll to the latest message.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, loading]);

    // Cancel an active request when the page is unmounted.
    useEffect(() => {
        return () => {
            requestControllerRef.current?.abort();
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed((previous) => !previous);
    };

    const fetchChatHistory = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/ai/chats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load chat history.");
        }

        console.log("Fetched chat history:", data.chats);
        setChatHistory(data.chats || []);
    } catch (err) {
        console.error("Chat history loading error:", err);
    } finally {
        setHistoryLoading(false);
    }
};

    const toggleTheme = () => {
        setDarkMode((previous) => !previous);
    };

    const handleLogout = () => {
        requestControllerRef.current?.abort();

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    // Start a completely new conversation.
    const startNewChat = () => {
        // Invalidate the previous conversation.
        chatSessionRef.current += 1;

        // Cancel any pending AI request.
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;

        // Reset the conversation.
        setMessages([]);
        setMessage("");
        setError("");
        setLoading(false);
        setActiveChatId(null);

        // Keep the selected project context.
        // This lets the next conversation continue using the same project.

        // Return focus to the input.
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    };

    const sendMessage = async (event) => {
        event?.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        const currentSession = chatSessionRef.current;
        const previousMessages = [...messages];

        let currentChatId = activeChatId;

        const userMessage = {
            role: "user",
            text: trimmedMessage,
        };

        setMessages((previous) => [...previous, userMessage]);
        setMessage("");
        setError("");
        setLoading(true);

        const controller = new AbortController();
        requestControllerRef.current = controller;

        try {
            const requestBody = {
                message: trimmedMessage,
                chatHistory: previousMessages.map((item) => ({
                    role: item.role,
                    text: item.text,
                })),
            };


            // Create a new chat if this is the first message.
if (!currentChatId) {
    const createResponse = await fetch(`${API_URL}/ai/chats`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            title: trimmedMessage.slice(0, 60),
            projectId: selectedProject || null,
        }),
        signal: controller.signal,
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
        throw new Error(
            createData.message || "Unable to create chat."
        );
    }

    currentChatId = createData.chat._id;

    if (currentSession === chatSessionRef.current) {
        setActiveChatId(currentChatId);
    }
}
   
            if (selectedProject) {
                requestBody.projectId = selectedProject;
            }

            const response = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to get an AI response."
                );
            }

            // Ignore responses belonging to an older chat.
            if (currentSession !== chatSessionRef.current) {
                return;
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "model",
                    text: data.reply || "I couldn't generate a response.",
                },
            ]);
      
            // Save the complete conversation in MongoDB.
const updatedMessages = [
    ...previousMessages,
    userMessage,
    {
        role: "model",
        text: data.reply || "I couldn't generate a response.",
    },
];

const saveResponse = await fetch(
    `${API_URL}/ai/chats/${currentChatId}`,
    {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            messages: updatedMessages,
            projectId: selectedProject || null,
        }),
    }
);

if (!saveResponse.ok) {
    console.error("Unable to save conversation.");
}

await fetchChatHistory();

        } catch (err) {
            if (err.name === "AbortError") {
                return;
            }

            if (currentSession === chatSessionRef.current) {
                setError(
                    err.message || "Something went wrong. Please try again."
                );
            }
        } finally {
            if (currentSession === chatSessionRef.current) {
                setLoading(false);
                requestControllerRef.current = null;
            }
        }
    };


const stopGeneration = () => {
    if (requestControllerRef.current) {
        requestControllerRef.current.abort();
        requestControllerRef.current = null;
    }

    setLoading(false);
};


const regenerateResponse = async () => {
    if (loading || messages.length < 2) {
        return;
    }

    // Find the most recent user message.
    const userMessageIndex = messages
        .map((item) => item.role)
        .lastIndexOf("user");

    if (userMessageIndex === -1) {
        return;
    }

    const lastUserMessage = messages[userMessageIndex];

    // Keep conversation history from before the last question.
    const previousMessages = messages.slice(0, userMessageIndex);

    // Remove the previous AI response, retaining the user's question.
    setMessages(messages.slice(0, userMessageIndex + 1));

    const token = localStorage.getItem("token");

    if (!token) {
        setError("Your session has expired. Please log in again.");
        return;
    }

    const currentSession = chatSessionRef.current;
    const controller = new AbortController();

    requestControllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
        const requestBody = {
            message: lastUserMessage.text,
            chatHistory: previousMessages.map((item) => ({
                role: item.role,
                text: item.text,
            })),
        };

        if (selectedProject) {
            requestBody.projectId = selectedProject;
        }

        const response = await fetch(`${API_URL}/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to regenerate the response."
            );
        }

        if (currentSession !== chatSessionRef.current) {
            return;
        }

        const regeneratedReply = data.reply || "I couldn't generate a response.";

const updatedMessages = [
    ...previousMessages,
    lastUserMessage,
    {
        role: "model",
        text: regeneratedReply,
    },
];

setMessages(updatedMessages);

// Save the regenerated conversation.
if (activeChatId) {
    const saveResponse = await fetch(
        `${API_URL}/ai/chats/${activeChatId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                messages: updatedMessages,
                projectId: selectedProject || null,
            }),
        }
    );

   const saveData = await saveResponse.json();

if (!saveResponse.ok) {
    console.error("Chat save failed:", saveData);
    throw new Error(
        saveData.message || "Unable to save conversation."
    );
}

console.log("Chat saved successfully:", saveData);

await fetchChatHistory();
console.log("Chat history refreshed.");

}
        
    } catch (err) {
        if (err.name !== "AbortError" &&
            currentSession === chatSessionRef.current) {
            setError(
                err.message || "Unable to regenerate. Please try again."
            );
        }
    } finally {
        if (currentSession === chatSessionRef.current) {
            setLoading(false);
            requestControllerRef.current = null;
        }
    }
};


    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage(event);
        }
    };

    const useSuggestion = (suggestion) => {
        setMessage(suggestion);
        textareaRef.current?.focus();
    };

    const formatMessage = (text = "") => {
        const parts = text.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const code = part
                    .replace(/^```[\w-]*\n?/, "")
                    .replace(/```$/, "");

                return (
                    <pre className="ai-code-block" key={index}>
                        <code>{code.trim()}</code>
                    </pre>
                );
            }

            return (
                <div className="ai-message-text" key={index}>
                    {part.split("\n").map((line, lineIndex) => (
                        <p key={lineIndex}>
                            {line || "\u00A0"}
                        </p>
                    ))}

                     {!loading &&
    messages.length >= 2 &&
    messages[messages.length - 1].role === "model" && (
        <button
            type="button"
            className="ai-regenerate-button"
            onClick={regenerateResponse}
        >
            ↻ Regenerate response
        </button>
    )}

                </div>
            );
        });
    };

    return (
        <div
            className={`ai-page ${
                darkMode ? "dark-theme" : "light-theme"
            } ${
                sidebarCollapsed ? "sidebar-collapsed" : "sidebar-open"
            }`}
        >
            {/* SIDEBAR - Same structure as Dashboard */}

            {!sidebarCollapsed && (
                <aside className="dashboard-sidebar">
                    <div className="sidebar-top-row">
                        <button
                            type="button"
                            className="sidebar-close-btn"
                            onClick={toggleSidebar}
                            title="Close Sidebar"
                            aria-label="Close Sidebar"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <div className="sidebar-brand">
                            <div className="sidebar-brand-text">
                                <span>CodeBlueprint</span>
                                <span>AI</span>
                            </div>
                        </div>
                    </div>

                    <nav className="dashboard-nav">
                        <div className="sidebar-section-title">
                            WORKSPACE
                        </div>

                        <Link to="/dashboard" className="sidebar-nav-item">
                            <span className="sidebar-icon">▦</span>
                            <span>Overview</span>
                        </Link>

                        <Link to="/projects" className="sidebar-nav-item">
                            <span className="sidebar-icon">▣</span>
                            <span>Projects</span>
                        </Link>

                        <Link
                            to="/create-project"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">＋</span>
                            <span>Create Project</span>
                        </Link>

                        <div className="sidebar-section-title">
                            CODE INSIGHTS
                        </div>

                        <Link to="/analysis" className="sidebar-nav-item">
                            <span className="sidebar-icon">◇</span>
                            <span>Code Analysis</span>
                        </Link>

                        <Link
                            to="/architecture"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">⌁</span>
                            <span>Architecture Diagram</span>
                        </Link>

                        <Link to="/security" className="sidebar-nav-item">
                            <span className="sidebar-icon">◉</span>
                            <span>Security Audit</span>
                        </Link>

                        <Link
                            to="/technical-debt"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">◈</span>
                            <span>Technical Debt</span>
                        </Link>

                        <div className="sidebar-section-title">
                            AI TOOLS
                        </div>

                        <Link
                            to="/ai-assistant"
                            className="sidebar-nav-item active"
                        >
                            <span className="sidebar-icon">✧</span>
                            <span>AI Assistant</span>
                        </Link>
                    </nav>

                    <div className="sidebar-bottom">
                        <div className="sidebar-divider"></div>

                        <button
                            type="button"
                            className="sidebar-nav-item"
                            onClick={toggleTheme}
                        >
                            <span className="sidebar-icon">
                                {darkMode ? "☀" : "☾"}
                            </span>
                            <span>
                                {darkMode ? "Light Mode" : "Dark Mode"}
                            </span>
                        </button>

                        <Link to="/profile" className="sidebar-nav-item">
                            <span className="sidebar-icon">⚙</span>
                            <span>Profile & Settings</span>
                        </Link>

                        <button
                            type="button"
                            className="sidebar-nav-item sidebar-logout"
                            onClick={handleLogout}
                        >
                            <span className="sidebar-icon">↪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* SAME COLLAPSED SIDEBAR BUTTON AS DASHBOARD */}

            {sidebarCollapsed && (
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    title="Open Sidebar"
                    aria-label="Open Sidebar"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}

            {/* MAIN CONTENT */}

            <main className="ai-main">
                <header className="ai-header">
                    <div>
                        <span className="ai-eyebrow">AI TOOLS</span>

                        <h1>AI Assistant</h1>

                        <p>
                            Your programming and project development assistant.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ai-new-chat"
                        onClick={startNewChat}
                    >
                        + New Chat
                    </button>
                </header>

                <section className="ai-workspace">

                 <div className="ai-history-section">
    <div className="ai-history-heading">
        <h3>Chat History</h3>
        <span>{chatHistory.length}</span>
    </div>

    {historyLoading ? (
        <p>Loading conversations...</p>
    ) : chatHistory.length === 0 ? (
        <p className="ai-history-empty">No previous conversations yet.</p>
    ) : (
        <div className="ai-history-list">
            {chatHistory.map((chat) => (
    <div
        key={chat._id}
        className={`ai-history-item ${
            activeChatId === chat._id ? "active" : ""
        }`}
    >
        <div
            className="ai-history-details"
            onClick={() => loadChat(chat._id)}
        >
            <span className="ai-history-title">
                {chat.title}
            </span>

            <span className="ai-history-preview">
                {chat.lastMessage || "No messages yet"}
            </span>
        </div>

        <div className="ai-history-actions">
            <button
                type="button"
                title="Rename chat"
                onClick={() => renameChat(chat)}
            >
                ✎
            </button>

            <button
                type="button"
                title="Delete chat"
                onClick={() => deleteChat(chat._id)}
            >
                🗑
            </button>
        </div>
    </div>
))}
        </div>
    )}
</div>

                    <div className="ai-chat-toolbar">
                        <div className="ai-project-selector">
                            <label htmlFor="project-select">
                                Project context
                            </label>

                            <select
                                id="project-select"
                                value={selectedProject}
                                onChange={(event) =>
                                    setSelectedProject(event.target.value)
                                }
                            >
                                <option value="">
                                    General programming chat
                                </option>

                                {projects.map((project) => (
                                    <option
                                        key={project._id}
                                        value={project._id}
                                    >
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <span className="ai-mode-indicator">
                            {selectedProject
                                ? "Project-specific mode"
                                : "General mode"}
                        </span>
                    </div>

                    {projectsLoading && (
                        <div className="ai-project-loading">
                            Loading your projects...
                        </div>
                    )}

                    {error && (
                        <div className="ai-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="ai-chat-area">
                        {messages.length === 0 ? (
                            <div className="ai-welcome">
                                <div className="ai-welcome-icon">✧</div>

                                <h2>How can I help you today?</h2>

                                <p>
                                    Ask programming questions, understand
                                    architecture, or get help with your project.
                                </p>

                                <div className="ai-suggestions">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            type="button"
                                            key={suggestion}
                                            onClick={() =>
                                                useSuggestion(suggestion)
                                            }
                                        >
                                            {suggestion}
                                            <span>↗</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="ai-messages">
                                {messages.map((item, index) => (
                                    <div
                                        className={`ai-message ${
                                            item.role === "user"
                                                ? "user-message"
                                                : "assistant-message"
                                        }`}
                                        key={`${chatSessionRef.current}-${index}`}
                                    >
                                        <div className="ai-avatar">
                                            {item.role === "user" ? "You" : "✧"}
                                        </div>

                                        <div className="ai-message-content">
                                            <div className="ai-message-role">
                                                {item.role === "user"
                                                    ? "You"
                                                    : "CodeBlueprint AI"}
                                            </div>

                                            <FormattedMessage text={item.text} />
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="ai-message assistant-message">
                                        <div className="ai-avatar">✧</div>

                                        <div className="ai-message-content">
                                            <div className="ai-message-role">
                                                CodeBlueprint AI
                                            </div>

                                            <div className="ai-typing">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <form className="ai-input-area" onSubmit={sendMessage}>
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about programming or your project..."
                            rows={2}
                            disabled={false}
                        />

                        <div className="ai-input-footer">
    <span>
        Enter to send · Shift + Enter for new line
    </span>

    <div className="ai-input-actions">
        {loading && (
            <button
                type="button"
                className="ai-stop-button"
                onClick={stopGeneration}
            >
                ■ Stop
            </button>
        )}

        <button
            type="submit"
            disabled={!message.trim() || loading}
        >
            {loading ? "Thinking..." : "Send ↗"}
        </button>
    </div>
     </div>
                    </form>

                    <p className="ai-disclaimer">
                        AI responses may contain mistakes. Review important code
                        and security recommendations before using them.
                    </p>
                </section>

                <footer className="ai-footer">
                    © 2026 CodeBlueprint AI. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default AIAssistant;
