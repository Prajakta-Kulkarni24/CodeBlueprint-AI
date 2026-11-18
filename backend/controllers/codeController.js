const fs = require("fs");

const { detectLanguage } = require("../analyzer/languageDetector");
const { analyzeFile } = require("../analyzer/fileAnalyzer");
const { extractDependencies } = require("../analyzer/dependencyAnalyzer");
const { calculateMetrics } = require("../analyzer/codeMetrics");
const { analyzeSecurity } = require("../analyzer/securityAnalyzer");
const { analyzeArchitecture } = require("../analyzer/architectureAnalyzer");

const analyzeCode = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No code file found"
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Read source code
        const code = fs.readFileSync(filePath, "utf-8");

        // 1. Detect language
        const language = detectLanguage(fileName);

        // 2. Analyze file
        const fileAnalysis = analyzeFile(filePath, language);

        // 3. Extract dependencies
        const dependencies = extractDependencies(code, language);

        // 4. Calculate code metrics
        const metrics = calculateMetrics(code, language);

        // 5. Security analysis
        const security = analyzeSecurity(code, language);

       // 6. Architecture analysis
        const architecture = analyzeArchitecture({
            files: [
                {
                    id: fileName,
                    name: fileName,
                    type: "file",
                    language: language
                }
            ],
            dependencies: dependencies
                .filter((dependency) => dependency.type === "local")
                .map((dependency) => ({
                    from: fileName,
                    to: dependency.name
                })),
            language: language
        });

        res.status(200).json({
            message: "Code analyzed successfully",

            file: {
                name: fileName,
                language: language
            },

            fileAnalysis,

            dependencies,

            metrics,

            security,

            architecture
        });

    } catch (error) {
        console.error("Code analysis error:", error);

        res.status(500).json({
            message: "Failed to analyze code"
        });
    }
};

module.exports = { analyzeCode };