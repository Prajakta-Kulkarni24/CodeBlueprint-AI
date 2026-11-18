import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/securityAudit.css";
import "../styles/sidebar.css";

const SecurityAudit = () => {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] =
        useState(null);

    const [loading, setLoading] = useState(true);

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

                const projectList =
                    data.projects || [];

                setProjects(projectList);

                if (projectList.length > 0) {
                    setSelectedProject(
                        projectList[0]
                    );
                }
            } catch (error) {
                console.error(
                    "Security audit error:",
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

    const handleProjectChange = async (event) => {
        const projectId =
            event.target.value;

        if (!projectId) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/projects/${projectId}`,
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
                    "Failed to fetch project"
                );
            }

            setSelectedProject(
                data.project
            );
        } catch (error) {
            console.error(
                "Project security error:",
                error.message
            );
        }
    };

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

    /*
     * Security analysis data
     *
     * This follows the same structure used
     * by Code Analysis and Architecture Diagram.
     */
    const security =
        selectedProject?.analysis?.security ||
        selectedProject?.security ||
        {};

    const issues =
        security?.issues ||
        security?.findings ||
        [];

    const securityIssueCount =
        selectedProject?.securityIssues ||
        issues.length ||
        0;

    const criticalCount = issues.filter(
        issue =>
            String(
                issue.severity || ""
            ).toLowerCase() === "critical"
    ).length;

    const highCount = issues.filter(
        issue =>
            String(
                issue.severity || ""
            ).toLowerCase() === "high"
    ).length;

    const mediumCount = issues.filter(
        issue =>
            String(
                issue.severity || ""
            ).toLowerCase() === "medium"
    ).length;

    const lowCount = issues.filter(
        issue =>
            String(
                issue.severity || ""
            ).toLowerCase() === "low"
    ).length;

    return (
        <div
            className={`security-page ${
                darkMode
                    ? "dark-theme"
                    : "light-theme"
            }`}
        >
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
                            <span className="sidebar-icon">
                                ▦
                            </span>
                            <span>Overview</span>
                        </Link>

                        <Link
                            to="/projects"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ▣
                            </span>
                            <span>Projects</span>
                        </Link>

                        <Link
                            to="/create-project"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                +
                            </span>
                            <span>Create Project</span>
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
                            <span>Code Analysis</span>
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
                            className="sidebar-nav-item active"
                        >
                            <span className="sidebar-icon">
                                ◉
                            </span>
                            <span>Security Audit</span>
                        </Link>

                        <Link
                            to="/technical-debt"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◈
                            </span>
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

                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

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

            <main className="security-main">

                {/* Header */}

                <header className="security-header">
                    <div>
                        <h1>Security Audit</h1>

                        <p>
                            Identify security risks,
                            vulnerabilities, and
                            potential weaknesses
                            in your codebase.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="security-theme-btn"
                        onClick={toggleTheme}
                    >
                        {darkMode
                            ? "☀"
                            : "☾"}
                    </button>
                </header>

                {loading ? (
                    <div className="security-empty">
                        <div className="security-empty-icon">
                            ◉
                        </div>

                        <h3>
                            Loading security analysis...
                        </h3>

                        <p>
                            Fetching your project
                            security information.
                        </p>
                    </div>
                ) : projects.length === 0 ? (
                    /*
                     * Only show this when the user
                     * genuinely has no projects.
                     */
                    <div className="security-empty">
                        <div className="security-empty-icon">
                            ◉
                        </div>

                        <h3>
                            No projects yet
                        </h3>

                        <p>
                            Create or upload a project
                            to start your security audit.
                        </p>

                        <Link
                            to="/create-project"
                            className="security-create-btn"
                        >
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Project Selector */}

                        <section className="security-project-bar">
                            <div>
                                <span>
                                    Current Project
                                </span>

                                <h2>
                                    {selectedProject?.name}
                                </h2>
                            </div>

                            <select
                                value={
                                    selectedProject?._id ||
                                    ""
                                }
                                onChange={
                                    handleProjectChange
                                }
                            >
                                {projects.map(
                                    project => (
                                        <option
                                            key={
                                                project._id
                                            }
                                            value={
                                                project._id
                                            }
                                        >
                                            {project.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </section>

                        {/* Security Summary */}

                        <section className="security-summary">

                            <div className="security-card">
                                <span>
                                    Total Issues
                                </span>

                                <strong>
                                    {securityIssueCount}
                                </strong>

                                <small>
                                    Security findings
                                </small>
                            </div>

                            <div className="security-card critical-card">
                                <span>
                                    Critical
                                </span>

                                <strong>
                                    {criticalCount}
                                </strong>

                                <small>
                                    Critical severity
                                </small>
                            </div>

                            <div className="security-card high-card">
                                <span>
                                    High
                                </span>

                                <strong>
                                    {highCount}
                                </strong>

                                <small>
                                    High severity
                                </small>
                            </div>

                            <div className="security-card medium-card">
                                <span>
                                    Medium
                                </span>

                                <strong>
                                    {mediumCount}
                                </strong>

                                <small>
                                    Medium severity
                                </small>
                            </div>

                            <div className="security-card low-card">
                                <span>
                                    Low
                                </span>

                                <strong>
                                    {lowCount}
                                </strong>

                                <small>
                                    Low severity
                                </small>
                            </div>

                        </section>

                        {/* Findings */}

                        <section className="security-section">
                            <div className="security-section-heading">
                                <div>
                                    <h2>
                                        Security Findings
                                    </h2>

                                    <p>
                                        Review security
                                        issues detected
                                        during code analysis.
                                    </p>
                                </div>
                            </div>

                            {issues.length === 0 ? (
                                <div className="security-no-findings">
                                    <div>
                                        ✓
                                    </div>

                                    <h3>
                                        No security issues
                                        detected
                                    </h3>

                                    <p>
                                        No security findings
                                        are currently
                                        available for this
                                        project.
                                    </p>
                                </div>
                            ) : (
                                <div className="security-findings-list">
                                    {issues.map(
                                        (
                                            issue,
                                            index
                                        ) => (
                                            <div
                                                className="security-finding"
                                                key={
                                                    issue.id ||
                                                    index
                                                }
                                            >
                                                <div className="finding-icon">
                                                    !
                                                </div>

                                                <div className="finding-content">

                                                    <div className="finding-top">
                                                        <h3>
                                                            {issue.title ||
                                                                issue.name ||
                                                                "Security Issue"}
                                                        </h3>

                                                        <span
                                                            className={`severity-badge ${
                                                                String(
                                                                    issue.severity ||
                                                                        "medium"
                                                                ).toLowerCase()
                                                            }`}
                                                        >
                                                            {issue.severity ||
                                                                "Medium"}
                                                        </span>
                                                    </div>

                                                    <p>
                                                        {issue.description ||
                                                            issue.message ||
                                                            "Security finding detected during analysis."}
                                                    </p>

                                                    {issue.file && (
                                                        <span className="finding-file">
                                                            File:{" "}
                                                            {
                                                                issue.file
                                                            }
                                                        </span>
                                                    )}

                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}

                <footer className="security-footer">
                    © 2026 CodeBlueprint AI.
                    All rights reserved.
                </footer>

            </main>
        </div>
    );
};

export default SecurityAudit;