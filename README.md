# Chat App

A real-time chat application built with Node.js, Express, Socket.io, and React.

Live URL: https://chat-app-mu-six-84.vercel.app

---

## What it does

- Users enter a username and join a chat room
- Messages are delivered instantly to everyone in the same room
- Shows a typing indicator when someone is composing a message
- Displays a notification when a new user joins the room
- Supports multiple rooms including custom rooms with custom icons
- Sent messages appear on the right, received messages on the left

---

## Tech stack

**Frontend**
- React (UI framework)
- Vite (build tool)
- Socket.io-client (real-time connection)
- CSS (styling)
- Deployed on Vercel

**Backend**
- Node.js (runtime)
- Express (web server)
- Socket.io (WebSocket layer)
- CORS (cross-origin support)
- Deployed on Render (permanent) or ngrok (local tunnel)

**Version control**
- GitHub

---

## How to run locally

### Prerequisites

- Node.js v20 or higher
- npm

### Clone the repository
git clone https://github.com/AnkitaNarayan-official/chat-app.git
cd chat-app

### Start the server
cd server
npm install
node index.js

Server runs on http://localhost:3001

### Start the client

Open a new terminal:

```
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

### Test it

Open two browser tabs at http://localhost:5173, join the same room with different usernames, and send messages between them.

---

## Project structure

```
chat-app/
    server/
        index.js          main server file
        package.json
    client/
        src/
            App.jsx       main React component
            App.css       styles
            socket.js     socket connection setup
            main.jsx      entry point
        package.json
    .gitignore
    README.md
```

---

## How it works

This app uses WebSockets instead of regular HTTP requests. With regular HTTP, the client has to ask the server for new data. With WebSockets, the server can push data to all connected clients the moment something happens. This is what makes messages appear instantly without refreshing the page.

Socket.io rooms are used to separate conversations. When a user joins a room, their connection is added to that room. Messages sent to a room are delivered only to users in that room.

---

## Environment variables

**Client (.env)**
```
VITE_SERVER_URL=https://your-server-url
```

---

---

## Known limitations

- When using ngrok as the backend tunnel, the server URL changes every time the laptop restarts. Update the VITE_SERVER_URL environment variable on Vercel and redeploy when this happens.
- Messages are not saved to a database. Refreshing the page clears the chat history.

---

## Author

Ankita Narayan
VIT Vellore, 1st Year
GitHub: https://github.com/AnkitaNarayan-official
