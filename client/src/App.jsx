import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./App.css";

const DEFAULT_ICONS = [
  "💬",
  "🎮",
  "🎵",
  "📚",
  "🎲",
  "🏠",
  "🌍",
  "🎨",
  "🏋️",
  "🍕",
  "🎯",
  "🚀",
];

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [rooms, setRooms] = useState([
    { name: "General", icon: "💬" },
    { name: "Gaming", icon: "🎮" },
    { name: "Study", icon: "📚" },
  ]);

  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("💬");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          author: data.author,
          message: data.message,
          time: data.time,
        },
      ]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          message: data,
        },
      ]);
    });

    socket.on("typing", (data) => {
      setTyping(`${data} is typing...`);

      setTimeout(() => {
        setTyping("");
      }, 2000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const joinRoom = () => {
    if (username !== "" && selectedRoom) {
      socket.emit("join_room", selectedRoom.name);

      setRoom(selectedRoom.name);

      setJoined(true);

      setMessages([
        {
          system: true,
          message: `${username} joined the room`,
        },
      ]);
    }
  };

  const sendMessage = async () => {
    if (newMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: newMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.emit("send_message", messageData);

      setNewMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim() === "") return;

    const newRoom = {
      name: newRoomName,
      icon: newRoomIcon,
    };

    setRooms([...rooms, newRoom]);

    setSelectedRoom(newRoom);

    setCreating(false);

    setNewRoomName("");

    setNewRoomIcon("💬");
  };

  if (joined) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <span className="room-icon">
            {selectedRoom.icon}
          </span>

          <div>
            <h2>{selectedRoom.name}</h2>

            <p className="welcome-text">
              Welcome, {username}
            </p>
          </div>

          <button
            className="leave-btn"
            onClick={() => {
              setJoined(false);
              setMessages([]);
            }}
          >
            Leave
          </button>
        </div>

        <div className="messages-area">
          {messages.map((msg, index) => {
            if (msg.system) {
              return (
                <div
                  key={index}
                  className="system-msg"
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`msg-row ${
                  msg.author === username
                    ? "msg-row-self"
                    : "msg-row-other"
                }`}
              >
                {msg.author !== username && (
                  <div className="avatar">
                    {msg.author[0].toUpperCase()}
                  </div>
                )}

                <div className="msg-col">
                  {msg.author !== username && (
                    <p className="sender-name">
                      {msg.author}
                    </p>
                  )}

                  <div
                    className={`bubble ${
                      msg.author === username
                        ? "bubble-self"
                        : "bubble-other"
                    }`}
                  >
                    {msg.message}
                  </div>

                  <small className="msg-time">
                    {msg.time}
                  </small>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {typing && (
          <p className="typing-indicator">
            {typing}
          </p>
        )}

        <div className="input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-container">
      <h1>💬 ChatApp</h1>

      <p className="subtitle">
        Connect and chat in real time
      </p>

      <input
        type="text"
        placeholder="Your name"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <p className="label">
        Choose a room:
      </p>

      <div className="room-grid">
        {rooms.map((r) => (
          <div
            key={r.name}
            className={`room-card ${
              selectedRoom?.name === r.name
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedRoom(r)}
          >
            <span className="room-card-icon">
              {r.icon}
            </span>

            <span>{r.name}</span>
          </div>
        ))}

        <div
          className="room-card add-card"
          onClick={() => setCreating(true)}
        >
          <span className="room-card-icon">
            ➕
          </span>

          <span>New Room</span>
        </div>
      </div>

      {creating && (
        <div className="create-box">
          <p className="label">
            Room name:
          </p>

          <input
            type="text"
            placeholder="e.g. Cricket"
            value={newRoomName}
            onChange={(e) =>
              setNewRoomName(e.target.value)
            }
          />

          <p className="label">
            Pick an icon:
          </p>

          <div className="icon-grid">
            {DEFAULT_ICONS.map((icon) => (
              <span
                key={icon}
                className={`icon-option ${
                  newRoomIcon === icon
                    ? "icon-selected"
                    : ""
                }`}
                onClick={() =>
                  setNewRoomIcon(icon)
                }
              >
                {icon}
              </span>
            ))}
          </div>

          <div className="create-btns">
            <button
              onClick={handleCreateRoom}
            >
              Create Room
            </button>

            <button
              className="cancel-btn"
              onClick={() =>
                setCreating(false)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={joinRoom}
        disabled={!username || !selectedRoom}
      >
        Join Room
      </button>
    </div>
  );
}

export default App;