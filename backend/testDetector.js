const detectLanguage = require("./analyzer/languageDetector");

console.log(detectLanguage("App.jsx"));
console.log(detectLanguage("server.js"));
console.log(detectLanguage("Main.java"));
console.log(detectLanguage("model.py"));
console.log(detectLanguage("program.cpp"));
console.log(detectLanguage("unknown.xyz"));