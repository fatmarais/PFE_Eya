require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const https = require("https");

const { handleNewUser, handleLogin } = require("./Controllers/authController");
const userRouter = require("./routes/users");

const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store userId to socket mapping
const userSocketMap = new Map();

io.on('connection', socket => {
  const userId = socket.handshake.query.userId;
  console.log('User connected:', { socketId: socket.id, userId });
  if (userId && userId !== "anonymous") {
    userSocketMap.set(userId, socket.id);
  }

  socket.on('message', (payload) => {
  const timestamp = new Date().toLocaleString();
  const senderId = userId && userId !== "anonymous" ? userId : socket.id;
  console.log('Message received:', { payload, senderId });

  // Emit the message to all other users
  socket.broadcast.emit('message', { ...payload, timestamp, senderId });

  // Optionally log the action for debugging
  console.log(`Message broadcasted from ${senderId}:`, payload.text);
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', { socketId: socket.id, userId });
    if (userId && userId !== "anonymous") {
      userSocketMap.delete(userId);
    }
  });
});

// Auth & User Routes
app.post("/api/signup", handleNewUser);
app.post("/api/login", handleLogin);
app.use("/api/users", userRouter);

// Nagios XI API Proxy Route
app.get("/api/nagios/hosts", async (req, res) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const apiKey = process.env.NAGIOS_API_KEY;

    const response = await axios.get(
      `https://192.168.1.163/nagiosxi/api/v1/objects/hoststatus?apikey=${apiKey}`,
      { httpsAgent: agent }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Erreur API Nagios :", error.message);
    res.status(500).json({ error: "Erreur de connexion à Nagios XI" });
  }
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});