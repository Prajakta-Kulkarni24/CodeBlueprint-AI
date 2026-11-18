import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/profile.css";
import "../styles/sidebar.css";

const Profile = () => {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme =
            localStorage.getItem("dashboardTheme");

        if (savedTheme) {
            return savedTheme === "dark";
        }

        return true;
    });

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user")
            ) || {};
        } catch {
            return {};
        }
    });

    const [name, setName] = useState(
        user?.name || ""
    );

    const [email, setEmail] = useState(
        user?.email || ""
    );

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [profileMessage, setProfileMessage] =
        useState("");

    const [passwordMessage, setPasswordMessage] =
        useState("");

    useEffect(() => {
        localStorage.setItem(
            "dashboardTheme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const toggleSidebar = () => {
        setSidebarCollapsed(
            previous => !previous
        );
    };

    const toggleTheme = () => {
        setDarkMode(
            previous => !previous
        );
    };

    const handleProfileSave = (event) => {
        event.preventDefault();

        const updatedUser = {
            ...user,
            name,
            email,
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setUser(updatedUser);

        setProfileMessage(
            "Profile information updated successfully."
        );

        setTimeout(() => {
            setProfileMessage("");
        }, 3000);
    };

    const handlePasswordChange = (event) => {
        event.preventDefault();

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setPasswordMessage(
                "Please fill in all password fields."
            );

            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage(
                "New password must contain at least 6 characters."
            );

            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage(
                "New password and confirm password do not match."
            );

            return;
        }

        /*
         * Password API can be connected here
         * when the backend password-update
         * endpoint is added.
         */
        setPasswordMessage(
            "Password validation completed. Password update API can be connected here."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
            setPasswordMessage("");
        }, 4000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const getInitials = () => {
        if (!name) {
            return "U";
        }

        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div
            className={`profile-page ${
                darkMode
                    ? "dark-theme"
                    : "light-theme"
            }`}
        >
            {!sidebarCollapsed && (
                <aside className="dashboard-sidebar">
                    <div className="sidebar-top-row">
                        <button
                            type="button"
                            className="sidebar-close-btn"
                            onClick={toggleSidebar}
                            title="Close Sidebar"
                            aria-label="Close Sidebar"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <div className="sidebar-brand">
                            <div className="sidebar-brand-text">
                                <span>
                                    CodeBlueprint
                                </span>
                                <span>AI</span>
                            </div>
                        </div>
                    </div>

                    <nav className="dashboard-nav">
                        <div className="sidebar-section-title">
                            WORKSPACE
                        </div>

                        <Link
                            to="/dashboard"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ▦
                            </span>
                            <span>Overview</span>
                        </Link>

                        <Link
                            to="/projects"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ▣
                            </span>
                            <span>Projects</span>
                        </Link>

                        <Link
                            to="/create-project"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                +
                            </span>
                            <span>
                                Create Project
                            </span>
                        </Link>

                        <div className="sidebar-section-title">
                            CODE INSIGHTS
                        </div>

                        <Link
                            to="/analysis"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◇
                            </span>
                            <span>
                                Code Analysis
                            </span>
                        </Link>

                        <Link
                            to="/architecture"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ⌁
                            </span>
                            <span>
                                Architecture Diagram
                            </span>
                        </Link>

                        <Link
                            to="/security"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◉
                            </span>
                            <span>
                                Security Audit
                            </span>
                        </Link>

                        <Link
                            to="/technical-debt"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ◈
                            </span>
                            <span>
                                Technical Debt
                            </span>
                        </Link>

                                                <div className="sidebar-section-title">
                            AI TOOLS
                        </div>

                        <Link
                            to="/ai-assistant"
                            className="sidebar-nav-item"
                        >
                            <span className="sidebar-icon">
                                ✧
                            </span>

                            <span>
                                AI Assistant
                            </span>
                        </Link>

                    </nav>

                    <div className="sidebar-bottom">
                        <div className="sidebar-divider"></div>

                        <button
                            type="button"
                            className="sidebar-nav-item"
                            onClick={toggleTheme}
                        >
                            <span className="sidebar-icon">
                                {darkMode
                                    ? "☀"
                                    : "☾"}
                            </span>

                            <span>
                                {darkMode
                                    ? "Light Mode"
                                    : "Dark Mode"}
                            </span>
                        </button>

                        <Link
                            to="/profile"
                            className="sidebar-nav-item active"
                        >
                            <span className="sidebar-icon">
                                ⚙
                            </span>

                            <span>
                                Profile & Settings
                            </span>
                        </Link>

                        <button
                            type="button"
                            className="sidebar-nav-item sidebar-logout"
                            onClick={handleLogout}
                        >
                            <span className="sidebar-icon">
                                ↪
                            </span>

                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

            {sidebarCollapsed && (
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    title="Open Sidebar"
                    aria-label="Open Sidebar"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}

            <main className="profile-main">

                {/* Header */}

                <header className="profile-header">
                    <div>
                        <h1>
                            Profile & Settings
                        </h1>

                        <p>
                            Manage your account
                            information, password,
                            and application preferences.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="profile-theme-btn"
                        onClick={toggleTheme}
                    >
                        {darkMode
                            ? "☀"
                            : "☾"}
                    </button>
                </header>

                {/* Profile Card */}

                <section className="profile-section">
                    <div className="profile-section-heading">
                        <div>
                            <h2>
                                Profile Information
                            </h2>

                            <p>
                                Update your personal
                                account information.
                            </p>
                        </div>
                    </div>

                    <div className="profile-content">

                        <div className="profile-avatar">
                            {getInitials()}
                        </div>

                        <form
                            className="profile-form"
                            onSubmit={
                                handleProfileSave
                            }
                        >
                            <div className="profile-form-grid">

                                <div className="profile-field">
                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={
                                            event =>
                                                setName(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="profile-field">
                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={
                                            event =>
                                                setEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Enter your email"
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="profile-save-btn"
                            >
                                Save Changes
                            </button>

                            {profileMessage && (
                                <p className="success-message">
                                    {profileMessage}
                                </p>
                            )}
                        </form>

                    </div>
                </section>

                {/* Password */}

                <section className="profile-section">
                    <div className="profile-section-heading">
                        <div>
                            <h2>
                                Change Password
                            </h2>

                            <p>
                                Update your account
                                password to keep your
                                account secure.
                            </p>
                        </div>
                    </div>

                    <form
                        className="password-form"
                        onSubmit={
                            handlePasswordChange
                        }
                    >
                        <div className="profile-field">
                            <label>
                                Current Password
                            </label>

                            <input
                                type="password"
                                value={
                                    currentPassword
                                }
                                onChange={
                                    event =>
                                        setCurrentPassword(
                                            event
                                                .target
                                                .value
                                        )
                                }
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="profile-form-grid">

                            <div className="profile-field">
                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        newPassword
                                    }
                                    onChange={
                                        event =>
                                            setNewPassword(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="profile-field">
                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={
                                        event =>
                                            setConfirmPassword(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                    placeholder="Confirm new password"
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="profile-save-btn"
                        >
                            Update Password
                        </button>

                        {passwordMessage && (
                            <p className="password-message">
                                {passwordMessage}
                            </p>
                        )}
                    </form>
                </section>

                {/* Appearance */}

                <section className="profile-section">
                    <div className="profile-section-heading">
                        <div>
                            <h2>
                                Appearance
                            </h2>

                            <p>
                                Choose how CodeBlueprint
                                AI looks on your device.
                            </p>
                        </div>
                    </div>

                    <div className="appearance-row">

                        <div>
                            <h3>
                                Theme
                            </h3>

                            <p>
                                Currently using{" "}
                                {darkMode
                                    ? "Dark Mode"
                                    : "Light Mode"}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="appearance-toggle"
                            onClick={toggleTheme}
                        >
                            {darkMode
                                ? "Switch to Light"
                                : "Switch to Dark"}
                        </button>

                    </div>
                </section>

                {/* Account */}

                <section className="profile-section account-section">
                    <div className="profile-section-heading">
                        <div>
                            <h2>
                                Account
                            </h2>

                            <p>
                                Manage your current
                                CodeBlueprint AI session.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="profile-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </section>

                <footer className="profile-footer">
                    © 2026 CodeBlueprint AI.
                    All rights reserved.
                </footer>

            </main>
        </div>
    );
};

export default Profile;