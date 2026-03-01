import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());

let counter = 0;

// simulate data changing on server
setInterval(() => {
  counter++;
}, 5000);

// short-polling endpoint
app.get('/api/status', (req, res) => {
  res.json({
    value: counter,
    ts: Date.now(),
    name: 'server king',
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
