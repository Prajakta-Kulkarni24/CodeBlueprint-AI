import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";

import "../styles/codeAnalysis.css";
import "../styles/sidebar.css";

const CodeAnalysis = () => {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme =
            localStorage.getItem("dashboardTheme");

        if (savedTheme) {
            return savedTheme === "dark";
        }

        return true;
    });

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] =
        useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

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
                    "Code analysis error:",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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

    const handleProjectChange = async (
        event
    ) => {
        const projectId =
            event.target.value;

        const project =
            projects.find(
                item =>
                    item._id === projectId
            );

        if (!project) {
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
                    "Failed to load project"
                );
            }

            setSelectedProject(
                data.project
            );
        } catch (error) {
            console.error(
                "Project analysis error:",
                error.message
            );

            setSelectedProject(project);
        }
    };

const analysis =
    selectedProject?.analysis || {};

const metrics =
    analysis.metrics || {};

const language =
    selectedProject?.language ||
    "Unknown";

const totalLines =
    metrics.totalLines ??
    analysis.totalLines ??
    selectedProject?.codeLines ??
    0;

const nonEmptyLines =
    metrics.nonEmptyLines ??
    analysis.nonEmptyLines ??
    0;

const commentLines =
    metrics.commentLines ??
    analysis.commentLines ??
    0;

const codeDensity =
    metrics.codeDensity ??
    (
        nonEmptyLines !== null &&
        commentLines !== null &&
        nonEmptyLines >= commentLines &&
        nonEmptyLines > 0
            ? Number(
                (
                    ((nonEmptyLines - commentLines) /
                        nonEmptyLines) * 100
                ).toFixed(2)
            )
            : null
    );
    
