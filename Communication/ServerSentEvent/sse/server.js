const express = require('express');
const app = express();

// Serve the minimal HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// SSE Route
app.get('/events', (req, res) => {
  // Essential headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Push a message every 2 seconds
  const interval = setInterval(() => {
    res.write(`data: Server Time ${new Date().toLocaleTimeString()}\n\n`);
  }, 2000);

  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(3000, () => {
  console.log('SSE Server started on http://localhost:3000');
});
