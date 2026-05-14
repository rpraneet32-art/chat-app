import { useState, useEffect, useRef } from 'react'
import socket from './socket'
import './App.css'

const DEFAULT_ICONS = ['💬', '🎮', '🎵', '📚', '🎲', '🏠', '🌍', '🎨', '🏋️', '🍕', '🎯', '🚀']

function App() {
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [typing, setTyping] = useState('')
  const messagesEndRef = useRef(null)

  const [rooms, setRooms] = useState([
    { name: 'General', icon: '💬' },
    { name: 'Gaming', icon: '🎮' },
    { name: 'Study', icon: '📚' },
  ])

  const [creating, setCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomIcon, setNewRoomIcon] = useState('💬')

  useEffect(() => {
    socket.on('receive_message', ({ message, username: sender }) => {
      setMessages(prev => [...prev, { message, sender, self: false }])
    })

    socket.on('user_joined', (user) => {
      setMessages(prev => [...prev, { message: `${user} joined the room`, system: true }])
    })

    socket.on('typing', (user) => {
      setTyping(`${user} is typing...`)
      setTimeout(() => setTyping(''), 2000)
    })

    return () => {
      socket.off('receive_message')
      socket.off('user_joined')
      socket.off('typing')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleJoin() {
    if (username && selectedRoom) {
      socket.emit('join_room', { username, room: selectedRoom.name })
      setJoined(true)
    }
  }

  function handleSend() {
    if (newMessage.trim() === '') return
    socket.emit('send_message', {
      room: selectedRoom.name,
      message: newMessage,
      username
    })
    setMessages(prev => [...prev, { message: newMessage, sender: username, self: true }])
    setNewMessage('')
  }

  function handleTyping() {
    socket.emit('typing', { room: selectedRoom.name, username })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  function handleCreateRoom() {
    if (newRoomName.trim() === '') return
    const newRoom = { name: newRoomName.trim(), icon: newRoomIcon }
    setRooms([...rooms, newRoom])
    setSelectedRoom(newRoom)
    setNewRoomName('')
    setNewRoomIcon('💬')
    setCreating(false)
  }

  if (joined) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <span className="room-icon">{selectedRoom.icon}</span>
          <div>
            <h2>{selectedRoom.name}</h2>
            <p className="welcome-text">Welcome, {username}!</p>
          </div>
          <button className="leave-btn" onClick={() => {
            setJoined(false)
            setMessages([])
          }}>
            Leave
          </button>
        </div>

        <div className="messages-area">
          {messages.length === 0 && (
            <p className="empty-msg">No messages yet. Say hello! 👋</p>
          )}
          {messages.map((msg, index) => {
            if (msg.system) {
              return (
                <div key={index} className="system-msg">
                  {msg.message}
                </div>
              )
            }
            return (
              <div key={index} className={`msg-row ${msg.self ? 'msg-row-self' : 'msg-row-other'}`}>
                {!msg.self && (
                  <div className="avatar">{msg.sender[0].toUpperCase()}</div>
                )}
                <div className="msg-col">
                  {!msg.self && <p className="sender-name">{msg.sender}</p>}
                  <div className={`bubble ${msg.self ? 'bubble-self' : 'bubble-other'}`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {typing && <p className="typing-indicator">{typing}</p>}

        <div className="input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    )
  }

  return (
    <div className="join-container">
      <h1>💬 ChatApp</h1>
      <p className="subtitle">Connect and chat in real time</p>

      <input
        type="text"
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <p className="label">Choose a room:</p>

      <div className="room-grid">
        {rooms.map((r) => (
          <div
            key={r.name}
            className={`room-card ${selectedRoom?.name === r.name ? 'selected' : ''}`}
            onClick={() => setSelectedRoom(r)}
          >
            <span className="room-card-icon">{r.icon}</span>
            <span>{r.name}</span>
          </div>
        ))}
        <div className="room-card add-card" onClick={() => setCreating(true)}>
          <span className="room-card-icon">➕</span>
          <span>New Room</span>
        </div>
      </div>

      {creating && (
        <div className="create-box">
          <p className="label">Room name:</p>
          <input
            type="text"
            placeholder="e.g. Cricket"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <p className="label">Pick an icon:</p>
          <div className="icon-grid">
            {DEFAULT_ICONS.map((icon) => (
              <span
                key={icon}
                className={`icon-option ${newRoomIcon === icon ? 'icon-selected' : ''}`}
                onClick={() => setNewRoomIcon(icon)}
              >
                {icon}
              </span>
            ))}
          </div>
          <div className="create-btns">
            <button onClick={handleCreateRoom} disabled={!newRoomName.trim()}>
              Create Room
            </button>
            <button className="cancel-btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <button onClick={handleJoin} disabled={!username || !selectedRoom}>
        Join Room
      </button>
    </div>
  )
}

export default App