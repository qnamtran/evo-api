const express = require("express");
const app = express();

app.use(express.json());

let latestData = {};

app.post("/api/evo", (req, res) => {
    const site = req.body.site || "unknown";

    latestData[site] = {
        data: req.body,
        updated: new Date()
    };

    console.log("Data received from:", site);

    res.json({ status: "ok" });
});

app.get("/api/data", (req, res) => {
    res.json(latestData);
});

app.get("/", (req, res) => {
    res.send(`
        <h2>EVO Fuel Dashboard</h2>
        <div id="data"></div>

        <script>
        async function load() {
            let res = await fetch('/api/data');
            let data = await res.json();
            document.getElementById("data").innerText =
                JSON.stringify(data, null, 2);
        }

        setInterval(load, 5000);
        load();
        </script>
    `);
});

app.listen(3000, () => console.log("Server running"));