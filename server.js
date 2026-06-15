const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static("uploads"));

let latestData = {};
let latestImage = "";

// ==========================
// RECEIVE DATA (JSON)
// ==========================
app.post("/api/evo", (req, res) => {
    const site = req.body.site || "unknown";

    latestData[site] = {
        data: req.body,
        updated: new Date()
    };

    console.log("Data received:", site);
    res.json({ status: "ok" });
});

// ==========================
// RECEIVE IMAGE
// ==========================
app.post("/api/upload", upload.single("image"), (req, res) => {
    latestImage = req.file.filename;

    console.log("Image uploaded");
    res.json({ status: "ok" });
});

// ==========================
// API DATA
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
        <title>EVO Dashboard</title>

        <!-- IE-safe refresh -->
        <meta http-equiv="refresh" content="30">

        <style>
            body {
                font-family: sans-serif;
                background-color: #f5f5f5;
                text-align: center;
            }

            .container {
                display: none; /* modern UI hidden by default */
            }

            .card {
                border: 1px solid #ccc;
                border-radius: 8px;
                margin: 12px;
                padding: 12px;
                background: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                text-align: left;
            }

            img {
                max-width: 95%;
                border: 1px solid #ccc;
                margin-top: 20px;
            }
        </style>
    </head>

    <body>

        <h2>EVO Fuel Dashboard</h2>

        <!-- IMAGE FALLBACK (ALWAYS SHOWS IN IE) -->
        <div id="imageContainer">
            ${
                latestImage
                    ? `<img src="/uploads/${latestImage}" />`
                    : "<p>No data available</p>"
            }
        </div>

        <!-- MODERN DASHBOARD -->
        <div id="data" class="container"></div>

        <script>
            // Modern browsers will execute this
            try {

                async function load() {
                    let res = await fetch('https://evo-api-3f4c.onrender.com/api/data');
                    let data = await res.json();

                    let html = "";

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
                                    Capacity: \${t.capacity_percent} %
                                </div>
                            \`;
                        });
                    }

                    document.getElementById("data").innerHTML = html;

                    // Switch from image → live dashboard
                    document.getElementById("imageContainer").style.display = "none";
                    document.getElementById("data").style.display = "block";
                }

                load();

                // Live refresh
                setInterval(load, 30000);

            } catch (e) {
                console.log("IE mode: using image fallback");
            }
        </script>

    </body>
    </html>
    `);
});

// ==========================
app.listen(3000, () => console.log("Server running"));
