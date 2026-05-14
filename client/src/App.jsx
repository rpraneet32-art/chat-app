import "./App.css";
import socket from "./socket";
import { useEffect, useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };

      // ONLY send to server
      socket.emit("send_message", messageData);

      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>

          <input
            type="text"
            placeholder="Name..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />

          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />

          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <p>Live Chat</p>
          </div>

          <div className="chat-body">
            {messageList.map((messageContent, index) => {
              return (
                <div
                  className="message"
                  id={
                    username === messageContent.author
                      ? "you"
                      : "other"
                  }
                  key={index}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>

                    <div className="message-meta">
                      <p>{messageContent.time}</p>
                      <p>{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Hey..."
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              &#9658;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;