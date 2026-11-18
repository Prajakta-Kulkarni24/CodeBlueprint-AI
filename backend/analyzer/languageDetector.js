const path = require("path");

const languageMap = {
    ".java": "Java",
    ".py": "Python",

    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".jsx": "React JavaScript",

    ".ts": "TypeScript",
    ".tsx": "React TypeScript",

    ".c": "C",
    ".h": "C",

    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".hpp": "C++",
    ".hh": "C++",
    ".hxx": "C++",

    ".cs": "C#",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",

    ".rb": "Ruby",
    ".rake": "Ruby",

    ".kt": "Kotlin",
    ".kts": "Kotlin",

    ".swift": "Swift",
    ".dart": "Dart",

    ".scala": "Scala",
    ".sc": "Scala",

    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",

    ".vue": "Vue",
    ".svelte": "Svelte",
    ".xml": "XML",

    ".graphql": "GraphQL",
    ".gql": "GraphQL",

    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",

    ".sol": "Solidity",
    ".sql": "SQL",

    ".asm": "Assembly",
    ".s": "Assembly",

    ".sh": "Bash/Shell",
    ".bash": "Bash/Shell",
    ".zsh": "Bash/Shell",

    ".scss": "SCSS",
    ".sass": "Sass",
    ".less": "Less",

    ".svg": "SVG",

    ".env": "ENV",
    ".ini": "INI",
    ".toml": "TOML",

    ".md": "Markdown",
    ".markdown": "Markdown",
    ".txt": "Text"
};

const filenameMap = {
    "Dockerfile": "Docker",
    "docker-compose.yml": "Docker Compose",
    "compose.yml": "Docker Compose",
    "package.json": "NPM",
    "requirements.txt": "Python Requirements",
    "pom.xml": "Maven",
    "Cargo.toml": "Cargo",
    "go.mod": "Go Modules",
    "Makefile": "Make"
};

const detectLanguage = (fileName) => {
    const baseName = path.basename(fileName);

    // Check special project/configuration filenames first
    if (filenameMap[baseName]) {
        return filenameMap[baseName];
    }

    const extension = path.extname(baseName).toLowerCase();

    return languageMap[extension] || "Unknown";
};

module.exports = { detectLanguage };