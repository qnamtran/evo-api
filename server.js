const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(cors());

// ==========================
// STORAGE (FORCE evo.png)
// ==========================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, "evo.png"); // always overwrite
    }
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

let latestData = {};

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
app.post("/api/upload", (req, res) => {
    upload.single("image")(req, res, function (err) {

        if (err) {
            console.log("Upload error:", err);
            return res.status(500).send("Upload failed");
        }

        if (!req.file) {
            console.log("No file received");
            return res.status(400).send("No file");
        }

        console.log("✅ Image uploaded: evo.png");

        res.json({ status: "ok" });
    });
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
                display: none;
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

        <!-- IMAGE FALLBACK (IE will use this) -->
        <div id="imageContainer">
            <img src="/uploads/evo.png?t=${Date.now()}" />
        </div>

        <!-- MODERN DASHBOARD -->
        <div id="data" class="container"></div>

        <script>
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
                                    Max Capacity: \${t.max_capacity_l} L<br>
                                    Capacity: \${t.capacity_percent} %<br>
                                    Timestamp: \${t.timestamp}
                                </div>
                            \`;
                        });
                    }

                    document.getElementById("data").innerHTML = html;

                    // Switch to modern UI
                    document.getElementById("imageContainer").style.display = "none";
                    document.getElementById("data").style.display = "block";
                }

                load();

                // Live refresh (modern browsers)
                setInterval(load, 30000);

            } catch (e) {
                console.log("IE mode → using image fallback");
            }
        </script>

    </body>
    </html>
    `);
});

// ==========================
app.listen(3000, () => console.log("Server running"));
