const text = "dummy text ".repeat(100);
fetch("http://localhost:3000/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        text,
        fileName: "dummy.pdf",
        fileData: "base64",
        model: "gpt-4o-mini"
    })
}).then(res => res.json()).then(data => {
    console.log("Keys:", Object.keys(data));
    console.log("inferred_role:", data.inferred_role);
}).catch(console.error);
