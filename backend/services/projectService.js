
const fs = require("fs/promises");
const path = require("path");

const Project = require("../models/Project");
const { extractDependencies } = require("../analyzer/dependencyAnalyzer");
const { calculateMetrics } = require("../analyzer/codeMetrics");

const textFileExtensions = new Set([
    ".js", ".jsx", ".ts", ".tsx",
    ".html", ".htm",
    ".css", ".scss",
    ".json", ".xml",
    ".py", ".java",
    ".c", ".cpp", ".h", ".hpp",
    ".cs", ".php", ".rb",
    ".go", ".rs", ".sql",
    ".sh", ".yaml", ".yml",
    ".md", ".txt"
]);

const assetExtensions = new Set([
    ".png", ".jpg", ".jpeg", ".gif",
    ".webp", ".svg", ".ico"
]);

const languageMap = {
    ".js": "JavaScript",
    ".jsx": "React JavaScript",
    ".ts": "TypeScript",
    ".tsx": "React TypeScript",
    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".json": "JSON",
    ".xml": "XML",
    ".py": "Python",
    ".java": "Java",
    ".c": "C",
    ".cpp": "C++",
    ".h": "C",
    ".hpp": "C++",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".go": "Go",
    ".rs": "Rust",
    ".sql": "SQL",
    ".sh": "Shell",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
    ".txt": "Text"
};

const getLanguageFromExtension = (extension = "") =>
    languageMap[extension.toLowerCase()] || "Unknown";

const normalizeFilePath = (fileName = "") =>
    String(fileName)
        .replace(/\\/g, "/")
        .replace(/^\.\/+/, "")
        .replace(/^\/+/, "")
        .split("/")
        .filter(part => part && part !== ".")
        .join("/");

const normalizeImportPath = (name = "") =>
    String(name).replace(/\\/g, "/").trim();

const readFileSafely = async (file) => {
    try {
        if (!file?.path) return "";
        return await fs.readFile(file.path, "utf8");
    } catch (error) {
        console.error(
            `Unable to read ${file?.originalname || "uploaded file"}:`,
            error.message
        );
        return "";
    }
};

const calculateLineMetrics = (content = "", extension = "") => {
    if (!content) {
        return {
            totalLines: 0,
            nonEmptyLines: 0,
            commentLines: 0
        };
    }

    const lines = content.split(/\r\n|\r|\n/);
    let nonEmptyLines = 0;
    let commentLines = 0;
    let insideBlockComment = false;
    let insideHtmlComment = false;

    const slashExtensions = new Set([
        ".js", ".jsx", ".ts", ".tsx", ".java",
        ".c", ".cpp", ".h", ".hpp", ".cs",
        ".css", ".scss", ".go", ".rs", ".php"
    ]);

    const hashExtensions = new Set([
        ".py", ".rb", ".sh", ".yaml", ".yml"
    ]);

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) continue;

        nonEmptyLines++;

        if ([".html", ".htm", ".xml", ".vue", ".svelte"].includes(extension)) {
            if (insideHtmlComment) {
                commentLines++;
                if (trimmed.includes("-->")) insideHtmlComment = false;
                continue;
            }

            if (trimmed.startsWith("<!--")) {
                commentLines++;
                if (!trimmed.includes("-->")) insideHtmlComment = true;
                continue;
            }
        }

        if (insideBlockComment) {
            commentLines++;
            if (trimmed.includes("*/")) insideBlockComment = false;
            continue;
        }

        if (slashExtensions.has(extension) && trimmed.startsWith("//")) {
            commentLines++;
            continue;
        }

        if (slashExtensions.has(extension) && trimmed.startsWith("/*")) {
            commentLines++;
            if (!trimmed.includes("*/")) insideBlockComment = true;
            continue;
        }

        if (slashExtensions.has(extension) && trimmed.startsWith("*")) {
            commentLines++;
            continue;
        }

        if (hashExtensions.has(extension) && trimmed.startsWith("#")) {
            commentLines++;
            continue;
        }

        if (extension === ".sql" && trimmed.startsWith("--")) {
            commentLines++;
        }
    }

    return {
        totalLines: lines.length,
        nonEmptyLines,
        commentLines
    };
};

