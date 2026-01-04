// const express = require("express") // type: "module" in pkg.json
import express from 'express';

const app = express();
// body-parser:
// app.use(bodyParser.raw({ type: 'application/json' })): app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json()): app.use(express.json());

// app.use(express.urlencoded({ extended: true })); // urlencoded = forms or Forms + API both
app.use(express.json()); // JSON = APIs or API only

const PORT = 5123;

const todos = [
  { id: 1, title: 'todo1', completed: false },
  { id: 2, title: 'todo2', completed: true },
];

// all: can make any type of request
// app.all('/', (_req, res) => {
//   // console.log(req, '::req'); // client to server
//   // console.log(res, '::res'); // server to client
//   res.send('yes up!');
// });

// Read
app.get('/todos', (_req, res) => {
  res.json(todos);
});

// Create
app.post('/todos', (req, res) => {
  // Any data either we send or receive back all of these data goes in the format of serialize format(JSON.stringify) then parse(body-parser)
  const newData = req.body;
  todos.push(newData);
  res.json({
    message: 'new Todo added',
  });
});

// Update
app.put('/todos/:id', (req, res) => {
  const newTodoData = req.body;
  const todoId = Number(req.params.id);
  const todoIndex = todos.findIndex((td) => td.id === todoId);
  if (todoIndex !== -1) {
    todos[todoIndex] = {
      ...todos[todoIndex],
      ...newTodoData,
    };
  }
  res.json({
    message: 'todo get updated!',
  });
});

// Delete
app.delete('/todos/:id', (req, res) => {
  const todoParamId = Number(req.params.id);
  const todoIndex = todos.findIndex((td) => td.id === todoParamId);

  if (todoIndex !== -1) {
    todos.splice(todoIndex, 1);
  }
  res.json({
    message: `Id ${todoParamId}, todo get deleted successfully`,
  });
});

// global error
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
