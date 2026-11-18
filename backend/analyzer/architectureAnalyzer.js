const analyzeArchitecture = ({
    files = [],
    dependencies = [],
    language = "Unknown"
}) => {
    const nodes = [];
    const edges = [];

    // Add files as architecture nodes
    files.forEach((file) => {
        nodes.push({
            id: file.id || file.name,
            name: file.name,
            type: file.type || "file",
            language: file.language || language
        });
    });

    // Add dependency relationships
    dependencies.forEach((dependency) => {
        if (dependency.from && dependency.to) {
            edges.push({
                from: dependency.from,
                to: dependency.to,
                relationship: "imports"
            });
        }
    });

    return {
        architecture: {
            type: "codebase",
            language,
            nodes,
            edges
        }
    };
};

module.exports = { analyzeArchitecture };