const languageCounts =
    analysis.languageCounts ||
    {};

    return (
        <div
            className={`code-analysis-page ${
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
                            className="sidebar-nav-item"
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
                            className="sidebar-nav-item active"
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

            <main className="code-analysis-main">

                <header className="code-analysis-header">

                    <div>

                        <h1>
                            Code Analysis
                        </h1>

                        <p>
                            Analyze code structure,
                            metrics, and quality
                            across your projects.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="code-analysis-theme-btn"
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


                {/* PROJECT SELECTOR */}

                <section className="analysis-project-selector">

                    <div>

                        <span>
                            Select Project
                        </span>

                        <p>
                            Choose a project to
                            view its code analysis.
                        </p>

                    </div>


                    <select
                        value={
                            selectedProject?._id ||
                            ""
                        }
                        onChange={
                            handleProjectChange
                        }
                        disabled={
                            loading ||
                            projects.length === 0
                        }
                    >

                        {projects.length === 0 ? (
                            <option value="">
                                No projects available
                            </option>
                        ) : (
                            projects.map(
                                project => (
                                    <option
                                        key={
                                            project._id
                                        }
                                        value={
                                            project._id
                                        }
                                    >
                                        {
                                            project.name
                                        }
                                    </option>
                                )
                            )
                        )}

                    </select>

                </section>


                {loading ? (

                    <div className="analysis-empty">

                        <p>
                            Loading analysis...
                        </p>

                    </div>

                ) : !selectedProject ? (

                    <div className="analysis-empty">

                        <div className="analysis-empty-icon">
                            ◇
                        </div>

                        <h2>
                            No project available
                        </h2>

                        <p>
                            Create a project and
                            upload source code to
                            start code analysis.
                        </p>

                        <Link
                            to="/create-project"
                            className="analysis-create-btn"
                        >
                            Create Project
                        </Link>

                    </div>

                ) : (

                    <>

                        {/* PROJECT SUMMARY */}

                        <section className="analysis-project-card">

                            <div>

                                <span className="analysis-label">
                                    ANALYZING PROJECT
                                </span>

                                <h2>
                                    {
                                        selectedProject.name
                                    }
                                </h2>

                                <p>
                                    {
                                        selectedProject.description ||
                                        "No description provided."
                                    }
                                </p>

                            </div>


                            <div className="analysis-project-status">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {
                                        selectedProject.status ||
                                        "created"
                                    }
                                </strong>

                            </div>

                        </section>


                        {/* METRICS */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">

                                <div>

                                    <h2>
                                        Code Metrics
                                    </h2>

                                    <p>
                                        Quantitative
                                        information about
                                        the analyzed code.
                                    </p>

                                </div>

                            </div>


                            <div className="analysis-metrics-grid">

                                <div className="analysis-metric-card">

                                    <span>
                                        Language
                                    </span>

                                    <strong>
                                        {language}
                                    </strong>

                                </div>


                                <div className="analysis-metric-card">

                                    <span>
                                        Total Lines
                                    </span>

                                    <strong>
                                        {totalLines}
                                    </strong>

                                </div>


                                <div className="analysis-metric-card">

                                    <span>
                                        Non-Empty Lines
                                    </span>

                                    <strong>
                                        {nonEmptyLines}
                                    </strong>

                                </div>


                                <div className="analysis-metric-card">

                                    <span>
                                        Comment Lines
                                    </span>

                                    <strong>
                                        {commentLines}
                                    </strong>

                                </div>


                                <div className="analysis-metric-card">

                                    <span>
                                        Code Density
                                    </span>

                                    <strong>
                           {codeDensity !== null
                          ? `${Math.round(Number(codeDensity))}%`
                           : "N/A"}
                                  </strong>

                                </div>


                                <div className="analysis-metric-card">

                                    <span>
                                        Files
                                    </span>

                                    <strong>
                                        {
                                            selectedProject.fileCount ||
                                            0
                                        }
                                    </strong>

                                </div>

                            </div>

                        </section>

{Object.keys(languageCounts).length > 0 && (
    <div className="analysis-language-breakdown">

        <div className="analysis-section-heading">
            <div>
                <h2>
                    Language Breakdown
                </h2>

                <p>
                    Programming and markup languages
                    detected in your codebase.
                </p>
            </div>
        </div>

        <div className="analysis-language-grid">

            {Object.entries(languageCounts)
    .map(
        ([languageName, count]) => (
                    <div
                        className="analysis-language-card"
                        key={languageName}
                    >
                        <span>
                            {languageName}
                        </span>

                        <strong>
                            {count}
                        </strong>

                        <small>
                            {count === 1
                                ? "file"
                                : "files"}
                        </small>
                    </div>
                )
            )}

        </div>

    </div>
)}

                        {/* ANALYSIS DETAILS */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">

                                <div>

                                    <h2>
                                        Analysis Details
                                    </h2>

                                    <p>
                                        Current analysis
                                        information for
                                        this project.
                                    </p>

                                </div>

                            </div>


                            <div className="analysis-details-grid">

                                <div className="analysis-detail-card">

                                    <span>
                                        Source Type
                                    </span>

                                    <strong>
                                        {
                                            selectedProject.sourceType ||
                                            "upload"
                                        }
                                    </strong>

                                </div>


                                <div className="analysis-detail-card">

                                    <span>
                                        Analysis Status
                                    </span>

                                    <strong>
                                        {
                                            selectedProject.status ||
                                            "created"
                                        }
                                    </strong>

                                </div>


                                <div className="analysis-detail-card">

                                    <span>
                                        Technical Debt
                                    </span>

                                    <strong>
                                        {
                                            selectedProject.technicalDebtScore ||
                                            0
                                        }
                                    </strong>

                                </div>


                                <div className="analysis-detail-card">

                                    <span>
                                        Security Issues
                                    </span>

                                    <strong>
                                        {
                                            selectedProject.securityIssues ||
                                            0
                                        }
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </>

                )}


                <footer className="code-analysis-footer">

                    © 2026 CodeBlueprint AI.
                    All rights reserved.

                </footer>

            </main>

        </div>
    );
};

export default CodeAnalysis;