const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static files (index.html, style.css, script.js) from the current directory
app.use(express.static(__dirname));

let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;
    console.log('User connected:', socket.id);
    
    // Broadcast updated user count
    io.emit('user count', activeUsers);

    socket.on('chat message', (data) => {
        // Broadcast message to everyone
        io.emit('chat message', {
            ...data,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Bot Reply Logic
        setTimeout(() => {
            io.emit('chat message', {
                user: 'System Bot',
                text: `I received: "${data.text}". How can I help further?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isBot: true
            });
        }, 1000);
    });

    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('user typing', { id: socket.id, isTyping });
    });

    socket.on('disconnect', () => {
        activeUsers--;
        io.emit('user count', activeUsers);
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Socket.io Server running on http://localhost:${PORT}`);
});
