
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
    const [darkMode, setDarkMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Handle Registration
    |--------------------------------------------------------------------------
    */

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Validate fields
        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed. Please try again."
                );
            }

            setSuccess("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(
                err.message || "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={
                darkMode
                    ? "register-page dark-theme"
                    : "register-page light-theme"
            }
        >

            {/* =====================================================
                HEADER
               ===================================================== */}

            <header className="register-topbar">

                <Link
                    to="/"
                    className="register-logo"
                >
                    Code<span>Blueprint</span> AI
                </Link>

                <nav className="register-nav">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/login">
                        Login
                    </Link>

                    <button
                        type="button"
                        className="register-theme-toggle"
                        onClick={() => setDarkMode(!darkMode)}
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
                MAIN REGISTER AREA
               ===================================================== */}

            <main className="register-container">

                <section className="register-card">

                    {/* =================================================
                        REGISTER HEADING
                       ================================================= */}

                    <div className="register-heading">

                        <div className="register-icon">
                            +
                        </div>

                        <h1>
                            Create Your Account
                        </h1>

                        <p>
                            Join CodeBlueprint AI and
                            start analyzing your code.
                        </p>

                    </div>


                    {/* =================================================
                        REGISTER FORM
                       ================================================= */}

                    <form
                        className="register-form"
                        onSubmit={handleRegister}
                    >

                        {/* Name */}

                        <div className="register-field">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                        </div>


                        {/* Email */}

                        <div className="register-field">

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

                        <div className="register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-show-password"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "◉" : "◌"}
                                </button>

                            </div>

                        </div>


                        {/* Confirm Password */}

                        <div className="register-field">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-show-password"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    title={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? "◉" : "◌"}
                                </button>

                            </div>

                        </div>


                        {/* Error and Success Messages */}

                        {error && (
                            <p
                                className="register-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                className="register-success"
                                role="status"
                            >
                                {success}
                            </p>
                        )}


                        {/* =================================================
                            CREATE ACCOUNT BUTTON
                           ================================================= */}

                        <button
                            type="submit"
                            className="register-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"
                            }

                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>


                        {/* =================================================
                            LOGIN LINK
                           ================================================= */}

                        <div className="register-login">

                            <span>
                                Already have an account?
                            </span>

                            <Link to="/login">
                                Sign in
                            </Link>

                        </div>


                        {/* =================================================
                            SECURITY MESSAGE
                           ================================================= */}

                        <div className="register-security">

                            <span>
                                🔒
                            </span>

                            <p>
                                Your account and project data are
                                securely protected.
                            </p>

                        </div>

                    </form>

                </section>

            </main>


            {/* =====================================================
                FOOTER
               ===================================================== */}

            <footer className="register-footer">

                <div className="register-footer-content">

                    {/* Footer Brand */}

                    <div className="register-footer-brand">

                        <Link
                            to="/"
                            className="register-logo"
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

                    <div className="register-footer-links">

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

                <div className="register-footer-bottom">

                    © 2026 CodeBlueprint AI. All rights reserved.

                </div>

            </footer>

        </div>
    );
}

export default Register;
