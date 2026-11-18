import { useState } from "react";
import axios from "axios";

function CodeUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [analysis, setAnalysis] = useState(null);

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a code file");
            return;
        }

        const formData = new FormData();
        formData.append("codeFile", file);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/code/upload",
                formData
            );

            setMessage(response.data.message);

            // Store complete analysis result
            setAnalysis(response.data);

        } catch (error) {
            console.error(error);
            setMessage("Upload failed");
        }
    };

    return (
        <div>
            <h1>Upload Your Code</h1>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={handleUpload}>
                Upload Code
            </button>

            <p>{message}</p>

            {analysis && (
                <div>
                    <h2>Code Analysis</h2>

                    <h3>File Information</h3>
                    <p>
                        <strong>File:</strong>{" "}
                        {analysis.file?.name}
                    </p>

                    <p>
                        <strong>Language:</strong>{" "}
                        {analysis.file?.language}
                    </p>

                    <h3>File Analysis</h3>

                    <p>
                        Total Lines:{" "}
                        {analysis.fileAnalysis?.totalLines}
                    </p>

                    <p>
                        Non-Empty Lines:{" "}
                        {analysis.fileAnalysis?.nonEmptyLines}
                    </p>

                    <p>
                        Comment Lines:{" "}
                        {analysis.fileAnalysis?.commentLines}
                    </p>

                    <p>
                        Code Lines:{" "}
                        {analysis.fileAnalysis?.codeLines}
                    </p>

                    <h3>Classes</h3>

                    {analysis.fileAnalysis?.classes?.length > 0 ? (
                        <ul>
                            {analysis.fileAnalysis.classes.map(
                                (className, index) => (
                                    <li key={index}>
                                        {className}
                                    </li>
                                )
                            )}
                        </ul>
                    ) : (
                        <p>No classes detected</p>
                    )}

                    <h3>Functions</h3>

                    {analysis.fileAnalysis?.functions?.length > 0 ? (
                        <ul>
                            {analysis.fileAnalysis.functions.map(
                                (functionName, index) => (
                                    <li key={index}>
                                        {functionName}
                                    </li>
                                )
                            )}
                        </ul>
                    ) : (
                        <p>No functions detected</p>
                    )}

                    <h3>Dependencies</h3>

                    {analysis.dependencies?.length > 0 ? (
                    <ul>
                    {analysis.dependencies.map((dependency, index) => (
                    <li key={index}>
                    {dependency.name} ({dependency.type})
                    </li>
                    ))}
                   </ul>
                    ) : (
                   <p>No dependencies detected</p>
                    )}

                    <h3>Code Metrics</h3>

                    <p>
                        Functions:{" "}
                        {analysis.metrics?.functionCount}
                    </p>

                    <p>
                        Classes:{" "}
                        {analysis.metrics?.classCount}
                    </p>

                    <p>
                        Comment Percentage:{" "}
                        {analysis.metrics?.commentPercentage}%
                    </p>
                    
                    <p>
                        Code Density:
                        {analysis.metrics?.codeDensity}%
                    </p>

                    <p>
                        Estimated Complexity:{" "}
                        {analysis.metrics?.estimatedComplexity}
                    </p> 

                    <h3>Security</h3>

                    <p>
                        Security Issues:{" "}
                        {analysis.security?.totalIssues}
                    </p>

                    {analysis.security?.securityIssues?.length > 0 && (
                        <ul>
                            {analysis.security.securityIssues.map(
                                (issue, index) => (
                                    <li key={index}>
                                        <strong>
                                            {issue.severity}
                                        </strong>
                                        {" - "}
                                        {issue.type}
                                        {" - "}
                                        {issue.message}
                                    </li>
                                )
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default CodeUpload;