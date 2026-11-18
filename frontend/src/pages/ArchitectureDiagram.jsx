
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";
import mermaid from "mermaid";

import "../styles/codeAnalysis.css";
import "../styles/architectureDiagram.css";
import "../styles/sidebar.css";

const API_URL = "http://localhost:5000/api";

/* ==========================================
   HELPER FUNCTIONS
========================================== */

const getProjectId = (project) =>
    project?._id || project?.id || "";

const getFilePath = (file) =>
    (
        file?.originalName ||
        file?.path ||
        file?.filePath ||
        file?.name ||
        file?.filename ||
        "Unnamed file"
    ).replace(/\\/g, "/");

const getFileName = (file) =>
    getFilePath(file).split("/").pop();

const getFolderName = (file) => {
    const parts = getFilePath(file).split("/");

    return parts.length > 1
        ? parts.slice(0, -1).join("/")
        : "Root";
};

const getArchitectureData = (project) =>
    project?.analysis?.architecture ||
    project?.analysis?.architectureData ||
    project?.architecture ||
    {};

const getArchitectureNodes = (project) => {
    const architecture = getArchitectureData(project);

    if (
        Array.isArray(architecture.nodes) &&
        architecture.nodes.length > 0
    ) {
        return architecture.nodes;
    }

    return (project?.files || [])
        .filter(
            (file) =>
                file?.type !== "asset" &&
                file?.type !== "other"
        )
        .map((file, index) => ({
            id: `file_${index}`,
            name: getFileName(file),
            path: getFilePath(file),
            language: file?.language || "Unknown",
        }));
};

const getArchitectureEdges = (project) => {
    const architecture = getArchitectureData(project);

    const edges =
        architecture?.edges ||
        project?.analysis?.edges ||
        [];

    return Array.isArray(edges) ? edges : [];
};

const getDependencies = (project) => {
    const architecture = getArchitectureData(project);

    const dependencies =
        architecture?.dependencies ||
        project?.analysis?.dependencies ||
        project?.dependencies ||
        [];

    return Array.isArray(dependencies)
        ? dependencies
        : [];
};

const getLanguageCounts = (project) => {
    const savedCounts =
        project?.analysis?.languageCounts;

    if (
        savedCounts &&
        typeof savedCounts === "object"
    ) {
        return savedCounts;
    }

    const counts = {};

    (project?.files || []).forEach((file) => {
        if (
            file?.type === "asset" ||
            file?.type === "other"
        ) {
            return;
        }

        const language =
            file?.language || "Unknown";

        counts[language] =
            (counts[language] || 0) + 1;
    });

    return counts;
};

const getNodeId = (node, index) =>
    String(
        node?.id ||
        node?._id ||
        node?.fileId ||
        `file_${index}`
    );

const getNodePath = (node) =>
    (
        node?.path ||
        node?.filePath ||
        node?.name ||
        node?.label ||
        "Unnamed file"
    ).replace(/\\/g, "/");

/* ==========================================
   MERMAID DIAGRAM GENERATOR
========================================== */

const escapeMermaidLabel = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "'")
        .replace(/[<>]/g, "");

