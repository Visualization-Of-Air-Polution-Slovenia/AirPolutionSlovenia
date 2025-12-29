const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Simple routes
app.get("/", (req, res) => {
  res.send("Hello from Node.js backend 👋");
});

// Example API route: GET /api/users
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" }
  ];
  res.json(users);
});

// Example API route: POST /api/users
app.post("/api/users", (req, res) => {
  const newUser = req.body; // { name: "...", role: "..." }
  // Here you would normally save to a database
  res.status(201).json({
    message: "User created",
    user: { id: Date.now(), ...newUser }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
