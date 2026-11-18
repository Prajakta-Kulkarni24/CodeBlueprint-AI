import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/projects.css";
import "../styles/sidebar.css";

const Projects = () => {
    const navigate = useNavigate();

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
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

                setProjects(
                    data.projects || []
                );

            } catch (error) {

                console.error(
                    "Projects error:",
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

        navigate("/login");
    };


    const filteredProjects =
        projects.filter((project) =>
            project.name
                ?.toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );


    return (
        <div
            className={`projects-page ${
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
                            className="sidebar-nav-item active"
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


            {/* OPEN SIDEBAR */}

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

            <main className="projects-main">

                <header className="projects-header">

                    <div>

                        <h1>
                            Projects
                        </h1>

                        <p>
                            Manage and explore your
                            analyzed codebases.
                        </p>

                    </div>


                    <div className="projects-header-actions">

                        <button
                            type="button"
                            className="projects-theme-btn"
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


                        <Link
                            to="/create-project"
                            className="projects-create-btn"
                        >
                            + Create Project
                        </Link>

                    </div>

                </header>


                {/* SEARCH */}

                <section className="projects-toolbar">

                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </section>


                {/* PROJECTS */}

                {loading ? (

                    <div className="projects-empty">

                        <p>
                            Loading projects...
                        </p>

                    </div>

                ) : filteredProjects.length === 0 ? (

                    <div className="projects-empty">

                        <div className="projects-empty-icon">
                            ⌘
                        </div>

                        <h2>
                            No projects found
                        </h2>

                        <p>
                            Create your first project
                            to start analyzing your
                            codebase.
                        </p>


                        <Link
                            to="/create-project"
                            className="projects-create-btn"
                        >
                            Create Project
                        </Link>

                    </div>

                ) : (

                    <div className="projects-grid">

                        {filteredProjects.map(
                            (project) => (

                                <div
                                    className="project-item-card"
                                    key={project._id}
                                >

                                    <div className="project-item-top">

                                        <div>

                                            <h2>
                                                {project.name}
                                            </h2>

                                            <p>
                                                {project.description ||
                                                    "No description provided"}
                                            </p>

                                        </div>


                                        <span className="project-status">
                                            {project.status ||
                                                "created"}
                                        </span>

                                    </div>


                                    <div className="project-item-meta">

                                        <span>
                                            Language:{" "}
                                            {project.language ||
                                                "Unknown"}
                                        </span>

                                        <span>
                                            Files:{" "}
                                            {project.fileCount ||
                                                0}
                                        </span>

                                        <span>
                                            Lines:{" "}
                                            {project.codeLines ||
                                                0}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        className="project-view-btn"
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project._id}`
                                            )
                                        }
                                    >
                                        View Project
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}


                <footer className="projects-footer">

                    © 2026 CodeBlueprint AI.
                    All rights reserved.

                </footer>

            </main>

        </div>
    );
};

export default Projects;