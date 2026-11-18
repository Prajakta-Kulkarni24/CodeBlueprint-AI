const fs = require("fs");

const analyzeFile = (filePath, language) => {
    const code = fs.readFileSync(filePath, "utf-8");

    const lines = code.split(/\r?\n/);

    const totalLines = lines.length;

    const nonEmptyLines = lines.filter(
        (line) => line.trim() !== ""
    ).length;

    // -------------------------
    // Comment Detection
    // -------------------------

    let commentLines = 0;

    if (
        language === "Python" ||
        language === "Ruby" ||
        language === "Bash/Shell"
    ) {
        commentLines = lines.filter(
            (line) => line.trim().startsWith("#")
        ).length;
    } else {
        commentLines = lines.filter(
            (line) =>
                line.trim().startsWith("//") ||
                line.trim().startsWith("/*") ||
                line.trim().startsWith("*") ||
                line.trim().startsWith("*/")
        ).length;
    }

    const codeLines = Math.max(
        0,
        nonEmptyLines - commentLines
    );

    const fileSize = fs.statSync(filePath).size;

    // -------------------------
    // Class Detection
    // -------------------------

    const classes = [];

    const classRegex =
        /\bclass\s+([A-Za-z_$][\w$]*)/g;

    let match;

    while ((match = classRegex.exec(code)) !== null) {
        if (!classes.includes(match[1])) {
            classes.push(match[1]);
        }
    }

    // -------------------------
    // Function Detection
    // -------------------------

    const functions = [];

    const addFunction = (name) => {
        if (name && !functions.includes(name)) {
            functions.push(name);
        }
    };

    // JavaScript / React JavaScript
    if (
        language === "JavaScript" ||
        language === "React JavaScript" ||
        language === "TypeScript" ||
        language === "React TypeScript"
    ) {
        // function test()
        const functionRegex =
            /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }

        // const test = () =>
        // const test = function()
        const variableFunctionRegex =
            /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>?/g;

        while (
            (match = variableFunctionRegex.exec(code)) !== null
        ) {
            addFunction(match[1]);
        }
    }

    // Python
    else if (language === "Python") {
        const functionRegex =
            /^\s*(?:async\s+)?def\s+([A-Za-z_$][\w$]*)\s*\(/gm;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // Java
    else if (language === "Java") {
        const functionRegex =
            /\b(?:public|private|protected|static|final|synchronized|\s)+\s*[A-Za-z_$][\w$<>\[\]]*\s+([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*\{/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // C++
    else if (language === "C++") {
        const functionRegex =
            /\b[A-Za-z_$][\w:$<>\[\]]*\s+([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*\{/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // C#
    else if (language === "C#") {
        const functionRegex =
            /\b(?:public|private|protected|internal|static|async|virtual|override|\s)+\s*[A-Za-z_$][\w$<>\[\]]*\s+([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*\{/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // PHP
    else if (language === "PHP") {
        const functionRegex =
            /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // Ruby
    else if (language === "Ruby") {
        const functionRegex =
            /^\s*def\s+([A-Za-z_$][\w$]*)/gm;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // Go
    else if (language === "Go") {
        const functionRegex =
            /\bfunc\s+(?:\([^)]+\)\s*)?([A-Za-z_$][\w$]*)\s*\(/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    // Rust
    else if (language === "Rust") {
        const functionRegex =
            /\bfn\s+([A-Za-z_$][\w$]*)\s*\(/g;

        while ((match = functionRegex.exec(code)) !== null) {
            addFunction(match[1]);
        }
    }

    return {
        totalLines,
        nonEmptyLines,
        commentLines,
        codeLines,
        fileSize,
        classes,
        functions
    };
};

module.exports = { analyzeFile };