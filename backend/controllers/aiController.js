
const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");

const { getProjectById } = require("../services/projectService");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/*
|--------------------------------------------------------------------------
| Build Project Context
|--------------------------------------------------------------------------
*/

const buildProjectContext = (project) => {
    const analysis = project.analysis || {};
    const architecture = analysis.architecture || {};

    const files = (project.files || []).slice(0, 150).map((file) => ({
        name: file.originalName,
        language: file.language,
        type: file.type,
        lines: file.lines,
        extension: file.extension
    }));

    const nodes = (architecture.nodes || []).slice(0, 150).map((node) => ({
        name: node.name,
        path: node.path,
        language: node.language,
        type: node.type
    }));

    const edges = (architecture.edges || []).slice(0, 200).map((edge) => ({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label
    }));

    const dependencies = (analysis.dependencies || [])
        .slice(0, 200)
        .map((dependency) => ({
            sourceFile: dependency.sourceFile,
            name: dependency.name,
            type: dependency.type,
            kind: dependency.kind
        }));

    return JSON.stringify({
        project: {
            name: project.name,
            description: project.description,
            sourceType: project.sourceType,
            primaryLanguage: project.language,
            fileCount: project.fileCount,
            codeLines: project.codeLines,
            securityIssues: project.securityIssues,
            technicalDebtScore: project.technicalDebtScore,
            status: project.status
        },

        analysis: {
            languageCounts: analysis.languageCounts || {},
            codeFileCount: analysis.codeFileCount || 0,
            assetFileCount: analysis.assetFileCount || 0,
            totalFiles: analysis.totalFiles || 0,
            totalLines: analysis.totalLines || 0,
            nonEmptyLines: analysis.nonEmptyLines || 0,
            commentLines: analysis.commentLines || 0,
            metrics: analysis.metrics || {}
        },

        files,
        architecture: {
            type: architecture.type,
            nodes,
            edges
        },
        dependencies
    }, null, 2);
};

/*
|--------------------------------------------------------------------------
| Chat With AI
|--------------------------------------------------------------------------
*/

const chatWithAI = async (req, res) => {
    try {
        const {
            message,
            chatHistory = [],
            projectId
        } = req.body;

        // Check Gemini API configuration
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured."
            });
        }

        // Validate message
        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Message is too long. Please keep it under 10,000 characters."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch Selected Project
        |--------------------------------------------------------------------------
        */

        let projectContext = "No project is currently selected.";

        if (projectId) {
            if (!mongoose.isValidObjectId(projectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID."
                });
            }

            // Fetch only a project belonging to the logged-in user.
            const project = await getProjectById(
                projectId,
                req.user.userId
            );

            projectContext = buildProjectContext(project);
        }

        /*
        |--------------------------------------------------------------------------
        | System Instructions
        |--------------------------------------------------------------------------
        */

        const systemInstruction = `
You are CodeBlueprint AI Assistant, an expert software development assistant.

Your responsibilities:
1. Explain programming concepts and source code.
2. Help developers understand errors and debug code.
3. Explain project architecture and dependencies.
4. Explain security issues and suggest safe fixes.
5. Recommend code quality and maintainability improvements.
6. Answer general programming questions even when no project is selected.

Rules:
- Give clear, beginner-friendly explanations.
- Use code examples when useful.
- Do not invent project files, dependencies, or analysis results.
- Use the supplied project context for project-specific questions.
- Clearly distinguish general programming knowledge from facts about the selected project.
- Project context contains file metadata and analysis, not complete source-code contents.
- Never claim to have read source code that was not provided.
- If information is missing, clearly say so.
- Never claim that you executed or tested code when you have not.
- If no project is selected, answer general programming questions normally.
`;

        /*
        |--------------------------------------------------------------------------
        | Prepare Chat History
        |--------------------------------------------------------------------------
        */

        const history = Array.isArray(chatHistory)
            ? chatHistory
                .slice(-10)
                .filter(
                    (item) =>
                        item &&
                        ["user", "model"].includes(item.role) &&
                        typeof item.text === "string"
                )
                .map((item) => ({
                    role: item.role,
                    parts: [
                        {
                            text: item.text.slice(0, 5000)
                        }
                    ]
                }))
            : [];

        /*
        |--------------------------------------------------------------------------
        | Prepare Gemini Request
        |--------------------------------------------------------------------------
        */

        const contents = [
            ...history,
            {
                role: "user",
                parts: [
                    {
                        text: `
PROJECT CONTEXT:

${projectContext}

USER QUESTION:

${message.trim()}
`
                    }
                ]
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
                systemInstruction,
                temperature: 0.5,
                maxOutputTokens: 2048
            }
        });

        const reply = response.text;

        if (!reply) {
            throw new Error("The AI returned an empty response.");
        }

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("Gemini AI Error:", error);

        if (
            error.message === "Project not found."
        ) {
            return res.status(404).json({
                success: false,
                message: "Project not found or you do not have access to it."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to generate an AI response. Please try again."
        });
    }
};

module.exports = { chatWithAI };
