const { extractDependencies } = require("./analyzer/dependencyAnalyzer");

const code = `
import database
import face_utils
from models import User
`;

const result = extractDependencies(code, "python");

console.log("Python dependencies:");
console.log(result);