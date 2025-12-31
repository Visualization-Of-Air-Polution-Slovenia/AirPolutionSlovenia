const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Enable CORS for all origins
app.use(cors());

// Serve static files from backend/data directory at /data
app.use("/data", express.static(path.join(__dirname, "data")));

// Render provides PORT in environment
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend is working 🎉");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong", time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
