import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

const socket = io(URL, {
  extraHeaders: {
    'ngrok-skip-browser-warning': 'true'
  }
})

export default socket