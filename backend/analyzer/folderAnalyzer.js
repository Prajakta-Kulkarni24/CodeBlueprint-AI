const fs = require("fs");
const path = require("path");

const ignoredFolders = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage"
];

const analyzeFolder = (folderPath) => {
    let files = [];
    let directories = [];

    const scanFolder = (currentPath) => {
        const entries = fs.readdirSync(currentPath, {
            withFileTypes: true
        });

        entries.forEach((entry) => {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                if (!ignoredFolders.includes(entry.name)) {
                    directories.push(fullPath);
                    scanFolder(fullPath);
                }
            } else {
                files.push(fullPath);
            }
        });
    };

    scanFolder(folderPath);

    return {
        totalFiles: files.length,
        totalDirectories: directories.length,
        files,
        directories
    };
};

module.exports = { analyzeFolder };