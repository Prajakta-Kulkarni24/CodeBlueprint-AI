
/*
|--------------------------------------------------------------------------
| CodeBlueprint AI - Dependency Analyzer
|--------------------------------------------------------------------------
*/

const extractDependencies = (code, language) => {
    const dependencies = [];
    const seen = new Set();

    if (typeof code !== "string" || !code.trim()) {
        return dependencies;
    }

    const lang = String(language || "").trim().toLowerCase();

    const isIgnored = (value) =>
        !value ||
        /^(?:https?:)?\/\//i.test(value) ||
        /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(value);

    const addDependency = (name, type = "external", kind = "imports") => {
        if (typeof name !== "string") return;

        const cleanName = name.trim();

        if (isIgnored(cleanName)) return;

        const key = `${type}:${kind}:${cleanName.toLowerCase()}`;

        if (seen.has(key)) return;

        seen.add(key);

        dependencies.push({
            name: cleanName,
            type,
            kind,
        });
    };

    const addPathDependency = (name, kind = "imports") => {
        if (!name) return;

        const cleanName = name.trim();

        if (isIgnored(cleanName)) return;

        const local =
            cleanName.startsWith(".") ||
            cleanName.startsWith("/") ||
            cleanName.startsWith("\\");

        addDependency(
            cleanName,
            local ? "local" : "external",
            kind
        );
    };

    const collect = (regex, callback) => {
        let match;

        while ((match = regex.exec(code)) !== null) {
            callback(match);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | JavaScript / TypeScript
    |--------------------------------------------------------------------------
    */

    if ([
        "javascript",
        "react javascript",
        "typescript",
        "react typescript",
    ].includes(lang)) {

        collect(
            /\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
            (match) => addPathDependency(match[1])
        );

        collect(
            /\bexport\s+(?:\*|\{[\s\S]*?\})\s+from\s+["']([^"']+)["']/g,
            (match) => addPathDependency(match[1])
        );

        collect(
            /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
            (match) => addPathDependency(match[1])
        );

        collect(
            /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
            (match) => addPathDependency(match[1])
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HTML
    |--------------------------------------------------------------------------
    */

    else if (lang === "html") {

        collect(
            /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi,
            (match) => {
                const href = match[1].split(/[?#]/)[0];

                if (/\.(html?|php)$/i.test(href)) {
                    addPathDependency(href, "navigation");
                }
            }
        );

        collect(
            /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi,
            (match) => addPathDependency(match[1], "script")
        );

        collect(
            /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi,
            (match) => addPathDependency(match[1], "resource")
        );

        collect(
            /<(?:img|source|video|audio|iframe)\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi,
            (match) => addPathDependency(match[1], "resource")
        );

        collect(
            /<object\b[^>]*\bdata\s*=\s*["']([^"']+)["'][^>]*>/gi,
            (match) => addPathDependency(match[1], "resource")
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CSS / SCSS
    |--------------------------------------------------------------------------
    */

    else if (["css", "scss"].includes(lang)) {

        collect(
            /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/gi,
            (match) => addPathDependency(match[1], "stylesheet")
        );

        collect(
            /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
            (match) => addPathDependency(match[1], "asset")
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Python
    |--------------------------------------------------------------------------
    */

    else if (lang === "python") {

        // from database import ...
        // from face_utils import ...
        // from package.module import ...

        collect(
            /^\s*from\s+(\.*[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)\s+import\b/gm,
            (match) => addDependency(
                match[1],
                "local",
                "python-import"
            )
        );

        // import database
        // import face_utils
        // import package.module

        collect(
            /^\s*import\s+([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)/gm,
            (match) => addDependency(
                match[1],
                "local",
                "python-import"
            )
        );

        // from . import database
        // from . import face_utils

        collect(
            /^\s*from\s+(\.*)\s+import\s+([a-zA-Z_]\w*)/gm,
            (match) => {
                addDependency(
                    `${match[1]}${match[2]}`,
                    "local",
                    "python-import"
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Java / Kotlin
    |--------------------------------------------------------------------------
    */

    else if (["java", "kotlin"].includes(lang)) {

        collect(
            /^\s*import\s+(?:static\s+)?([a-zA-Z_][\w.]*)/gm,
            (match) => addDependency(
                match[1],
                "external",
                "package-import"
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | C / C++
    |--------------------------------------------------------------------------
    */

    else if ([
        "c",
        "c++",
        "c/c++ header",
        "c++ header",
    ].includes(lang)) {

        collect(
            /^\s*#\s*include\s*([<"])([^>"]+)[>"]/gm,
            (match) => addDependency(
                match[2],
                match[1] === '"' ? "local" : "external",
                "include"
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PHP
    |--------------------------------------------------------------------------
    */

    else if (lang === "php") {

        collect(
            /\b(?:include|include_once|require|require_once)\s*(?:\(\s*)?["']([^"']+)["']/g,
            (match) => addPathDependency(match[1], "include")
        );

        collect(
            /^\s*use\s+([^;]+);/gm,
            (match) => addDependency(
                match[1].trim(),
                "external",
                "namespace"
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Go
    |--------------------------------------------------------------------------
    */

    else if (lang === "go") {

        collect(
            /^\s*import\s+"([^"]+)"/gm,
            (match) => addDependency(
                match[1],
                "external",
                "package-import"
            )
        );

        collect(
            /\bimport\s*\(([\s\S]*?)\)/g,
            (match) => {
                collect(
                    /(?:[a-zA-Z_]\w*\s+)?["']([^"']+)["']/g,
                    (item) => addDependency(
                        item[1],
                        "external",
                        "package-import"
                    )
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Rust
    |--------------------------------------------------------------------------
    */

    else if (lang === "rust") {

        collect(
            /^\s*(?:pub\s+)?use\s+([a-zA-Z_][\w:]*)/gm,
            (match) => {
                const name = match[1];

                const local =
                    name.startsWith("crate::") ||
                    name.startsWith("self::") ||
                    name.startsWith("super::");

                addDependency(
                    name,
                    local ? "local" : "external",
                    "module-import"
                );
            }
        );

        collect(
            /^\s*(?:pub\s+)?mod\s+([a-zA-Z_]\w*)\s*;/gm,
            (match) => addDependency(
                match[1],
                "local",
                "module"
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Ruby
    |--------------------------------------------------------------------------
    */

    else if (lang === "ruby") {

        collect(
            /^\s*require_relative\s+["']([^"']+)["']/gm,
            (match) => addDependency(
                match[1],
                "local",
                "require"
            )
        );

        collect(
            /^\s*require\s+["']([^"']+)["']/gm,
            (match) => addDependency(
                match[1],
                "external",
                "require"
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Vue / Svelte
    |--------------------------------------------------------------------------
    */

    else if (["vue", "svelte"].includes(lang)) {

        collect(
            /\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
            (match) => addPathDependency(match[1])
        );

        collect(
            /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi,
            (match) => addPathDependency(match[1], "resource")
        );
    }

    return dependencies;
};

module.exports = {
    extractDependencies,
};
