const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors({
  origin: ['https://chat-app-mu-six-84.vercel.app', 'https://squeeze-eleven-tux.ngrok-free.dev', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST']
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['https://chat-app-mu-six-84.vercel.app', 'https://squeeze-eleven-tux.ngrok-free.dev', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined ${room}`);
    socket.to(room).emit('user_joined', username);
  });

  socket.on('send_message', ({ room, message, username }) => {
    socket.to(room).emit('receive_message', { message, username });
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});