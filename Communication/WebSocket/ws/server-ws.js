const WebSocket = require('ws');
const http = require('http');

// 1. Create a basic HTTP server
const server = http.createServer((req, res) => {
    res.end('WS Server is running');
});

// 2. Attach WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected via raw WS');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);

            // Create the broadcast payload
            const broadcastData = JSON.stringify({
                user: data.user || 'Anonymous',
                text: data.text,
                timestamp: new Date().toLocaleTimeString()
            });

            // --- BROADCASTING ---
            // Iterate over all connected clients and send the message
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                }
            });

            // Optional: Bot Reply (also broadcasted)
            const botReply = JSON.stringify({
                user: 'Bot (WS)',
                text: `Acknowledged: "${data.text}"`,
                timestamp: new Date().toLocaleTimeString()
            });
            
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(botReply);
                }
            });

        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Raw WS Server listening on http://localhost:${PORT}`);
});
