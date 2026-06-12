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
    let html = "<h2>EVO Fuel Dashboard</h2>";

    for (let site in latestData) {
        let tanks = latestData[site].data.tanks;

        html += `<h3>${site}</h3>`;

        tanks.forEach(t => {
            html += `
                <div style="border:1px solid #ccc; margin:10px; padding:10px;">
                    <b>${t.tank}</b> (${t.status})<br>
                    Product: ${t.product}<br>
                    Volume: ${t.net_volume_l} L<br>
                    Level: ${t.level_cm} cm<br>
                    Temperature: ${t.temperature_c} °C<br>
                    Max Capacity: ${t.max_capacity_l} L<br>
                    Capacity: ${t.capacity_percent} %<br>
                    Timestamp: ${t.timestamp}
                </div>
            `;
        });
    }

    res.send(html);
});

app.listen(3000, () => console.log("Server running"));
