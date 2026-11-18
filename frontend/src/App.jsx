

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CodeUpload from "./pages/codeUpload";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import CodeAnalysis from "./pages/CodeAnalysis";
import ArchitectureDiagram from "./pages/ArchitectureDiagram";
import SecurityAudit from "./pages/SecurityAudit";
import TechnicalDebt from "./pages/TechnicalDebt";
import Profile from "./pages/Profile";
import ProjectOverview from "./pages/ProjectOverview";
import AITest from "./pages/AITest";
import AIAssistant from "./pages/AIAssistant";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Home */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Register */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* Projects */}
                <Route
                    path="/projects"
                    element={<Projects />}
                />

               <Route
               path="/upload"
               element={<CreateProject />}
               />

               <Route
               path="/create-project"
               element={<CreateProject />}
              />
               

               <Route
               path="/analysis"
               element={<CodeAnalysis />}
               />
               
               <Route
               path="/architecture"
               element={<ArchitectureDiagram />}
               />

               <Route
               path="/security"
               element={<SecurityAudit />}
               />

               <Route
               path="/technical-debt"
               element={<TechnicalDebt />}
               />

                <Route
               path="/profile"
               element={<Profile />}
               />

                <Route
               path="/projects/:id"
               element={<ProjectOverview />}
               />

                <Route
               path="/ai-test/"
               element={<AITest />}
               />

               <Route
            path="/ai-assistant"
            element={<AIAssistant />}
               />


            </Routes>

        </BrowserRouter>
    );
}

export default App;

