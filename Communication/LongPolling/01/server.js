import http from 'http';

let counter = 0;
let waitingClients = [];

// simulate data update
setInterval(() => {
  counter++;

  // notify all waiting clients
  waitingClients.forEach((res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    res.end(JSON.stringify({ value: counter, ts: Date.now() }));
  });

  waitingClients = [];
}, 5000);

const server = http.createServer((req, res) => {
  if (req.url === '/api/long-poll') {
    // keep connection open
    waitingClients.push(res);

    // safety timeout (avoid infinite hang)
    setTimeout(() => {
      const idx = waitingClients.indexOf(res);
      if (idx !== -1) {
        waitingClients.splice(idx, 1);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ value: counter, ts: Date.now(), timeout: true }));
      }
    }, 15000);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => console.log('Long polling server on http://localhost:3000'));
