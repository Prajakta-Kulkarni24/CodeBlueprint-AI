# CodeBlueprint-AI - Intelligent Codebase Analysis and Architecture Visualization

CodeBlueprint AI is a web-based codebase analysis system designed to help students and developers understand software projects more easily. It analyzes uploaded source code, identifies programming languages, examines project structure, detects dependencies, performs basic security checks, and generates visual representations of software architecture.

The system aims to simplify code understanding and reduce the effort required for manually inspecting large or unfamiliar codebases.

# Key Features

- Codebase Upload: Upload project source files or ZIP files for analysis.
- Language Detection: Identify programming languages and supported frameworks from source files.
- File and Folder Analysis: Examine project structure, file counts, and folder organization.
- Code Metrics: Calculate total lines, non-empty lines, and comment lines.
- Dependency Analysis: Identify dependencies and relationships between project files.
- Architecture Visualization: Generate Mermaid-based architecture and dependency diagrams.
- Security Audit: Perform rule-based checks to identify potential security issues.
- Dashboard: Display project information and analysis summaries in one place.
- Project Management: Create, manage, and review uploaded projects.

# Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Tools and Libraries

- Mermaid.js – Architecture and dependency visualization
- Multer – File upload handling
- Git and GitHub – Version control and project management
- Visual Studio Code – Development environment

# Project Structure

CodeBlueprint-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── analyzers/
│   │   ├── fileAnalyzer/
│   │   ├── folderAnalyzer/
│   │   ├── languageDetector/
│   │   ├── dependencyAnalyzer/
│   │   ├── codeMetrics/
│   │   ├── securityAnalyzer/
│   │   └── architectureAnalyzer/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md

Note: The structure above represents the main project organization. Actual files and folders may vary.

# Installation and Setup

1. Clone the Repository

git clone https://github.com/Prajakta-Kulkarni24/CodeBlueprint-AI.git

2. Navigate to the Project

cd CodeBlueprint-AI

3. Backend Setup

cd backend
npm install

Configure your environment variables in a ".env" file according to the backend configuration. Set up your MongoDB connection.

Start the backend server:

npx nodemon server.js

4. Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

5. Access the Application

Open the local development URL displayed by Vite in your terminal (usually "http://localhost:5173").

Make sure the backend server and MongoDB connection are running.

# How It Works

1. Upload: The user uploads a source-code project or ZIP file.
2. Analysis: The backend processes the uploaded files using different analyzer modules.
3. Detection: The system identifies programming languages, file information, and dependencies.
4. Metrics: Code statistics and project information are calculated.
5. Visualization: Architecture and dependency information is used to generate Mermaid diagrams.
6. Results: The analyzed information is presented through the application dashboard and analysis pages.

# Project Objectives

- Simplify the understanding of unfamiliar software projects.
- Automate basic source-code inspection and analysis.
- Identify project dependencies and structural relationships.
- Generate visual representations of software architecture.
- Provide a centralized platform for codebase documentation and analysis.

# Future Enhancements

- Advanced AI-assisted code explanations.
- Support for additional programming languages and frameworks.
- More comprehensive security vulnerability detection.
- Improved architecture and dependency visualization.
- Automated code quality recommendations.
- Exportable code analysis reports.

# Project Status

This project is developed as a final-year engineering project. The current implementation focuses on rule-based static code analysis and architecture visualization, with scope for future AI-assisted enhancements.

# Author

Developed as a final-year Computer Science and Engineering project.

---

# Repository:
"CodeBlueprint AI – GitHub" (https://github.com/Prajakta-Kulkarni24/CodeBlueprint-AI)
