import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/dashboard.css";
import "../styles/technicalDebt.css";
import "../styles/sidebar.css";

const API_URL = "http://localhost:5000/api/projects";

const TechnicalDebt = () => {
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [projectLoading, setProjectLoading] =
        useState(false);

    const [error, setError] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return (
            localStorage.getItem("dashboardTheme") !==
            "light"
        );
    });

    // =====================================
    // THEME
    // =====================================

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(previous => !previous);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(previous => !previous);
    };

    // =====================================
    // AUTHENTICATION
    // =====================================

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            throw new Error(
                "Your session has expired. Please login again."
            );
        }

        return {
            Authorization: `Bearer ${token}`,
        };
    };

    // =====================================
    // FETCH COMPLETE PROJECT DETAILS
    // =====================================

    const fetchProjectDetails = async (projectId) => {
        const response = await fetch(
            `${API_URL}/${projectId}`,
            {
                headers: getAuthHeaders(),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to fetch project details."
            );
        }

        return data.project || data;
    };

    // =====================================
    // FETCH ALL PROJECTS
    // =====================================

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    API_URL,
                    {
                        headers: getAuthHeaders(),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch projects."
                    );
                }

                const projectList =
                    data.projects || [];

                setProjects(projectList);

                if (projectList.length > 0) {
                    const completeProject =
                        await fetchProjectDetails(
                            projectList[0]._id
                        );

                    setSelectedProject(completeProject);
                } else {
                    setSelectedProject(null);
                }

            } catch (err) {
                console.error(
                    "Technical debt error:",
                    err
                );

                setError(err.message);

            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // =====================================
    // CHANGE PROJECT
    // =====================================

    const handleProjectChange = async (event) => {
        const projectId = event.target.value;

        if (!projectId) return;

        try {
            setProjectLoading(true);
            setError("");

            const project =
                await fetchProjectDetails(projectId);

            setSelectedProject(project);

        } catch (err) {
            console.error(
                "Project selection error:",
                err
            );

            setError(err.message);

        } finally {
            setProjectLoading(false);
        }
    };

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // =====================================
    // TECHNICAL DEBT DATA
    // =====================================

    const analysis =
        selectedProject?.analysis || {};

    const metrics =
        analysis.metrics || analysis;

    const technicalDebt =
        analysis.technicalDebt ||
        selectedProject?.technicalDebt ||
        {};

    const debtScore =
        selectedProject?.technicalDebtScore ??
        technicalDebt.score ??
        null;

    const issues =
        technicalDebt.issues ||
        technicalDebt.findings ||
        [];

    const totalLines =
        metrics.totalLines ??
        analysis.totalLines ??
        null;

    const commentLines =
        metrics.commentLines ??
        analysis.commentLines ??
        null;

    const nonEmptyLines =
        metrics.nonEmptyLines ??
        analysis.nonEmptyLines ??
        null;

    const codeDensity =
    metrics.codeDensity ??
    (
        totalLines !== null &&
        totalLines > 0 &&
        nonEmptyLines !== null
            ? Number(
                ((nonEmptyLines / totalLines) * 100).toFixed(2)
            )
            : null
    );

    const complexity =
    technicalDebt.complexityLevel ??
    metrics.complexityLevel ??
    technicalDebt.complexity ??
    metrics.complexity ??
    "Not calculated";

    const fileCount =
        selectedProject?.fileCount ??
        selectedProject?.files?.length ??
        null;

    const language =
        selectedProject?.language ||
        analysis.language ||
        "Unknown";

    const hasAnalysis =
        Object.keys(analysis).length > 0;

    const formatValue = (value) => {
        if (value === null || value === undefined) {
            return "N/A";
        }

        return value;
    };

    const formatPercentage = (value) => {
        if (value === null || value === undefined) {
            return "N/A";
        }

        return `${Math.round(Number(value))}%`;
    };
    return (
        <div
            className={`dashboard-page technical-debt-page ${
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
                            className="sidebar-nav-item"
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
                            className="sidebar-nav-item active"
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
                        <h1>Technical Debt & Risk</h1>

                        <p>
                            Understand code complexity,
                            maintainability risks, and
                            areas that need improvement.
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
                {/* PROJECT CONTENT */}

                {loading ? (

                    <div className="technical-debt-empty">
                        <div className="technical-debt-empty-icon">
                            ◈
                        </div>

                        <h3>Loading technical debt...</h3>

                        <p>
                            Fetching project quality and
                            maintainability information.
                        </p>
                    </div>

                ) : error ? (

                    <div className="technical-debt-empty">
                        <div className="technical-debt-empty-icon">
                            !
                        </div>

                        <h3>Unable to load project data</h3>

                        <p>{error}</p>

                        <button
                            type="button"
                            className="technical-debt-create-btn"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>

                ) : projects.length === 0 ? (

                    <div className="technical-debt-empty">
                        <div className="technical-debt-empty-icon">
                            ◈
                        </div>

                        <h3>No projects yet</h3>

                        <p>
                            Create or upload a project to
                            view its technical debt analysis.
                        </p>

                        <Link
                            to="/create-project"
                            className="technical-debt-create-btn"
                        >
                            Create Project
                        </Link>
                    </div>

                ) : (

                    <>
                        {/* PROJECT SELECTOR */}

                        <section className="technical-debt-project-bar">

                            <div>
                                <span>Current Project</span>

                                <h2>
                                    {selectedProject?.name ||
                                        "Select a project"}
                                </h2>
                            </div>

                            <select
                                value={selectedProject?._id || ""}
                                onChange={handleProjectChange}
                                disabled={projectLoading}
                            >
                                {projects.map(project => (
                                    <option
                                        key={project._id}
                                        value={project._id}
                                    >
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                        </section>


                        {/* PROJECT LOADING */}

                        {projectLoading ? (

                            <div className="technical-debt-empty">
                                <h3>Loading project analysis...</h3>
                                <p>Please wait while we fetch the details.</p>
                            </div>

                        ) : (

                            <>

                                {/* SUMMARY CARDS */}

                                <section className="technical-debt-summary">

                                    <div className="technical-debt-card">
                                        <div className="technical-debt-card-top">
                                            <span>Debt Score</span>
                                            <span className="debt-card-icon">◈</span>
                                        </div>

                                        <strong>
                                            {formatValue(debtScore)}
                                        </strong>

                                        <small>
                                            Technical debt score
                                        </small>
                                    </div>


                                    <div className="technical-debt-card">
                                        <div className="technical-debt-card-top">
                                            <span>Total Lines</span>
                                            <span className="debt-card-icon">≡</span>
                                        </div>

                                        <strong>
                                            {formatValue(totalLines)}
                                        </strong>

                                        <small>
                                            Lines in codebase
                                        </small>
                                    </div>


                                    <div className="technical-debt-card">
                                        <div className="technical-debt-card-top">
                                            <span>Code Density</span>
                                            <span className="debt-card-icon">▤</span>
                                        </div>

                                        <strong>
                                            {formatPercentage(codeDensity)}
                                        </strong>

                                        <small>
                                            Non-empty code density
                                        </small>
                                    </div>


                                    <div className="technical-debt-card">
                                        <div className="technical-debt-card-top">
                                            <span>Complexity</span>
                                            <span className="debt-card-icon">⌘</span>
                                        </div>

                                        <strong>
                                            {formatValue(complexity)}
                                        </strong>

                                        <small>
                                            Complexity indicator
                                        </small>
                                    </div>

                                </section>


                                {/* ANALYSIS AVAILABILITY */}

                                {!hasAnalysis && (
                                    <div className="technical-debt-notice">
                                        <strong>Analysis data unavailable</strong>

                                        <p>
                                            Detailed analysis has not been
                                            generated or saved for this project.
                                            The metrics below will appear when
                                            the backend provides them.
                                        </p>
                                    </div>
                                )}


                                {/* CODE HEALTH */}

                                <section className="technical-debt-section">

                                    <div className="technical-debt-section-heading">
                                        <div>
                                            <h2>Code Health</h2>

                                            <p>
                                                Key indicators affecting
                                                code maintainability.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="health-grid">

                                        <div className="health-item">
                                            <span>Non-empty Lines</span>

                                            <strong>
                                                {formatValue(nonEmptyLines)}
                                            </strong>
                                        </div>


                                        <div className="health-item">
                                            <span>Comment Lines</span>

                                            <strong>
                                                {formatValue(commentLines)}
                                            </strong>
                                        </div>


                                        <div className="health-item">
                                            <span>Project Files</span>

                                            <strong>
                                                {formatValue(fileCount)}
                                            </strong>
                                        </div>


                                        <div className="health-item">
                                            <span>Primary Language</span>

                                            <strong>
                                                {language}
                                            </strong>
                                        </div>

                                    </div>

                                </section>
                                <section className="technical-debt-section">
                                    <div className="section-heading">
                                        <div>
                                            <h2>Risk Areas</h2>
                                            <p>
                                                Review detected issues that may affect code quality
                                                and maintainability.
                                            </p>
                                        </div>
                                    </div>

                                    {!hasAnalysis ? (
                                        <div className="no-debt-findings">
                                            <div className="finding-empty-icon">!</div>
                                            <h3>Findings unavailable</h3>
                                            <p>
                                                Backend has not saved technical-debt findings
                                                for this project yet.
                                            </p>
                                        </div>
                                    ) : issues.length === 0 ? (
                                        <div className="no-debt-findings">
                                            <div className="finding-empty-icon">✓</div>
                                            <h3>No technical debt findings</h3>
                                            <p>
                                                No findings were returned by the current analysis.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="debt-findings-list">
                                            {issues.map((issue, index) => (
                                                <div
                                                    className="debt-finding"
                                                    key={issue.id || index}
                                                >
                                                    <div className="debt-finding-icon">
                                                        ◈
                                                    </div>

                                                    <div className="debt-finding-content">
                                                        <h3>
                                                            {issue.title ||
                                                                issue.name ||
                                                                "Technical Debt Issue"}
                                                        </h3>

                                                        <p>
                                                            {issue.description ||
                                                                issue.message ||
                                                                "Potential maintainability issue detected during analysis."}
                                                        </p>

                                                        {issue.file && (
                                                            <span>
                                                                File: {issue.file}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {issue.severity && (
                                                        <span
                                                            className={`debt-severity ${String(
                                                                issue.severity
                                                            ).toLowerCase()}`}
                                                        >
                                                            {issue.severity}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}

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

export default TechnicalDebt;