const express = require('express');
const path = require('path');

const app = express();

let data = 'Initial Data';
let waitingClients = [];

// serve UI
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// long polling endpoint
app.get('/getData', (req, res) => {
  const lastData = req.query.lastData;

  if (data !== lastData) {
    // data already changed → respond immediately
    res.json({ data });
  } else {
    // hold the connection
    waitingClients.push(res);
  }
});

// update data (use POST/PUT in real apps)
app.get('/updateData', (req, res) => {
  data = req.query.data;

  // notify all waiting clients
  while (waitingClients.length > 0) {
    const client = waitingClients.pop();
    client.json({ data });
  }

  res.json({ status: 'updated', data });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
