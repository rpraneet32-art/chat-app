import { io } from "socket.io-client";

const socket = io("https://chat-app-fpyh.onrender.com", {
  transports: ["websocket"],
});

export default socket;