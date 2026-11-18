import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/dashboard.css";
import "../styles/sidebar.css";
import "../styles/createProject.css";

const API_URL = "http://localhost:5000/api/projects";

const CreateProject = () => {
    const navigate = useNavigate();

    // Sidebar
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    // Theme
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme =
            localStorage.getItem("dashboardTheme");

        if (savedTheme) {
            return savedTheme === "dark";
        }

        return true;
    });

    // Project form
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");

    // File upload
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // Save theme
    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    // Sidebar controls
    const toggleSidebar = () => {
        setSidebarCollapsed(previous => !previous);
    };

    const toggleTheme = () => {
        setDarkMode(previous => !previous);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // Select files
    const handleFilesSelected = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 0) {
            setSelectedFiles(previous => [
                ...previous,
                ...files
            ]);

            setError("");
        }

        event.target.value = "";
    };

    // Remove individual file
    const removeFile = (indexToRemove) => {
        setSelectedFiles(previous =>
            previous.filter(
                (_, index) => index !== indexToRemove
            )
        );
    };

    // Clear all files
    const clearFiles = () => {
        setSelectedFiles([]);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Create project
    const handleCreateProject = async (event) => {
        event.preventDefault();

        setError("");

        if (!projectName.trim()) {
            setError("Please enter a project name.");
            return;
        }

        if (selectedFiles.length === 0) {
            setError("Please upload your project files or folder.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please login again.");
            navigate("/login");
            return;
        }

        try {
            setCreating(true);

            const formData = new FormData();

            formData.append("name", projectName.trim());
            formData.append("description", description.trim());
            formData.append("sourceType", "upload");

            selectedFiles.forEach(file => {
                formData.append(
                    "codeFiles",
                    file,
                    file.webkitRelativePath || file.name
                );
            });

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const responseText = await response.text();

            let result = {};

            try {
                result = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                throw new Error(
                    "Invalid response received from the server."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to create project."
                );
            }

            const createdProject =
                result.project || result;

            if (!createdProject._id) {
                throw new Error(
                    "Project created, but project ID was not received."
                );
            }

            navigate(`/projects/${createdProject._id}`);

        } catch (err) {
            console.error("Create project error:", err);

            setError(
                err.message ||
                "Something went wrong. Please try again."
            );

        } finally {
            setCreating(false);
        }
    };
    return (
        <div
            className={`dashboard-page ${
                darkMode ? "dark-theme" : "light-theme"
            } ${
                sidebarCollapsed
                    ? "sidebar-collapsed"
                    : "sidebar-open"
            }`}
        >

            {/* SIDEBAR */}

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

                        <Link
                            to="/dashboard"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">▦</span>
                            <span>Overview</span>
                        </Link>

                        <Link
                            to="/projects"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">▣</span>
                            <span>Projects</span>
                        </Link>

                        <Link
                            to="/create-project"
                            className="sidebar-nav-item active"
                        >
                            <span className="sidebar-icon">+</span>
                            <span>Create Project</span>
                        </Link>

                        <div className="sidebar-section-title">
                            CODE INSIGHTS
                        </div>

                        <Link
                            to="/analysis"
                            className="sidebar-nav-item"
                        >
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

                        <Link
                            to="/security"
                            className="sidebar-nav-item"
                        >
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
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ✧
                            </span>

                            <span>
                                AI Assistant
                            </span>
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
                                {darkMode
                                    ? "Light Mode"
                                    : "Dark Mode"}
                            </span>
                        </button>

                        <Link
                            to="/profile"
                            className="sidebar-nav-item"
                        >
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

            {/* OPEN SIDEBAR BUTTON */}

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

            <main className="dashboard-main">

                {/* PAGE HEADER */}

                <header className="dashboard-header">

                    <div>
                        <h1>Create New Project</h1>

                        <p>
                            Add your project details and upload your
                            codebase for analysis.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-theme-btn"
                        onClick={toggleTheme}
                        title={
                            darkMode
                                ? "Switch to Light Mode"
                                : "Switch to Dark Mode"
                        }
                    >
                        {darkMode ? "☀" : "☾"}
                    </button>

                </header>


                <form
                    className="create-project-form"
                    onSubmit={handleCreateProject}
                >

                    {/* PROJECT DETAILS */}

                    <section className="dashboard-section create-form-section">

                        <div className="section-heading">
                            <div>
                                <h2>Project Details</h2>

                                <p>
                                    Enter basic information about your project.
                                </p>
                            </div>
                        </div>

                        <div className="create-form-group">

                            <label htmlFor="projectName">
                                Project Name
                                <span className="required-mark">*</span>
                            </label>

                            <input
                                id="projectName"
                                type="text"
                                placeholder="Enter your project name"
                                value={projectName}
                                onChange={(event) =>
                                    setProjectName(event.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="create-form-group">

                            <label htmlFor="description">
                                Project Description
                            </label>

                            <textarea
                                id="description"
                                rows="4"
                                placeholder="Describe what your project does..."
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                            />

                        </div>

                    </section>


                    {/* UPLOAD CODEBASE */}

                    <section className="dashboard-section create-form-section">

                        <div className="section-heading">
                            <div>
                                <h2>Upload Codebase</h2>

                                <p>
                                    Select individual files or upload your
                                    complete project folder.
                                </p>
                            </div>
                        </div>

                        {/* File input */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={handleFilesSelected}
                        />

                        {/* Folder input */}

                        <input
                            ref={folderInputRef}
                            type="file"
                            multiple
                            hidden
                            webkitdirectory=""
                            directory=""
                            onChange={handleFilesSelected}
                        />

                        {/* Upload area */}

                        <div
                            className="create-upload-area"
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                        >

                            <div className="create-upload-icon">
                            <span className="upload-cloud-icon">☁</span>
                            <span className="upload-arrow-icon">↑</span></div>

                            <h3>Click to upload your files</h3>

                            <p>
                                Select multiple source code files
                                from your computer.
                            </p>

                            <span className="create-browse-btn">
                                Browse Files
                            </span>

                        </div>


                        {/* Folder selection */}

                        <button
                            type="button"
                            className="create-folder-btn"
                            onClick={() =>
                                folderInputRef.current?.click()
                            }
                        >
                            <i className="fas fa-folder-open"></i>

                            Or select an entire project folder
                        </button>


                        {/* SELECTED FILES */}

                        {selectedFiles.length > 0 && (

                            <div className="create-selected-files">

                                <div className="create-selected-header">

                                    <div>
                                        <h3>
                                            Selected Files ({selectedFiles.length})
                                        </h3>

                                        <p>
                                            Files ready to be uploaded.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="create-clear-btn"
                                        onClick={clearFiles}
                                    >
                                        Clear All
                                    </button>

                                </div>


                                <div className="create-file-list">

                                    {selectedFiles
                                        .slice(0, 8)
                                        .map((file, index) => (

                                            <div
                                                className="create-file-item"
                                                key={`${file.name}-${index}`}
                                            >

                                                <div className="create-file-icon">
                                                    <i className="fas fa-file-code"></i>
                                                </div>

                                                <div className="create-file-info">

                                                    <span className="create-file-name">
                                                        {file.webkitRelativePath ||
                                                            file.name}
                                                    </span>

                                                    <span className="create-file-size">
                                                        {formatFileSize(file.size)}
                                                    </span>

                                                </div>

                                                <button
                                                    type="button"
                                                    className="create-remove-file"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                    title="Remove file"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>

                                            </div>

                                        ))}

                                </div>


                                {selectedFiles.length > 8 && (
                                    <p className="create-more-files">
                                        + {selectedFiles.length - 8} more
                                        files selected
                                    </p>
                                )}

                            </div>

                        )}

                    </section>


                    {/* ERROR MESSAGE */}

                    {error && (
                        <div className="create-error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    {/* FORM ACTIONS */}

                    <div className="create-form-actions">

                        <Link
                            to="/projects"
                            className="create-cancel-btn"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="create-submit-btn"
                            disabled={creating}
                        >
                            {creating ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Creating Project...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus"></i>
                                    Create Project
                                </>
                            )}
                        </button>

                    </div>

                </form>


                {/* FOOTER */}

                <footer className="dashboard-footer">
                    <p>
                        © {new Date().getFullYear()} CodeBlueprint AI.
                        All rights reserved.
                    </p>
                </footer>

            </main>

        </div>
    );
};

export default CreateProject;