const buildMermaidDiagram = (project) => {
    const nodes = getArchitectureNodes(project);
    const edges = getArchitectureEdges(project);

    console.log(
    "LMS ARCHITECTURE EDGES:",
    JSON.stringify(edges, null, 2)
);

    if (!nodes.length) {
        return `flowchart TD
            A["No source files found"]
            B["Upload source code to generate architecture"]
            A --> B`;
    }

    const lines = ["flowchart TD"];

    const nodeIdMap = new Map();
    const pathIdMap = new Map();
    const folders = new Map();

    nodes.forEach((node, index) => {
        const originalId = getNodeId(node, index);
        const safeId = `N${index}`;
        const filePath = getNodePath(node);

        const fileName =
            filePath.split("/").pop();

        const folder = filePath.includes("/")
            ? filePath.split("/").slice(0, -1).join("/")
            : "Root";

        nodeIdMap.set(originalId, safeId);
        pathIdMap.set(filePath, safeId);

        if (!folders.has(folder)) {
            folders.set(folder, []);
        }

        folders.get(folder).push({
            id: safeId,
            name: fileName,
        });
    });

    let folderIndex = 0;

    folders.forEach((folderFiles, folderName) => {
        if (folderName === "Root") {
            folderFiles.forEach((file) => {
                lines.push(
                    `    ${file.id}["${escapeMermaidLabel(file.name)}"]`
                );
            });

            return;
        }

        const folderId = `F${folderIndex++}`;

        lines.push(
            `    subgraph ${folderId}["${escapeMermaidLabel(folderName)}"]`
        );

        lines.push("        direction TB");

        folderFiles.forEach((file) => {
            lines.push(
                `        ${file.id}["${escapeMermaidLabel(file.name)}"]`
            );
        });

        lines.push("    end");
    });

const usedEdges = new Set();

edges.forEach((edge) => {
    const from =
        edge?.from ||
        edge?.source ||
        edge?.sourceId;

    const to =
        edge?.to ||
        edge?.target ||
        edge?.targetId;

    if (!from || !to) return;

    const sourceNode = nodes.find(
        (node, index) =>
            String(getNodeId(node, index)) === String(from)
    );

    const targetNode = nodes.find(
        (node, index) =>
            String(getNodeId(node, index)) === String(to)
    );

    const sourcePath = getNodePath(sourceNode || {});
    const targetPath = getNodePath(targetNode || {});

    const relationship = String(
        edge?.relationship || edge?.type || ""
    ).toLowerCase();

    // Hide image and asset arrows
    if (
        relationship === "image" ||
        relationship === "asset"
    ) {
        return;
    }

    // Hide HTML page navigation arrows
    const isHtmlToHtml =
        /\.html?$/i.test(sourcePath) &&
        /\.html?$/i.test(targetPath);

    if (isHtmlToHtml) return;

    const sourceId =
        nodeIdMap.get(String(from)) ||
        pathIdMap.get(String(from).replace(/\\/g, "/"));

    const targetId =
        nodeIdMap.get(String(to)) ||
        pathIdMap.get(String(to).replace(/\\/g, "/"));

    if (
        !sourceId ||
        !targetId ||
        sourceId === targetId
    ) {
        return;
    }

    const edgeKey = `${sourceId}->${targetId}`;

    if (usedEdges.has(edgeKey)) return;

    usedEdges.add(edgeKey);

    lines.push(
        `    ${sourceId} --> ${targetId}`
    );
});

    return lines.join("\n");
};

/* ==========================================
   ARCHITECTURE DIAGRAM COMPONENT
========================================== */

