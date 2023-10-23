const express = require("express");
const app = express();
const http = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(http, {
  path: '/socket.io',
  serveClient: false, 
  cookie: false, 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("chat.db");

db.serialize(function () {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)"
  );
  app.get("/api/search", (req, res) => {
    const { username } = req.query;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: row.id, username: row.username });
    });
  });
});

//db.close();

const chatRooms = {};

app.use(express.json());
app.use(cors());

app.post("/api/createroom", (req, res) => {
  const { userId1, userId2 } = req.body;

  const roomId = `room-${userId1}-${userId2}`;
  chatRooms[roomId] = { users: [userId1, userId2], messages: [] };
  res.json({ roomId });
});

io.on("connection", (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("message", (data) => {
    const roomId = data.roomId;
    chatRooms[roomId].messages.push(data);
    io.to(roomId).emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