const buildImportCandidates = (importName, sourceName) => {
    const candidates = new Set();
    const importPath = normalizeImportPath(importName);

    if (!importPath) return [];

    const extensions = [
        ".js", ".jsx", ".ts", ".tsx",
        ".py", ".java", ".html", ".css",
        ".scss", ".php", ".rb", ".go",
        ".rs", ".json"
    ];

    const sourceDirectory = path.posix.dirname(
        normalizeFilePath(sourceName)
    );

    const isRelative =
        importPath.startsWith("./") ||
        importPath.startsWith("../");

    const basePath = isRelative
        ? path.posix.normalize(
            path.posix.join(sourceDirectory, importPath)
        )
        : path.posix.normalize(importPath);

    if (basePath === ".." || basePath.startsWith("../")) {
        return [];
    }

    candidates.add(basePath);

    for (const extension of extensions) {
        candidates.add(`${basePath}${extension}`);
        candidates.add(path.posix.join(basePath, `index${extension}`));
        candidates.add(path.posix.join(basePath, `__init__${extension}`));
    }

    return [...candidates].map(normalizeFilePath);
};

const buildLanguageImportCandidates = (importName, source) => {
    const candidates = new Set();
    const name = normalizeImportPath(importName);
    const language = source.language?.toLowerCase();

    if (!name) return [];

    if (language === "python") {
        const levelMatch = name.match(/^\.+/);
        const level = levelMatch ? levelMatch[0].length : 0;

        const moduleName = name.replace(/^\.+/, "");
        const modulePath = moduleName.replace(/\./g, "/");

        if (level > 0) {
            let base = path.posix.dirname(
                normalizeFilePath(source.originalName)
            );

            for (let index = 1; index < level; index++) {
                base = path.posix.dirname(base);
            }

            if (modulePath) {
                candidates.add(path.posix.join(base, modulePath));
                candidates.add(path.posix.join(base, `${modulePath}.py`));
                candidates.add(
                    path.posix.join(base, modulePath, "__init__.py")
                );
            }
        } else if (modulePath) {
            candidates.add(modulePath);
            candidates.add(`${modulePath}.py`);
            candidates.add(
                path.posix.join(modulePath, "__init__.py")
            );
        }

        // Only use a basename fallback when it is unambiguous.
        const basename = path.posix.basename(modulePath);
        const matches = source.fileIndex.byBasename.get(basename);

        if (matches?.length === 1) {
            candidates.add(matches[0]);
        }
    }

    if (language === "rust") {
        const sourceDirectory = path.posix.dirname(
            normalizeFilePath(source.originalName)
        );

        const modulePath = name
            .replace(/^crate::/, "")
            .replace(/^self::/, "")
            .replace(/::/g, "/");

        candidates.add(
            path.posix.join(sourceDirectory, `${modulePath}.rs`)
        );
        candidates.add(
            path.posix.join(sourceDirectory, modulePath, "mod.rs")
        );
        candidates.add(`${modulePath}.rs`);
        candidates.add(path.posix.join(modulePath, "mod.rs"));
    }

    return [...candidates];
};

