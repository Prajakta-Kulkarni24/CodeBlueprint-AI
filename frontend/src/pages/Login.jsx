import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import "../styles/Login.css";

function Login() {
    const [darkMode, setDarkMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Login failed"
            );
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        navigate("/dashboard");

    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};

    return (
        <div
            className={
                darkMode
                    ? "login-page dark-theme"
                    : "login-page light-theme"
            }
        >

            {/* =====================================================
                HEADER
               ===================================================== */}

            <header className="login-topbar">

                <Link
                    to="/"
                    className="login-logo"
                >
                    Code<span>Blueprint</span> AI
                </Link>

                <nav className="login-nav">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>

                    <button
                        type="button"
                        className="login-theme-toggle"
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

                </nav>

            </header>


            {/* =====================================================
                MAIN LOGIN AREA
               ===================================================== */}

            <main className="login-container">

                <section className="login-card">

                    {/* =================================================
                        LOGIN HEADING
                       ================================================= */}

                    <div className="login-heading">

                        <div className="login-icon">
                            &lt;/&gt;
                        </div>

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Sign in to continue to
                            CodeBlueprint AI.
                        </p>

                    </div>


                    {/* =================================================
                        LOGIN FORM
                       ================================================= */}

                    <form className="login-form"
                    onSubmit={handleLogin}>

                        {/* Email */}

                        <div className="login-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>


                        {/* Password */}

                        <div className="login-field">

                            <div className="password-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="forgot-password"
                                >
                                    Forgot password?
                                </Link>

                            </div>


                            <div className="password-input-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "◉"
                                        : "◌"}
                                </button>

                            </div>

                        </div>


                        {/* Remember Me */}

                        <div className="login-options">

                            <label className="remember-me">

                                <input
                                    type="checkbox"
                                />

                                <span>
                                    Remember me
                                </span>

                            </label>

                        </div>

{error && (
    <p 
    className="login-error">
        {error}
    </p>
) }
                        {/* Sign In */}

                        <button
                            type="submit"
                            className="login-submit-btn"
                        >
                            Sign In

                            <span>
                                →
                            </span>

                        </button>


                        {/* Register */}

                        <div className="login-register">

                            <span>
                                Don't have an account?
                            </span>

                            <Link to="/register">
                                Create an account
                            </Link>

                        </div>


                        {/* =================================================
                            SECURITY MESSAGE
                           ================================================= */}

                        <div className="login-security">

                            <span>
                                🔒
                            </span>

                            <p>
                                Your code and project data are
                                securely protected.
                            </p>

                        </div>

                    </form>

                </section>

            </main>


            {/* =====================================================
                FOOTER
               ===================================================== */}

            <footer className="login-footer">

                <div className="login-footer-content">

                    {/* Footer Brand */}

                    <div className="login-footer-brand">

                        <Link
                            to="/"
                            className="login-logo"
                        >
                            Code<span>Blueprint</span> AI
                        </Link>

                        <p>
                            Intelligent code analysis and
                            architecture visualization for
                            modern developers.
                        </p>

                    </div>


                    {/* Footer Links */}

                    <div className="login-footer-links">

                        <a href="/#features">
                            Features
                        </a>

                        <a href="/#how-it-works">
                            How It Works
                        </a>

                        <a href="/#built-for-developers">
                            For Developers
                        </a>

                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>

                    </div>

                </div>


                {/* Footer Bottom */}

                <div className="login-footer-bottom">

                    © 2026 CodeBlueprint AI. All rights reserved.

                </div>

            </footer>

        </div>
    );
}

export default Login;