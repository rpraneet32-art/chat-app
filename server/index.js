const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", (data) => {
    socket.join(data.room);

    socket.to(data.room).emit(
      "user_joined",
      `${data.username} joined the room`
    );

    console.log(
      `${data.username} joined ${data.room}`
    );
  });

  // SEND MESSAGE
  socket.on("send_message", (data) => {
    io.to(data.room).emit(
      "receive_message",
      data
    );
  });

  // TYPING
  socket.on("typing", (username) => {
    socket.broadcast.emit(
      "typing",
      username
    );
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});