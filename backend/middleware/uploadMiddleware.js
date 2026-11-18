const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Store uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 60);

        cb(null, `${safeName}-${uniqueSuffix}${ext}`);
    },
});

// Allowed text-based code and project file extensions
const allowedExtensions = new Set([
    ".js", ".jsx", ".ts", ".tsx",
    ".html", ".htm", ".css", ".scss",
    ".json",
    ".py",
    ".java",
    ".c", ".cpp", ".h", ".hpp",
    ".php",
    ".sql",
    ".md", ".txt",
    ".xml",
    ".yml", ".yaml",
    ".sh", ".bat",
    ".properties",
    ".go",
    ".rs",
    ".rb",
    ".swift",
    ".kt",
    ".kts",
    ".vue",
    ".svelte", 
    ".jpg", ".jpeg", ".png", ".gif", ".webp"
]);

// Files that should not be uploaded
const ignoredNames = new Set([
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
]);

const fileFilter = (req, file, cb) => {
    const originalName = path.basename(file.originalname);
    const ext = path.extname(originalName).toLowerCase();

    // Do not upload secret environment files
    if (
        ignoredNames.has(originalName.toLowerCase()) ||
        originalName.toLowerCase().startsWith(".env.")
    ) {
        return cb(null, false);
    }

    // Skip unsupported file types instead of rejecting the entire folder
    if (!allowedExtensions.has(ext)) {
        console.log(`Skipped unsupported file: ${file.originalname}`);
        return cb(null, false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 100,
    },
});

module.exports = upload;