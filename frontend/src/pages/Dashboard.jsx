import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/dashboard.css";
import "../styles/sidebar.css";

const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

     // Calculate total uploaded files across all projects
const totalFiles = projects.reduce(
    (total, project) => total + (project.fileCount || 0),
    0
);

// Count unique programming and markup languages
// Exclude Images because it is not a programming language
const languages = new Set();

projects.forEach((project) => {
    const languageCounts =
        project.analysis?.languageCounts || {};

    Object.keys(languageCounts).forEach((language) => {
        if (language !== "Images" && language !== "Asset") {
            languages.add(language);
        }
    });

    // Include the primary language if no breakdown exists
    if (
        Object.keys(languageCounts).length === 0 &&
        project.language &&
        project.language !== "Unknown"
    ) {
        languages.add(project.language);
    }
});

const totalLanguages = languages.size;

// Calculate total security issues
const totalSecurityIssues = projects.reduce(
    (total, project) => total + (project.securityIssues || 0),
    0
);

// Calculate total technical debt
const totalTechnicalDebt = projects.reduce(
    (total, project) => total + (project.technicalDebtScore || 0),
    0
);

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme =
            localStorage.getItem("dashboardTheme");

        if (savedTheme) {
            return savedTheme === "dark";
        }

        return true;
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/projects",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch projects"
                    );
                }

                setProjects(
                    data.projects || []
                );
            } catch (error) {
                console.error(
                    "Dashboard project error:",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const toggleSidebar = () => {
        setSidebarCollapsed(
            previous => !previous
        );
    };

    const toggleTheme = () => {
        setDarkMode(
            previous => !previous
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    return (
        <div
            className={`dashboard-page ${
                darkMode
                    ? "dark-theme"
                    : "light-theme"
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

                                <span>
                                    CodeBlueprint
                                </span>

                                <span>
                                    AI
                                </span>

                            </div>

                        </div>

                    </div>


                    <nav className="dashboard-nav">

                        <div className="sidebar-section-title">
                            WORKSPACE
                        </div>


                        <Link
                            to="/dashboard"
                            className="sidebar-nav-item active"
                        >
                            <span className="sidebar-icon">
                                ▦
                            </span>

                            <span>
                                Overview
                            </span>
                        </Link>


                        <Link
                            to="/projects"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ▣
                            </span>

                            <span>
                                Projects
                            </span>
                        </Link>


                        <Link
                            to="/create-project"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                +
                            </span>

                            <span>
                                Create Project
                            </span>
                        </Link>


                        <div className="sidebar-section-title">
                            CODE INSIGHTS
                        </div>


                        <Link
                            to="/analysis"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◇
                            </span>

                            <span>
                                Code Analysis
                            </span>
                        </Link>


                        <Link
                            to="/architecture"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ⌁
                            </span>

                            <span>
                                Architecture Diagram
                            </span>
                        </Link>


                        <Link
                            to="/security"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◉
                            </span>

                            <span>
                                Security Audit
                            </span>
                        </Link>


                        <Link
                            to="/technical-debt"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◈
                            </span>

                            <span>
                                Technical Debt
                            </span>
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
                                {darkMode
                                    ? "☀"
                                    : "☾"}
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
                            <span className="sidebar-icon">
                                ⚙
                            </span>

                            <span>
                                Profile & Settings
                            </span>
                        </Link>


                        <button
                            type="button"
                            className="sidebar-nav-item sidebar-logout"
                            onClick={handleLogout}
                        >
                            <span className="sidebar-icon">
                                ↪
                            </span>

                            <span>
                                Logout
                            </span>
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


            {/* MAIN */}

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>

                        <h1>
                            Overview
                        </h1>

                        <p>
                            Monitor your codebases,
                            architecture, quality,
                            and security from one place.
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
                        {darkMode
                            ? "☀"
                            : "☾"}
                    </button>

                </header>


                <section className="dashboard-stats">

                    <div className="stat-card">
                        <span className="stat-title">
                            Total Projects
                        </span>

                        <strong>
                            {projects.length}
                        </strong>

                        <p>
                            Projects analyzed
                        </p>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Total Files
                        </span>

                        <strong>
                            {totalFiles}
                        </strong>

                        <p>
                            Source files analyzed
                        </p>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Languages
                        </span>

                        <strong>
                            {totalLanguages}
                        </strong>

                        <p>
                            Programming languages
                        </p>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Security Issues
                        </span>

                        <strong>
                            {totalSecurityIssues}
                        </strong>

                        <p>
                            Issues detected
                        </p>
                    </div>

                </section>


                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Projects
                            </h2>

                            <p>
                                Your recently created
                                and analyzed projects
                            </p>

                        </div>


                        <Link to="/projects">
                            View All
                        </Link>

                    </div>


                    {loading ? (

                        <div className="empty-projects">

                            <p>
                                Loading projects...
                            </p>

                        </div>

                    ) : projects.length === 0 ? (

                        <div className="empty-projects">

                            <div className="empty-icon">
                                ⌘
                            </div>

                            <h3>
                                No projects yet
                            </h3>

                            <p>
                                Create or upload your first
                                project to start analyzing
                                your codebase.
                            </p>

                            <Link
                                to="/create-project"
                                className="create-project-btn"
                            >
                                Create Project
                            </Link>

                        </div>

                    ) : (

                        <div className="recent-projects-list">

                            {projects
                                .slice(0, 5)
                                .map((project) => (

                                    <div
                                        className="project-card"
                                        key={project._id}
                                    >

                                        <div className="project-card-info">

                                            <h3>
                                                {project.name}
                                            </h3>

                                            <p>
                                                {project.description ||
                                                    "No description provided"}
                                            </p>

                                        </div>


                                        <div className="project-card-meta">

                                            <span>
                                                {project.language ||
                                                    "Unknown"}
                                            </span>

                                            <span>
                                                {project.status ||
                                                    "Created"}
                                            </span>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Codebase Health
                            </h2>

                            <p>
                                Overview of your project's
                                technical health
                            </p>

                        </div>

                    </div>


                    <div className="health-card">

                        <div className="health-item">

                            <span>
                                Technical Debt
                            </span>

                            <strong>
                                {totalTechnicalDebt}
                            </strong>

                        </div>


                        <div className="health-item">

                            <span>
                                Security Issues
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>


<div className="health-item">

    <span>
        Analysis Status
    </span>

    <strong>
        {projects.length > 0
            ? projects[0].status || "Created"
            : "No Data"}
    </strong>

</div>

                    </div>

                </section>


                <footer className="dashboard-footer">

                    © 2026 CodeBlueprint AI.
                    All rights reserved.

                </footer>

            </main>

        </div>
    );
};

export default Dashboard;