const resolveLocalImport = (
    importName,
    source,
    fileIndex,
    dependencyType = "local"
) => {
    if (dependencyType !== "local") return null;

    const candidates = [
        ...buildImportCandidates(importName, source.originalName),
        ...buildLanguageImportCandidates(importName, {
            ...source,
            fileIndex
        })
    ];

    for (const candidate of candidates) {
        const match = fileIndex.byPath.get(
            normalizeFilePath(candidate)
        );

        if (match) return match;
    }

    const normalizedImport = normalizeImportPath(importName)
        .replace(/^\.\//, "")
        .replace(/\.(py|js|jsx|ts|tsx|java|rs)$/i, "");

    const basename = path.posix.basename(
        normalizedImport.replace(/::/g, "/").replace(/\./g, "/")
    );

    const basenameMatches = fileIndex.byBasename.get(basename);

    return basenameMatches?.length === 1
        ? basenameMatches[0]
        : null;
};

const extractMarkupAndStyleReferences = (content = "") => {
    const references = [];

    const patterns = [
        /(?:src|href)\s*=\s*["']([^"'#]+)["']/gi,
        /@import\s+["']([^"']+)["']/gi,
        /url\(["']?([^"')]+)["']?\)/gi
    ];

    for (const pattern of patterns) {
        let match;

        while ((match = pattern.exec(content)) !== null) {
            const reference = match[1]?.trim();

            if (
                reference &&
                !/^(https?:|data:|#|\/\/)/i.test(reference)
            ) {
                references.push(reference);
            }
        }
    }

    return [...new Set(references)];
};

const analyzeUploadedFiles = async (files = []) => {
    const uploadedFiles = [];
    const sourceContents = [];
    const nodes = [];
    const edges = [];
    const dependencies = [];

    const fileIndex = {
        byPath: new Map(),
        byBasename: new Map()
    };

    const metrics = {
        totalLines: 0,
        nonEmptyLines: 0,
        commentLines: 0,
        codeLines: 0,
        commentPercentage: 0,
        codeDensity: 0,
        functionCount: 0,
        classCount: 0,
        decisionPoints: 0,
        estimatedComplexity: 1,
        complexityLevel: "Low"
    };

    const languageCounts = {};

    // PASS 1: Register all uploaded files and calculate metrics.
    for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const originalName = normalizeFilePath(
            file.originalname || file.filename || `file_${index}`
        );

        const extension = path.extname(originalName).toLowerCase();
        const language = getLanguageFromExtension(extension);
        const isSourceFile = textFileExtensions.has(extension);
        const isAsset = assetExtensions.has(extension);

        const content = isSourceFile
            ? await readFileSafely(file)
            : "";

        const lineMetrics = calculateLineMetrics(content, extension);

        let fileMetrics = null;

        if (isSourceFile && content) {
            fileMetrics = calculateMetrics(content, language);

            metrics.functionCount += fileMetrics.functionCount;
            metrics.classCount += fileMetrics.classCount;
            metrics.decisionPoints += fileMetrics.decisionPoints;
            metrics.codeLines += fileMetrics.codeLines;
        }

        metrics.totalLines += lineMetrics.totalLines;
        metrics.nonEmptyLines += lineMetrics.nonEmptyLines;
        metrics.commentLines += lineMetrics.commentLines;

        if (isSourceFile && language !== "Unknown") {
            languageCounts[language] =
                (languageCounts[language] || 0) + 1;
        }

        if (isAsset) {
            languageCounts.Images = (languageCounts.Images || 0) + 1;
        }

        const nodeId = `file_${index}`;

        nodes.push({
            id: nodeId,
            name: path.posix.basename(originalName),
            path: originalName,
            extension,
            language: isAsset ? "Images" : language,
            type: isAsset ? "asset" : isSourceFile ? "file" : "other"
        });

        sourceContents.push({
            nodeId,
            originalName,
            extension,
            language,
            content
        });

        uploadedFiles.push({
            originalName,
            storedName: file.filename || "",
            path: file.path || "",
            extension,
            language: isAsset ? "Images" : language,
            type: isAsset ? "asset" : isSourceFile ? "source" : "other",
            lines: lineMetrics.totalLines,
            nonEmptyLines: lineMetrics.nonEmptyLines,
            size: file.size || 0
        });

        fileIndex.byPath.set(originalName, nodeId);

        const basename = path.posix.basename(originalName, extension)
            .toLowerCase();

        if (!fileIndex.byBasename.has(basename)) {
            fileIndex.byBasename.set(basename, []);
        }

        fileIndex.byBasename.get(basename).push(nodeId);
    }

    metrics.commentPercentage = metrics.nonEmptyLines
        ? Number(
            ((metrics.commentLines / metrics.nonEmptyLines) * 100).toFixed(2)
        )
        : 0;

    metrics.codeDensity = metrics.nonEmptyLines
        ? Number(
            ((metrics.codeLines / metrics.nonEmptyLines) * 100).toFixed(2)
        )
        : 0;

    metrics.estimatedComplexity = metrics.decisionPoints + 1;

    if (metrics.estimatedComplexity >= 11) {
        metrics.complexityLevel = "High";
    } else if (metrics.estimatedComplexity >= 6) {
        metrics.complexityLevel = "Medium";
    }

    // PASS 2: Resolve local dependencies and create architecture edges.
    const edgeKeys = new Set();

    const addEdge = (sourceNode, targetNode, type, label) => {
        if (!sourceNode || !targetNode || sourceNode === targetNode) return;

        const edgeKey = `${sourceNode}->${targetNode}:${type}`;

        if (edgeKeys.has(edgeKey)) return;

        edgeKeys.add(edgeKey);

        edges.push({
            id: `edge_${edges.length}`,
            source: sourceNode,
            target: targetNode,
            type,
            label
        });
    };

    for (const source of sourceContents) {
        if (!source.content) continue;

        const extractedDependencies = extractDependencies(
            source.content,
            source.language.toLowerCase()
        ) || [];

for (const dependency of extractedDependencies) {
    if (!dependency?.name) continue;

    const dependencyName = normalizeImportPath(dependency.name);

    // Check whether this dependency refers to an uploaded file.
    const looksLikeFileReference =
        dependencyName.includes("/") ||
        /\.[a-z0-9]+$/i.test(dependencyName);

    const targetNode = (
        dependency.type === "local" ||
        looksLikeFileReference
    )
        ? resolveLocalImport(
            dependencyName,
            source,
            fileIndex,
            "local"
        )
        : null;

    const dependencyType = targetNode
        ? "local"
        : dependency.type || "external";

    dependencies.push({
        source: source.nodeId,
        sourceFile: source.originalName,
        name: dependencyName,
        type: dependencyType,
        kind: dependency.kind || "imports"
    });

    if (targetNode) {
        addEdge(
            source.nodeId,
            targetNode,
            dependency.kind || "imports",
            dependencyName
        );
    }
}

        const references = extractMarkupAndStyleReferences(source.content);

        for (const reference of references) {
            const targetNode = resolveLocalImport(
                reference,
                source,
                fileIndex,
                "local"
            );

            if (targetNode) {
                addEdge(
                    source.nodeId,
                    targetNode,
                    "references",
                    reference
                );
            }
        }
    }

    const architecture = {
        type: "codebase",
        nodes,
        edges,
        dependencies
    };

    const codeFileCount = uploadedFiles.filter(
        file => file.type === "source"
    ).length;

    const assetFileCount = uploadedFiles.filter(
        file => file.type === "asset"
    ).length;

    return {
        uploadedFiles,
        architecture,
        dependencies,
        metrics,
        languageCounts,
        totalLines: metrics.totalLines,
        nonEmptyLines: metrics.nonEmptyLines,
        commentLines: metrics.commentLines,
        codeFileCount,
        assetFileCount,
        fileCount: uploadedFiles.length
    };
};

const createProject = async (userId, projectData, files = []) => {
    console.log("CREATE PROJECT FUNCTION CALLED");
    console.log(`Received ${files.length} uploaded files`);

    if (!userId) {
        throw new Error("User authentication is required.");
    }

    if (!projectData?.name?.trim()) {
        throw new Error("Project name is required.");
    }

    if (!files.length) {
        throw new Error("Please upload at least one project file.");
    }

    const fileAnalysis = await analyzeUploadedFiles(files);

    const languageEntries = Object.entries(fileAnalysis.languageCounts)
        .filter(([language]) => language !== "Images");

    const primaryLanguage = languageEntries.length
        ? languageEntries.sort((a, b) => b[1] - a[1])[0][0]
        : "Unknown";

    const project = await Project.create({
        user: userId,
        name: projectData.name.trim(),
        description: projectData.description || "",
        sourceType: projectData.sourceType || "upload",
        language: primaryLanguage,
        fileCount: fileAnalysis.fileCount,
        codeLines: fileAnalysis.totalLines,
        files: fileAnalysis.uploadedFiles,

        analysis: {
            languageCounts: fileAnalysis.languageCounts,
            codeFileCount: fileAnalysis.codeFileCount,
            assetFileCount: fileAnalysis.assetFileCount,
            totalFiles: fileAnalysis.fileCount,
            totalLines: fileAnalysis.totalLines,
            nonEmptyLines: fileAnalysis.nonEmptyLines,
            commentLines: fileAnalysis.commentLines,
            metrics: fileAnalysis.metrics,
            architecture: fileAnalysis.architecture,
            dependencies: fileAnalysis.dependencies
        }
    });

    console.log("Project saved successfully:", project._id);
    console.log("Architecture nodes:", fileAnalysis.architecture.nodes.length);
    console.log("Architecture edges:", fileAnalysis.architecture.edges.length);
    console.log("Project metrics:", fileAnalysis.metrics);

    return project;
};

const getUserProjects = async (userId) => {
    return Project.find({ user: userId }).sort({ createdAt: -1 });
};

const getProjectById = async (projectId, userId) => {
    const project = await Project.findOne({
        _id: projectId,
        user: userId
    });

    if (!project) {
        throw new Error("Project not found.");
    }

    return project;
};

const deleteProject = async (projectId, userId) => {
    const project = await Project.findOneAndDelete({
        _id: projectId,
        user: userId
    });

    if (!project) {
        throw new Error("Project not found.");
    }

    return project;
};

module.exports = {
    createProject,
    getUserProjects,
    getProjectById,
    deleteProject,
    analyzeUploadedFiles
};
