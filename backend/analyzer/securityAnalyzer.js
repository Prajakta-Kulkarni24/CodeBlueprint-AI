const analyzeSecurity = (code, language) => {
    const vulnerabilities = [];

    const addIssue = (severity, type, message, pattern) => {
        vulnerabilities.push({
            severity,
            type,
            message,
            pattern
        });
    };

    // Hardcoded passwords / secrets
    const secretPattern =
        /(password|passwd|api[_-]?key|secret|token)\s*[:=]\s*["'][^"']+["']/gi;

    if (secretPattern.test(code)) {
        addIssue(
            "High",
            "Hardcoded Secret",
            "Possible hardcoded password, API key, token, or secret detected.",
            "password / apiKey / secret / token"
        );
    }

    // JavaScript eval()
    if (
        language === "JavaScript" ||
        language === "React JavaScript" ||
        language === "TypeScript" ||
        language === "React TypeScript"
    ) {
        if (/\beval\s*\(/.test(code)) {
            addIssue(
                "High",
                "Dangerous Function",
                "eval() can execute arbitrary code and should generally be avoided.",
                "eval()"
            );
        }
    }

    // SQL injection risk
    if (/SELECT\s+.*\+\s*\w+|INSERT\s+.*\+\s*\w+|UPDATE\s+.*\+\s*\w+/i.test(code)) {
        addIssue(
            "High",
            "Possible SQL Injection",
            "SQL query appears to be constructed using string concatenation.",
            "SQL + variable"
        );
    }

    // Dangerous shell execution
    if (
        /child_process\s*\.\s*(exec|execSync)\s*\(/.test(code) ||
        /\bos\.system\s*\(/.test(code) ||
        /\bsystem\s*\(/.test(code)
    ) {
        addIssue(
            "High",
            "Command Execution",
            "Potentially dangerous operating-system command execution detected.",
            "exec / system"
        );
    }

    // Weak hashing algorithms
    if (
        /\b(md5|sha1)\b/i.test(code)
    ) {
        addIssue(
            "Medium",
            "Weak Cryptography",
            "MD5 or SHA-1 may be unsuitable for security-sensitive hashing.",
            "MD5 / SHA-1"
        );
    }

    // HTTP instead of HTTPS
    if (/http:\/\/(?!localhost|127\.0\.0\.1)/i.test(code)) {
        addIssue(
            "Medium",
            "Insecure Communication",
            "HTTP URL detected where HTTPS may be preferable.",
            "http://"
        );
    }

    return {
        securityIssues: vulnerabilities,
        totalIssues: vulnerabilities.length
    };
};

module.exports = { analyzeSecurity };