const express = require("express");
const app = express();

app.use(express.json());

let latestData = {};

// ==========================
// RECEIVE DATA
// ==========================
app.post("/api/evo", (req, res) => {
    const site = req.body.site || "unknown";

    latestData[site] = {
        data: req.body,
        updated: new Date()
    };

    console.log("Data received from:", site);

    res.json({ status: "ok" });
});

// ==========================
// API DATA ENDPOINT
// ==========================
app.get("/api/data", (req, res) => {
    res.json(latestData);
});

// ==========================
// DASHBOARD PAGE
// ==========================
app.get("/", (req, res) => {
    res.send(`
    <html>
    <head>
        <title>EVO Fuel Dashboard</title>

        <style>
            body {
                font-family: sans-serif;
                background-color: #f5f5f5;
            }
            .card {
                border: 1px solid #ccc;
                border-radius: 8px;
                margin: 10px;
                padding: 10px;
                background: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h2 {
                text-align: center;
            }
            h3 {
                margin-left: 10px;
            }
        </style>

        <!-- HARD REFRESH EVERY 4 MINUTES -->
        <script>
            setTimeout(function() {
                console.log("Refreshing page...");
                location.reload();
            }, 240000); // 4 minutes
        </script>
    </head>

    <body>
        <h2>EVO Fuel Dashboard</h2>
        <div id="data">Loading...</div>

        <script>
            async function load() {
                try {
                    let res = await fetch('https://evo-api-3f4c.onrender.com/api/data');
                    let data = await res.json();

                    let html = "";

                    if (Object.keys(data).length === 0) {
                        html = "<p style='text-align:center;'>No data yet...</p>";
                    }

                    for (let site in data) {
                        let tanks = data[site].data.tanks;

                        html += "<h3>" + site + "</h3>";

                        tanks.forEach(t => {
                            html += \`
                                <div class="card">
                                    <b>\${t.tank}</b> (\${t.status})<br>
                                    Product: \${t.product}<br>
                                    Volume: \${t.net_volume_l} L<br>
                                    Level: \${t.level_cm} cm<br>
                                    Temperature: \${t.temperature_c} °C<br>
                                    Max Capacity: \${t.max_capacity_l} L<br>
                                    Capacity: \${t.capacity_percent} %<br>
                                    Timestamp: \${t.timestamp}
                                </div>
                            \`;
                        });
                    }

                    document.getElementById("data").innerHTML = html;

                } catch (err) {
                    console.error("Error loading data", err);
                }
            }

            // Initial load
            load();

            // SOFT REFRESH EVERY 30 SECONDS
            setInterval(load, 30000);
        </script>
    </body>
    </html>
    `);
});

// ==========================
app.listen(3000, () => console.log("🚀 Server running"));
