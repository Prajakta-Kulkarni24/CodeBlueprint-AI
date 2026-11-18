import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div
            className={
                darkMode
                    ? "home-page dark-theme"
                    : "home-page light-theme"
            }
        >

            {/* ================= NAVBAR ================= */}

            <nav className="home-navbar">

                <Link to="/" className="home-logo">
                    Code<span>Blueprint</span> AI
                </Link>

                <div className="home-nav-links">

                    <a href="#features">
                        Features
                    </a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                    <a href="#built-for-developers">
                        For Developers
                    </a>

                    <Link
                        to="/login"
                        className="login-link"
                    >
                        Login
                    </Link>

                    {/* Dark / Light Mode */}

                    <button
                        className="theme-toggle"
                        onClick={() =>
                            setDarkMode(!darkMode)
                        }
                        title={
                            darkMode
                                ? "Switch to Light Mode"
                                : "Switch to Dark Mode"
                        }
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                    <Link
                        to="/register"
                        className="get-started-btn"
                    >
                        Get Started
                    </Link>

                </div>

            </nav>


            {/* ================= HERO ================= */}

            <section className="home-hero">

                <div className="hero-glow glow-one"></div>

                <div className="hero-glow glow-two"></div>


                <div className="home-hero-content">

                    <div className="hero-badge">

                        <span className="badge-dot"></span>

                        AI-Powered Code Intelligence

                    </div>


                    <h1>

                        Turn Your Code Into a

                        <span>
                            Blueprint.
                        </span>

                    </h1>


                    <p className="hero-description">

                        CodeBlueprint AI analyzes your codebase
                        and transforms complex source code into
                        understandable architecture, quality
                        metrics, security insights and technical
                        risk reports.

                    </p>


                    <div className="hero-actions">

                        <Link
                            to="/register"
                            className="hero-primary-btn"
                        >
                            Analyze Your Code

                            <span>
                                →
                            </span>

                        </Link>


                        <a
                            href="#how-it-works"
                            className="hero-secondary-btn"
                        >
                            See How It Works
                        </a>

                    </div>


                    <div className="hero-trust">

                        <span>
                            <b>✓</b>
                            Architecture Mapping
                        </span>

                        <span>
                            <b>✓</b>
                            Security Analysis
                        </span>

                        <span>
                            <b>✓</b>
                            Technical Risk
                        </span>

                    </div>

                </div>
                {/* ================= CODE VISUAL ================= */}

                <div className="hero-code-wrapper">

                    <div className="code-glow"></div>

                    <div className="hero-code-window">

                        {/* Code Window Header */}

                        <div className="code-window-header">

                            <div className="window-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="window-title">
                                CodeBlueprint / analysis
                            </div>

                            <div className="window-status">
                                ● Live Analysis
                            </div>

                        </div>


                        {/* Code */}

                        <div className="code-window-body">

                            <div>
                                <span className="line-number">
                                    01
                                </span>

                                <span className="code-keyword">
                                    import
                                </span>{" "}

                                analyzer{" "}

                                <span className="code-keyword">
                                    from
                                </span>{" "}

                                <span className="code-string">
                                    "codeblueprint"
                                </span>;
                            </div>


                            <div>
                                <span className="line-number">
                                    02
                                </span>
                            </div>


                            <div>
                                <span className="line-number">
                                    03
                                </span>

                                <span className="code-keyword">
                                    const
                                </span>{" "}

                                project = analyzer.analyze(codebase);
                            </div>


                            <div>
                                <span className="line-number">
                                    04
                                </span>
                            </div>


                            <div>
                                <span className="line-number">
                                    05
                                </span>

                                project.

                                <span className="code-function">
                                    architecture
                                </span>
                                ();
                            </div>


                            <div>
                                <span className="line-number">
                                    06
                                </span>

                                project.

                                <span className="code-function">
                                    securityAudit
                                </span>
                                ();
                            </div>


                            <div>
                                <span className="line-number">
                                    07
                                </span>

                                project.

                                <span className="code-function">
                                    technicalDebt
                                </span>
                                ();
                            </div>


                            <div>
                                <span className="line-number">
                                    08
                                </span>
                            </div>


                            <div>
                                <span className="line-number">
                                    09
                                </span>

                                <span className="code-comment">
                                    // Your code. Clearly understood.
                                </span>
                            </div>

                        </div>


                        {/* Analysis Result */}

                        <div className="analysis-card">

                            <div className="analysis-header">

                                <div>

                                    <span className="success-icon">
                                        ✓
                                    </span>

                                    Analysis Complete

                                </div>

                                <span className="analysis-status">
                                    ●
                                </span>

                            </div>


                            <div className="analysis-metrics">

                                <div className="metric">

                                    <small>
                                        QUALITY
                                    </small>

                                    <strong>
                                        92%
                                    </strong>

                                    <span className="metric-positive">
                                        Excellent
                                    </span>

                                </div>


                                <div className="metric">

                                    <small>
                                        SECURITY
                                    </small>

                                    <strong>
                                        96%
                                    </strong>

                                    <span className="metric-positive">
                                        Secure
                                    </span>

                                </div>


                                <div className="metric">

                                    <small>
                                        DEBT
                                    </small>

                                    <strong>
                                        Low
                                    </strong>

                                    <span className="metric-positive">
                                        Healthy
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Floating Architecture Card */}

                    <div className="floating-card architecture-floating">

                        <div className="floating-icon">
                            🏗️
                        </div>

                        <div>

                            <small>
                                ARCHITECTURE
                            </small>

                            <strong>
                                12 Components
                            </strong>

                        </div>

                    </div>


                    {/* Floating Security Card */}

                    <div className="floating-card security-floating">

                        <div className="floating-icon">
                            🛡️
                        </div>

                        <div>

                            <small>
                                SECURITY
                            </small>

                            <strong>
                                0 Critical Issues
                            </strong>

                        </div>

                    </div>

                </div>

            </section>
            {/* ================= FEATURES ================= */}

            <section
                id="features"
                className="home-section features-section"
            >

                <div className="section-heading">

                    <div className="section-label">
                        POWERFUL ANALYSIS
                    </div>

                    <h2>
                        Everything You Need to Understand Your Code
                    </h2>

                    <p>
                        One intelligent platform to analyze, visualize
                        and improve your software projects.
                    </p>

                </div>


                <div className="features-grid">

                    {/* Architecture */}

                    <div className="feature-card">

                        <div className="feature-top">

                            <div className="feature-icon">
                                🏗️
                            </div>

                            <span>
                                01
                            </span>

                        </div>

                        <h3>
                            Architecture Diagram
                        </h3>

                        <p>
                            Automatically generate visual architecture
                            maps showing components, dependencies and
                            system boundaries.
                        </p>

                        <div className="feature-link">
                            Explore Architecture →
                        </div>

                    </div>


                    {/* Code Analysis */}

                    <div className="feature-card">

                        <div className="feature-top">

                            <div className="feature-icon">
                                📊
                            </div>

                            <span>
                                02
                            </span>

                        </div>

                        <h3>
                            Code Analysis
                        </h3>

                        <p>
                            Measure lines of code, code density,
                            comments, functions, complexity and
                            file-level statistics.
                        </p>

                        <div className="feature-link">
                            Analyze Code →
                        </div>

                    </div>


                    {/* Security */}

                    <div className="feature-card">

                        <div className="feature-top">

                            <div className="feature-icon">
                                🛡️
                            </div>

                            <span>
                                03
                            </span>

                        </div>

                        <h3>
                            Security Audit
                        </h3>

                        <p>
                            Identify potential vulnerabilities with
                            OWASP-oriented checks and actionable
                            recommendations.
                        </p>

                        <div className="feature-link">
                            Run Security Audit →
                        </div>

                    </div>


                    {/* Technical Debt */}

                    <div className="feature-card">

                        <div className="feature-top">

                            <div className="feature-icon">
                                ⚠️
                            </div>

                            <span>
                                04
                            </span>

                        </div>

                        <h3>
                            Technical Debt
                        </h3>

                        <p>
                            Detect code smells, maintainability
                            concerns and technical risks across
                            your project.
                        </p>

                        <div className="feature-link">
                            View Risk Report →
                        </div>

                    </div>

                </div>

            </section>
            {/* ================= HOW IT WORKS ================= */}

            <section
                id="how-it-works"
                className="home-section workflow-section"
            >

                <div className="section-heading">

                    <div className="section-label">
                        SIMPLE WORKFLOW
                    </div>

                    <h2>
                        From Source Code to Blueprint
                    </h2>

                    <p>
                        Understand your entire project in four simple steps.
                    </p>

                </div>


                <div className="workflow">

                    {/* Step 1 */}

                    <div className="workflow-step">

                        <div className="workflow-number">
                            01
                        </div>

                        <div className="workflow-icon">
                            📤
                        </div>

                        <h3>
                            Upload
                        </h3>

                        <p>
                            Upload your project ZIP or individual
                            source files.
                        </p>

                    </div>


                    <div className="workflow-connector"></div>


                    {/* Step 2 */}

                    <div className="workflow-step">

                        <div className="workflow-number">
                            02
                        </div>

                        <div className="workflow-icon">
                            🔍
                        </div>

                        <h3>
                            Analyze
                        </h3>

                        <p>
                            CodeBlueprint analyzes your complete
                            codebase.
                        </p>

                    </div>


                    <div className="workflow-connector"></div>


                    {/* Step 3 */}

                    <div className="workflow-step">

                        <div className="workflow-number">
                            03
                        </div>

                        <div className="workflow-icon">
                            🗺️
                        </div>

                        <h3>
                            Visualize
                        </h3>

                        <p>
                            Explore architecture, dependencies
                            and code metrics.
                        </p>

                    </div>


                    <div className="workflow-connector"></div>


                    {/* Step 4 */}

                    <div className="workflow-step">

                        <div className="workflow-number">
                            04
                        </div>

                        <div className="workflow-icon">
                            🚀
                        </div>

                        <h3>
                            Improve
                        </h3>

                        <p>
                            Fix issues and continuously improve
                            your codebase.
                        </p>

                    </div>

                </div>

            </section>
           {/* ================= BUILT FOR DEVELOPERS ================= */}

            <section
            id="built-for-developers"
            className="home-section developer-section"
            >

            <div className="section-heading">

            <div className="section-label">
            BUILT FOR DEVELOPERS
            </div>

            <h2>
            From First Upload to Better Code
            </h2>

            <p>
            CodeBlueprint AI turns complex codebases into
            clear insights that help developers work smarter.
            </p>

            </div>


            <div className="developer-layout">

            {/* Left Side */}

            <div className="developer-main-card">
 
            <div className="developer-card-icon">
                {"</>"}
            </div>

            <h3>
                Your Codebase.
                <br />
                Clearly Understood.
            </h3>

            <p>
                Stop spending hours manually exploring
                unfamiliar projects. CodeBlueprint AI gives
                you a structured view of your software in one
                place.
            </p>

            <div className="developer-card-line"></div>

            <span>
                Analyze • Understand • Improve
            </span>

        </div>


        {/* Right Side */}

        <div className="developer-benefits">

            {/* Benefit 1 */}

            <div className="developer-benefit">

                <div className="benefit-number">
                    01
                </div>

                <div>

                    <h3>
                        Any Codebase
                    </h3>

                    <p>
                        Analyze individual source files or
                        complete projects from a single upload.
                    </p>

                </div>

            </div>


            {/* Benefit 2 */}

            <div className="developer-benefit">

                <div className="benefit-number">
                    02
                </div>

                <div>

                    <h3>
                        Instant Insights
                    </h3>

                    <p>
                        Get meaningful analysis without manually
                        reviewing thousands of lines of code.
                    </p>

                </div>

            </div>


            {/* Benefit 3 */}

            <div className="developer-benefit">

                <div className="benefit-number">
                    03
                </div>

                <div>

                    <h3>
                        Clear Visuals
                    </h3>

                    <p>
                        Understand architecture and dependencies
                        through easy-to-read visual diagrams.
                    </p>

                </div>

            </div>


            {/* Benefit 4 */}

            <div className="developer-benefit">

                <div className="benefit-number">
                    04
                </div>

                <div>

                    <h3>
                        Actionable Reports
                    </h3>

                    <p>
                        Turn security, quality and technical
                        debt findings into practical improvements.
                    </p>

                   </div>

                   </div>

                   </div>

                   </div>

                   </section>
            {/* ================= CTA ================= */}

            <section className="home-cta">

                <div className="cta-glow"></div>

                <div className="cta-content">

                    <div className="section-label">
                        START ANALYZING
                    </div>

                    <h2>
                        Give Your Code a Blueprint.
                    </h2>

                    <p>
                        Upload your project and discover what is
                        happening inside your codebase.
                    </p>

                    <Link
                        to="/register"
                        className="hero-primary-btn"
                    >
                        Start Your Analysis

                        <span>
                            →
                        </span>

                    </Link>

                </div>

            </section>


            {/* ================= FOOTER ================= */}

            <footer className="home-footer">

                <div className="footer-brand">

                    <Link
                        to="/"
                        className="home-logo"
                    >
                        Code<span>Blueprint</span> AI
                    </Link>

                    <p>
                        Intelligent code analysis and architecture
                        visualization for modern developers.
                    </p>

                </div>


                <div className="footer-links">

                    <a href="#features">
                        Features
                    </a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                    <a href="#built-for-developers">
                        For Developers
                    </a>

                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>

                </div>


                <div className="footer-bottom">

                    <span>
                        © 2026 CodeBlueprint AI. All rights reserved.
                    </span>

                </div>

            </footer>


        </div>
    );
}


export default Home;