const ArchitectureDiagram = () => {
    const navigate = useNavigate();

    const diagramRef = useRef(null);
    const renderCounter = useRef(0);

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
    const [projectLoading, setProjectLoading] =
        useState(false);

    const [diagramLoading, setDiagramLoading] =
        useState(false);

    const [error, setError] = useState("");

    /* ==========================================
       THEME
    ========================================== */

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((previous) => !previous);
    };

    /* ==========================================
       SIDEBAR
    ========================================== */

    const toggleSidebar = () => {
        setSidebarCollapsed((previous) => !previous);
    };

    /* ==========================================
       LOGOUT
    ========================================== */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    /* ==========================================
       FETCH PROJECT DETAILS
    ========================================== */

    const fetchProjectDetails = useCallback(
        async (projectId) => {
            if (!projectId) return;

            try {
                setProjectLoading(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to load project"
                    );
                }

                setSelectedProject(
                    data.project ||
                    data.data?.project ||
                    data.data ||
                    data
                );
            } catch (error) {
                console.error(
                    "Project details error:",
                    error.message
                );

                setError(error.message);
                setSelectedProject(null);
            } finally {
                setProjectLoading(false);
            }
        },
        []
    );

    /* ==========================================
       FETCH PROJECTS
    ========================================== */

    const fetchProjects = useCallback(async () => {
        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch projects"
                );
            }

            const projectList =
                data.projects ||
                data.data?.projects ||
                [];

            setProjects(projectList);

            if (projectList.length > 0) {
                await fetchProjectDetails(
                    getProjectId(projectList[0])
                );
            } else {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error(
                "Architecture error:",
                error.message
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [navigate, fetchProjectDetails]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    /* ==========================================
       PROJECT SELECTION
    ========================================== */

    const handleProjectChange = (event) => {
        const projectId = event.target.value;

        if (projectId) {
            fetchProjectDetails(projectId);
        }
    };

    /* ==========================================
       PROJECT DATA
    ========================================== */

    const files = selectedProject?.files || [];

    const sourceFiles = useMemo(
        () =>
            files.filter(
                (file) =>
                    file?.type !== "asset" &&
                    file?.type !== "other"
            ),
        [files]
    );

    const assetFiles = useMemo(
        () =>
            files.filter(
                (file) => file?.type === "asset"
            ),
        [files]
    );

    const modules = useMemo(() => {
        const moduleMap = new Map();

        sourceFiles.forEach((file) => {
            const folder = getFolderName(file);

            if (!moduleMap.has(folder)) {
                moduleMap.set(folder, []);
            }

            moduleMap.get(folder).push(file);
        });

        return Array.from(
            moduleMap.entries()
        ).map(([name, moduleFiles]) => ({
            name,
            files: moduleFiles,
        }));
    }, [sourceFiles]);

    const dependencies = useMemo(
        () => getDependencies(selectedProject || {}),
        [selectedProject]
    );

    const architectureEdges = useMemo(
        () => getArchitectureEdges(selectedProject || {}),
        [selectedProject]
    );

    const languageCounts = useMemo(
        () => getLanguageCounts(selectedProject || {}),
        [selectedProject]
    );

    const totalLines = Number(
        selectedProject?.analysis?.totalLines ??
        files.reduce(
            (sum, file) =>
                sum + Number(file?.lines || 0),
            0
        )
    );

    const codeFileCount = Number(
        selectedProject?.analysis?.codeFileCount ??
        sourceFiles.length
    );

    const assetFileCount = Number(
        selectedProject?.analysis?.assetFileCount ??
        assetFiles.length
    );

    const projectName =
        selectedProject?.name ||
        selectedProject?.projectName ||
        "Untitled Project";

    /* ==========================================
       DIAGRAM CODE
    ========================================== */

    const diagramCode = useMemo(() => {
        if (!selectedProject) return "";

        const savedDiagram =
            selectedProject.architectureDiagram ||
            selectedProject.analysis?.architectureDiagram;

        if (
            typeof savedDiagram === "string" &&
            savedDiagram.trim()
        ) {
            return savedDiagram;
        }

        return buildMermaidDiagram(selectedProject);
    }, [selectedProject]);

    /* ==========================================
       MERMAID CONFIGURATION
    ========================================== */

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: darkMode ? "dark" : "default",
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: "basis",
                nodeSpacing: 65,
                rankSpacing: 75,
                padding: 18,
            },
        });
    }, [darkMode]);

    /* ==========================================
       RENDER DIAGRAM
    ========================================== */

    useEffect(() => {
        let cancelled = false;

        const renderDiagram = async () => {
            if (!diagramRef.current || !diagramCode) {
                return;
            }

            try {
                setDiagramLoading(true);

                const renderId =
                    `architecture-${++renderCounter.current}`;

                const result = await mermaid.render(
                    renderId,
                    diagramCode
                );

                if (
                    cancelled ||
                    !diagramRef.current
                ) {
                    return;
                }

                diagramRef.current.innerHTML =
                    result.svg;

                if (result.bindFunctions) {
                    result.bindFunctions(
                        diagramRef.current
                    );
                }
            } catch (error) {
                console.error(
                    "Mermaid rendering error:",
                    error
                );

                if (
                    !cancelled &&
                    diagramRef.current
                ) {
                    diagramRef.current.innerHTML = `
                        <div class="architecture-diagram-error">
                            <strong>
                                Unable to render architecture diagram.
                            </strong>
                            <p>
                                Please check the architecture data.
                            </p>
                        </div>
                    `;
                }
            } finally {
                if (!cancelled) {
                    setDiagramLoading(false);
                }
            }
        };

        renderDiagram();

        return () => {
            cancelled = true;
        };
    }, [diagramCode, darkMode]);

    /* ==========================================
       MAIN JSX
    ========================================== */

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
                            className="sidebar-nav-item active"
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

            {/* MAIN */}

            <main className="code-analysis-main">

                <header className="code-analysis-header">

                    <div>
                        <h1>Architecture Diagram</h1>

                        <p>
                            Explore your project's structure,
                            components, and relationships.
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
                        {darkMode ? "☀" : "☾"}
                    </button>

                </header>

                {/* PROJECT SELECTOR */}

                <section className="analysis-project-selector">

                    <div>
                        <span>Select Project</span>

                        <p>
                            Choose a project to view its
                            architecture diagram.
                        </p>
                    </div>

                    <select
                        value={getProjectId(selectedProject)}
                        onChange={handleProjectChange}
                        disabled={
                            loading ||
                            projectLoading ||
                            projects.length === 0
                        }
                    >
                        {projects.length === 0 ? (
                            <option value="">
                                No projects available
                            </option>
                        ) : (
                            projects.map((project) => (
                                <option
                                    key={getProjectId(project)}
                                    value={getProjectId(project)}
                                >
                                    {project.name ||
                                        project.projectName ||
                                        "Untitled Project"}
                                </option>
                            ))
                        )}
                    </select>

                </section>

                {/* LOADING / ERROR / EMPTY */}

                {loading ? (
                    <div className="analysis-empty">
                        <p>Loading architecture...</p>
                    </div>
                ) : error ? (
                    <div className="analysis-empty">
                        <h2>Unable to load architecture</h2>
                        <p>{error}</p>

                        <button
                            type="button"
                            className="analysis-create-btn"
                            onClick={fetchProjects}
                        >
                            Try Again
                        </button>
                    </div>
                ) : !selectedProject ? (
                    <div className="analysis-empty">

                        <div className="analysis-empty-icon">
                            ⌁
                        </div>

                        <h2>No project available</h2>

                        <p>
                            Create a project and upload
                            source code to generate its
                            architecture diagram.
                        </p>

                        <Link
                            to="/create-project"
                            className="analysis-create-btn"
                        >
                            Create Project
                        </Link>

                    </div>
                ) : projectLoading ? (
                    <div className="analysis-empty">
                        <p>Loading selected project...</p>
                    </div>
                ) : (
                    <>

                        {/* PROJECT SUMMARY */}

                        <section className="analysis-project-card">

                            <div>
                                <span className="analysis-label">
                                    ANALYZING PROJECT
                                </span>

                                <h2>{projectName}</h2>

                                <p>
                                    {selectedProject.description ||
                                        "Explore the structure and connections extracted from your source files."}
                                </p>
                            </div>

                            <div className="analysis-project-status">
                                <span>Status</span>

                                <strong>
                                    {selectedProject.status || "created"}
                                </strong>
                            </div>

                        </section>

                        {/* ARCHITECTURE OVERVIEW */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">
                                <div>
                                    <h2>Architecture Overview</h2>

                                    <p>
                                        Summary of your project's
                                        structure and components.
                                    </p>
                                </div>
                            </div>

                            <div className="analysis-metrics-grid">

                                <div className="analysis-metric-card">
                                    <span>Total Files</span>
                                    <strong>{files.length}</strong>
                                </div>

                                <div className="analysis-metric-card">
                                    <span>Source Files</span>
                                    <strong>{codeFileCount}</strong>
                                </div>

                                <div className="analysis-metric-card">
                                    <span>Modules</span>
                                    <strong>{modules.length}</strong>
                                </div>

                                <div className="analysis-metric-card">
                                    <span>Connections</span>
                                    <strong>{architectureEdges.length}</strong>
                                </div>

                                <div className="analysis-metric-card">
                                    <span>Lines of Code</span>
                                    <strong>{totalLines.toLocaleString()}</strong>
                                </div>

                                <div className="analysis-metric-card">
                                    <span>Assets</span>
                                    <strong>{assetFileCount}</strong>
                                </div>

                            </div>

                        </section>

                        {/* ARCHITECTURE DIAGRAM */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">
                                <div>
                                    <h2>Project Architecture</h2>

                                    <p>
                                        Visual representation of
                                        folders, files and their
                                        detected relationships.
                                    </p>
                                </div>

                               
                            </div>

                            <div className="architecture-diagram-card">

                                {diagramLoading && (
                                    <div className="architecture-diagram-loading">
                                        Rendering diagram...
                                    </div>
                                )}

                                <div
                                    ref={diagramRef}
                                    className="architecture-mermaid-render"
                                ></div>

                            </div>

                            <div className="architecture-diagram-legend">
                                <span>
                                    <i className="legend-folder"></i>
                                    Folder / Module
                                </span>

                                <span>
                                    <i className="legend-file"></i>
                                    Source File
                                </span>

                                <span>
                                    <i className="legend-connection"></i>
                                    Local Import
                                </span>
                            </div>

                        </section>

                        {/* PROJECT MODULES */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">
                                <div>
                                    <h2>Project Modules</h2>

                                    <p>
                                        Source files grouped
                                        by their folders.
                                    </p>
                                </div>
                            </div>

                            {modules.length > 0 ? (
                                <div className="architecture-module-list">

                                    {modules.map((module) => (
                                        <div
                                            className="architecture-module-item"
                                            key={module.name}
                                        >
                                            <div className="architecture-module-heading">
                                                <strong>
                                                    ▰ {module.name}
                                                </strong>

                                                <span>
                                                    {module.files.length} files
                                                </span>
                                            </div>

                                            <div className="architecture-file-list">

                                                {module.files.map((file, index) => (
                                                    <div
                                                        className="architecture-file-item"
                                                        key={`${getFilePath(file)}-${index}`}
                                                    >
                                                        <span>⌁</span>

                                                        <span>
                                                            {getFileName(file)}
                                                        </span>

                                                        <small>
                                                            {file.language || "Unknown"}
                                                        </small>
                                                    </div>
                                                ))}

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <p className="architecture-muted">
                                    No modules found.
                                </p>
                            )}

                        </section>

                        {/* LANGUAGE BREAKDOWN */}

                        {Object.keys(languageCounts).length > 0 && (
                            <section className="analysis-language-breakdown">

                                <div className="analysis-section-heading">
                                    <div>
                                        <h2>Language Breakdown</h2>

                                        <p>
                                            Programming and markup
                                            languages detected in
                                            your codebase.
                                        </p>
                                    </div>
                                </div>

                                <div className="analysis-language-grid">

                                    {Object.entries(languageCounts).map(
                                        ([languageName, count]) => (
                                            <div
                                                className="analysis-language-card"
                                                key={languageName}
                                            >
                                                <span>{languageName}</span>
                                                <strong>{count}</strong>

                                                <small>
                                                    {count === 1
                                                        ? "file"
                                                        : "files"}
                                                </small>
                                            </div>
                                        )
                                    )}

                                </div>

                            </section>
                        )}

                        {/* DEPENDENCIES */}

                        <section className="analysis-section">

                            <div className="analysis-section-heading">
                                <div>
                                    <h2>Dependencies</h2>

                                    <p>
                                        Dependencies extracted
                                        from uploaded source files.
                                    </p>
                                </div>

                                <span className="architecture-count-badge">
                                    {dependencies.length} detected
                                </span>
                            </div>

                            {dependencies.length > 0 ? (
                                <div className="architecture-dependency-list">

                                    {dependencies.map(
                                        (dependency, index) => {
                                            const name =
                                                typeof dependency === "string"
                                                    ? dependency
                                                    : dependency?.name ||
                                                      dependency?.package ||
                                                      dependency?.path ||
                                                      "Unknown dependency";

                                            const type =
                                                typeof dependency === "string"
                                                    ? "external"
                                                    : dependency?.type ||
                                                      "external";

                                            return (
                                                <div
                                                    className="architecture-dependency-item"
                                                    key={`${name}-${index}`}
                                                >
                                                    <div className="architecture-dependency-info">
                                                        <strong>{name}</strong>

                                                        <span>
                                                            {type === "local"
                                                                ? "Local file dependency"
                                                                : "External dependency"}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`architecture-dependency-type ${
                                                            type === "local"
                                                                ? "local"
                                                                : "external"
                                                        }`}
                                                    >
                                                        {type}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            ) : (
                                <div className="architecture-no-dependencies">
                                    <strong>
                                        No Dependencies Detected
                                    </strong>

                                    <p>
                                        Detected imports and
                                        dependencies will appear here.
                                    </p>
                                </div>
                            )}

                        </section>

                    </>
                )}

                {/* FOOTER */}

                <footer className="code-analysis-footer">
                    © 2026 CodeBlueprint AI.
                    All rights reserved.
                </footer>

            </main>

        </div>
    );
};

export default ArchitectureDiagram;
