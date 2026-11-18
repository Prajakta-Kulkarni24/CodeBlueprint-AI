const form = new FormData();

form.append(
    "codeFile",
    new Blob(
        [
            'import helper from "./helper.js";\nconsole.log(helper);'
        ],
        { type: "text/javascript" }
    ),
    "test.js"
);

fetch("http://localhost:5000/api/code/upload", {
    method: "POST",
    body: form
})
    .then(async (response) => {
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    })
    .catch((error) => {
    console.error("Error name:", error.name);
    console.error("Error details:", error.cause);
    console.error("Error message:", error.message);
});