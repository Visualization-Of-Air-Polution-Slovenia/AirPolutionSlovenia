const express = require("express");
const app = express();

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
