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

// In-memory message store
const messages = [];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

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

io.on("connection", (socket) => {
  const userId = String(socket.handshake.query.userId);
  console.log(`User ${userId} connected, Socket ID: ${socket.id}`);

  if (!userId || userId === "anonymous") {
    console.warn(`Invalid or anonymous userId: ${userId}`);
    return;
  }

  userSocketMap.set(userId, socket.id);
  console.log(`Current userSocketMap:`, Array.from(userSocketMap.entries()));

  // Deliver queued messages for this user
  const queuedMessages = messages.filter((msg) => msg.recipientId === userId);
  console.log(`Delivering ${queuedMessages.length} messages to user ${userId}`);
  queuedMessages.forEach((msg) => {
    socket.emit("message", {
      id: msg.id,
      text: msg.text,
      timestamp: msg.timestamp,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      sent: false,
      read: msg.read || false,
    });
  });

  socket.on("connect_error", (error) => {
    console.error(`Socket connection error for user ${userId}:`, error.message);
  });

  socket.on("ping", () => {
    console.log(`Ping received from ${userId}`);
    socket.emit("pong");
  });

  socket.on("message", ({ text, senderId, recipientId, messageId }) => {
    const senderIdStr = String(senderId);
    const recipientIdStr = String(recipientId);
    console.log(`Message received from ${senderIdStr} to ${recipientIdStr}: ${text} (ID: ${messageId})`);

    if (messages.some((msg) => msg.id === messageId)) {
      console.log(`Duplicate message ID ${messageId} ignored`);
      return;
    }

    const timestamp = new Date();
    const newMessage = {
      id: messageId || Date.now().toString(),
      senderId: senderIdStr,
      recipientId: recipientIdStr,
      text,
      timestamp: timestamp.toLocaleString(),
      read: false, // New field
    };
    messages.push(newMessage);
    console.log(`Stored message:`, newMessage);

    const messagePayload = {
      id: newMessage.id,
      text,
      timestamp: newMessage.timestamp,
      senderId: senderIdStr,
      recipientId: recipientIdStr,
      sent: false,
      read: false,
    };

    const recipientSocketId = userSocketMap.get(recipientIdStr);
    console.log(`Recipient ${recipientIdStr} socket ID: ${recipientSocketId}`);

    if (recipientSocketId) {
      console.log(`Sending message to ${recipientIdStr} at socket ${recipientSocketId}`);
      io.to(recipientSocketId).emit("message", messagePayload);
      io.to(socket.id).emit("message", { ...messagePayload, sent: true });
    } else {
      console.log(`Recipient ${recipientIdStr} is offline, message queued`);
    }
  });

  socket.on("mark-read", ({ messageIds, userId, contactId }) => {
    console.log(`Marking messages as read for user ${userId} from contact ${contactId}:`, messageIds);
    messages.forEach((msg) => {
      if (messageIds.includes(msg.id)) {
        msg.read = true;
      }
    });

    // Notify sender's other devices
    const senderSocketId = userSocketMap.get(contactId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message-read", { messageIds, userId, contactId });
    }
  });

  socket.on("disconnect", () => {
    if (userId && userId !== "anonymous") {
      userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected`);
      console.log(`Current userSocketMap:`, Array.from(userSocketMap.entries()));
    }
  });
});

// Auth & User Routes
app.post("/api/signup", handleNewUser);
app.post("/api/login", handleLogin);
app.use("/api/users", userRouter);

// Messages Route (In-memory)
app.get("/api/messages/:userId/:contactId", (req, res) => {
  const userId = String(req.params.userId);
  const contactId = String(req.params.contactId);
  console.log(`Fetching messages for user ${userId} and contact ${contactId}`);

  const filteredMessages = messages
    .filter(
      (msg) =>
        (msg.senderId === userId && msg.recipientId === contactId) ||
        (msg.senderId === contactId && msg.recipientId === userId)
    )
    .map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      text: msg.text,
      time: msg.timestamp,
      sent: msg.senderId === userId,
      read: msg.read || false, // Include read status
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  console.log(`Returning ${filteredMessages.length} messages:`, filteredMessages);
  res.json(filteredMessages);
});

// Mark Messages as Read
app.post("/api/messages/:userId/:contactId/read", (req, res) => {
  const userId = String(req.params.userId);
  const contactId = String(req.params.contactId);
  console.log(`Marking messages as read for user ${userId} from contact ${contactId}`);

  const messageIds = [];
  messages.forEach((msg) => {
    if (msg.senderId === contactId && msg.recipientId === userId && !msg.read) {
      msg.read = true;
      messageIds.push(msg.id);
    }
  });

  // Notify sender's other devices
  const senderSocketId = userSocketMap.get(contactId);
  if (senderSocketId) {
    io.to(senderSocketId).emit("message-read", { messageIds, userId, contactId });
  }

  console.log(`Marked ${messageIds.length} messages as read`);
  res.json({ success: true, messageIds });
});

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