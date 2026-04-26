const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // 1. Join a specific room
    socket.on('join room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room: ${roomName}`);
        
        // Notify others in that room
        socket.to(roomName).emit('notification', `A new user joined the ${roomName} room.`);
    });

    // 2. Handle messages for a specific room
    socket.on('chat message', (data) => {
        const { room, user, text, senderId } = data;
        
        // io.to(room) sends ONLY to people in that specific room
        io.to(room).emit('chat message', {
            user,
            text,
            senderId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Rooms Server running on http://localhost:${PORT}`);
});
