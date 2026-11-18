
const calculateMetrics = (content = "", language = "") => {
    const code = String(content || "");
    const lang = String(language || "").toLowerCase();
    const lines = code.length ? code.split(/\r\n|\r|\n/) : [];

    const nonEmptyLines = lines.filter(line => line.trim()).length;

    const commentPatterns = {
        python: /^\s*#/,
        ruby: /^\s*#/,
        shell: /^\s*#/,
        javascript: /^\s*\/\//,
        "react javascript": /^\s*\/\//,
        typescript: /^\s*\/\//,
        "react typescript": /^\s*\/\//,
        java: /^\s*\/\//,
        c: /^\s*\/\//,
        "c++": /^\s*\/\//,
        php: /^\s*(\/\/|#)/,
        go: /^\s*\/\//,
        rust: /^\s*\/\//,
        html: /^\s*<!--/,
        css: /^\s*\/\*/,
        scss: /^\s*\/\*/,
    };

    const commentPattern = commentPatterns[lang];
    const commentLines = commentPattern
        ? lines.filter(line => commentPattern.test(line)).length
        : 0;

    const codeLines = Math.max(0, nonEmptyLines - commentLines);

    const functionPatterns = [
        /\bfunction\s+[A-Za-z_$][\w$]*\s*\(/g,
        /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
        /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/g,
        /\bdef\s+[A-Za-z_]\w*\s*\(/g,
        /\bfunc\s+[A-Za-z_]\w*\s*\(/g,
        /\b(?:public|private|protected|static|async|\s)*\s+[A-Za-z_]\w*\s*\([^;]*\)\s*\{/g,
    ];

    let functionCount = 0;

    for (const pattern of functionPatterns) {
        const matches = code.match(pattern);
        if (matches) functionCount += matches.length;
    }

    const classPatterns = [
        /\bclass\s+[A-Za-z_$][\w$]*/g,
        /\binterface\s+[A-Za-z_$][\w$]*/g,
        /\bstruct\s+[A-Za-z_$][\w$]*/g,
    ];

    let classCount = 0;

    for (const pattern of classPatterns) {
        const matches = code.match(pattern);
        if (matches) classCount += matches.length;
    }

    const decisionPatterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bfor\s*\(/g,
        /\bwhile\s*\(/g,
        /\bcase\b/g,
        /\bcatch\s*\(/g,
        /\bexcept\b/g,
        /\b&&/g,
        /\|\|/g,
        /\?\?/g,
        /\?\s*[^:]+:/g,
    ];

    let decisionPoints = 0;

    for (const pattern of decisionPatterns) {
        const matches = code.match(pattern);
        if (matches) decisionPoints += matches.length;
    }

    // Estimate average complexity per function
const estimatedComplexity =
    Number(
        (1 + decisionPoints / Math.max(functionCount, 1)).toFixed(2)
    );

let complexityLevel = "Low";

if (estimatedComplexity >= 10) {
    complexityLevel = "High";
} else if (estimatedComplexity >= 5) {
    complexityLevel = "Medium";
}

    const commentPercentage = nonEmptyLines
        ? Number(((commentLines / nonEmptyLines) * 100).toFixed(2))
        : 0;

    const codeDensity = nonEmptyLines
        ? Number(((codeLines / nonEmptyLines) * 100).toFixed(2))
        : 0;

    return {
        totalLines: lines.length,
        nonEmptyLines,
        commentLines,
        codeLines,
        commentPercentage,
        codeDensity,
        functionCount,
        classCount,
        decisionPoints,
        estimatedComplexity,
        complexityLevel,
    };
};

module.exports = {
    calculateMetrics,
};
