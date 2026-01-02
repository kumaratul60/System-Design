// const express = require("express") // type: "module" in pkg.json
import express from 'express';

const app = express();

const PORT = 5123;

const todos = [
  { id: 1, title: 'todo1', completed: false },
  { id: 2, title: 'todo2', completed: true },
];

// all: can make any type of request
app.all('/', (req, res) => {
  // console.log(req, '::req'); // client to server
  // console.log(res, '::res'); // server to client
  res.send('yes up!');
});

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
