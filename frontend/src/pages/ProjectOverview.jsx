
import React, { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import "../styles/projectOverview.css";
import "../styles/sidebar.css";

const ProjectOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("dashboardTheme") !== "light";
    });

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    `http://localhost:5000/api/projects/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load project."
                    );
                }

                setProject(data.project || data);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id, navigate]);

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((previous) => !previous);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed((previous) => !previous);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const handleDelete = async () => {
        if (!window.confirm(
            "Are you sure you want to delete this project? This action cannot be undone."
        )) {
            return;
        }

        try {
            setDeleting(true);

            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/api/projects/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete project."
                );
            }

            navigate("/projects");
        } catch (err) {
            window.alert(err.message || "Unable to delete project.");
        } finally {
            setDeleting(false);
        }
    };

    const analysis = project?.analysis || {};
    const metrics = analysis.metrics || analysis;
    const security = analysis.security || {};
    const technicalDebt =
        analysis.technicalDebt || project?.technicalDebt || {};

    const totalLines = metrics.totalLines ?? 0;
const nonEmptyLines = metrics.nonEmptyLines ?? 0;
const commentLines = metrics.commentLines ?? 0;

const codeDensity =
    metrics.codeDensity ??
    (
        nonEmptyLines > 0 &&
        commentLines >= 0 &&
        nonEmptyLines >= commentLines
            ? Number(
                (
                    ((nonEmptyLines - commentLines) /
                        nonEmptyLines) * 100
                ).toFixed(2)
            )
            : null
    );

const formattedCodeDensity =
    codeDensity !== null
        ? `${Math.round(Number(codeDensity))}%`
        : "N/A";

    const securityIssues =
        security.issues || security.findings || [];

    const securityCount =
        project?.securityIssues ?? securityIssues.length;

    const debtScore =
        project?.technicalDebtScore ??
        technicalDebt.score ??
        0;

    const status = project?.status || "created";

    const createdDate = project?.createdAt
        ? new Date(project.createdAt).toLocaleDateString(
              undefined,
              {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              }
          )
        : "Not available";

    const statusLabel = status.charAt(0).toUpperCase() +
        status.slice(1);

    return (
        <div
            className={`project-overview-page ${
                darkMode ? "dark-theme" : "light-theme"
            } ${
                sidebarCollapsed
                    ? "sidebar-collapsed"
                    : "sidebar-open"
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
                            className="sidebar-nav-item active"
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
                                {darkMode ? "Light Mode" : "Dark Mode"}
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

            <main className="project-overview-main">
                <header className="project-overview-header">
                    <div>
                        <Link
                            to="/projects"
                            className="overview-back-link"
                        >
                            ← Back to Projects
                        </Link>
                        <h1>Project Overview</h1>
                        <p>
                            Explore your project's codebase,
                            quality, architecture, and security.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="overview-theme-btn"
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

                {loading ? (
                    <div className="overview-state">
                        <div className="overview-loader"></div>
                        <p>Loading project details...</p>
                    </div>
                ) : error ? (
                    <div className="overview-state">
                        <div className="overview-state-icon">!</div>
                        <h2>Unable to load project</h2>
                        <p>{error}</p>
                        <Link
                            to="/projects"
                            className="overview-primary-btn"
                        >
                            Back to Projects
                        </Link>
                    </div>
                ) : !project ? (
                    <div className="overview-state">
                        <h2>Project not found</h2>
                        <p>
                            This project may have been deleted
                            or may not be available to your account.
                        </p>
                        <Link
                            to="/projects"
                            className="overview-primary-btn"
                        >
                            Back to Projects
                        </Link>
                    </div>
                ) : (
                    <>
                        <section className="overview-project-card">
                            <div className="overview-project-icon">
                                {project.name?.charAt(0)?.toUpperCase() || "P"}
                            </div>

                            <div className="overview-project-info">
                                <div className="overview-project-title-row">
                                    <h2>{project.name}</h2>
                                    <span
                                        className={`overview-status status-${status.toLowerCase()}`}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>

                                <p>
                                    {project.description ||
                                        "No description provided for this project."}
                                </p>

                                <div className="overview-project-meta">
                                    <span>
                                        <strong>Language:</strong>{" "}
                                        {project.language || "Unknown"}
                                    </span>
                                    <span>
                                        <strong>Created:</strong>{" "}
                                        {createdDate}
                                    </span>
                                    <span>
                                        <strong>Source:</strong>{" "}
                                        {project.sourceType || "upload"}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="overview-delete-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete Project"}
                            </button>
                        </section>

                        <section className="overview-stats">
                            <div className="overview-stat-card">
                                <span className="overview-stat-icon">▤</span>
                                <p>Total Files</p>
                                <strong>
                                    {project.fileCount ?? 0}
                                </strong>
                                <span>Source files</span>
                            </div>

                            <div className="overview-stat-card">
                                <span className="overview-stat-icon">≡</span>
                                <p>Total Lines</p>
                                <strong>{totalLines}</strong>
                                <span>Lines of code</span>
                            </div>

                            <div className="overview-stat-card">
                                <span className="overview-stat-icon">◉</span>
                                <p>Security Issues</p>
                                <strong>{securityCount}</strong>
                                <span>Reported findings</span>
                            </div>

                            <div className="overview-stat-card">
                                <span className="overview-stat-icon">◈</span>
                                <p>Technical Debt</p>
                                <strong>{debtScore}</strong>
                                <span>Debt score</span>
                            </div>
                        </section>

                        <section className="overview-content-grid">
                            <div className="overview-panel">
                                <div className="overview-panel-heading">
                                    <div>
                                        <h2>Code Metrics</h2>
                                        <p>
                                            Key measurements of your codebase
                                        </p>
                                    </div>
                                    <span className="overview-panel-symbol">
                                        ≋
                                    </span>
                                </div>

                                <div className="overview-metric-row">
                                    <span>Non-empty lines</span>
                                    <strong>{nonEmptyLines}</strong>
                                </div>

                                <div className="overview-metric-row">
                                    <span>Comment lines</span>
                                    <strong>{commentLines}</strong>
                                </div>

                                <div className="overview-metric-row">
                                    <span>Code density</span>

                                    <strong>{formattedCodeDensity}</strong>
                                </div>

                                <div className="overview-progress-track">
                                    <div
                                        className="overview-progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                Math.max(
                                                    Number(codeDensity) || 0,
                                                    0
                                                ),
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="overview-panel">
                                <div className="overview-panel-heading">
                                    <div>
                                        <h2>Analysis Summary</h2>
                                        <p>
                                            Current analysis information
                                        </p>
                                    </div>
                                    <span className="overview-panel-symbol">
                                        ◇
                                    </span>
                                </div>

                                <div className="overview-analysis-row">
                                    <span>Analysis Status</span>
                                    <strong>{statusLabel}</strong>
                                </div>

                                <div className="overview-analysis-row">
                                    <span>Programming Language</span>
                                    <strong>
                                        {project.language || "Unknown"}
                                    </strong>
                                </div>

                                <div className="overview-analysis-row">
                                    <span>Security Findings</span>
                                    <strong>{securityCount}</strong>
                                </div>

                                <div className="overview-analysis-row">
                                    <span>Technical Debt Score</span>
                                    <strong>{debtScore}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="overview-panel overview-navigation-panel">
                            <div className="overview-panel-heading">
                                <div>
                                    <h2>Explore Code Insights</h2>
                                    <p>
                                        Open detailed reports for this project
                                    </p>
                                </div>
                            </div>

                            <div className="overview-insight-grid">
                                <Link
                                    to="/analysis"
                                    className="overview-insight-card"
                                >
                                    <span className="insight-icon">◇</span>
                                    <div>
                                        <h3>Code Analysis</h3>
                                        <p>
                                            Review code metrics and structure.
                                        </p>
                                    </div>
                                    <span className="insight-arrow">→</span>
                                </Link>

                                <Link
                                    to="/architecture"
                                    className="overview-insight-card"
                                >
                                    <span className="insight-icon">⌁</span>
                                    <div>
                                        <h3>Architecture Diagram</h3>
                                        <p>
                                            Explore modules and dependencies.
                                        </p>
                                    </div>
                                    <span className="insight-arrow">→</span>
                                </Link>

                                <Link
                                    to="/security"
                                    className="overview-insight-card"
                                >
                                    <span className="insight-icon">◉</span>
                                    <div>
                                        <h3>Security Audit</h3>
                                        <p>
                                            Review detected security findings.
                                        </p>
                                    </div>
                                    <span className="insight-arrow">→</span>
                                </Link>

                                <Link
                                    to="/technical-debt"
                                    className="overview-insight-card"
                                >
                                    <span className="insight-icon">◈</span>
                                    <div>
                                        <h3>Technical Debt</h3>
                                        <p>
                                            Review code health and risk areas.
                                        </p>
                                    </div>
                                    <span className="insight-arrow">→</span>
                                </Link>
                            </div>
                        </section>
                    </>
                )}

                <footer className="project-overview-footer">
                    © 2026 CodeBlueprint AI. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default ProjectOverview;