// filepath: /server/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;
const SECRET_KEY = 'find_housing_secret_key'; 

app.use(bodyParser.json());
app.use(cors());

// Mock user database
const users = [
  { id: 1, name: 'test', password: '1234', employer: 'Company A' },
];

// Login endpoint
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  const user = users.find(u => u.name === name && u.password === password);
  if (user) {
    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { name, password, employer } = req.body;
  if (users.find(u => u.name === name)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const newUser = { id: users.length + 1, name, password, employer };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, name: newUser.name }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, user: newUser });
});

// Protected route example
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: 'This is a protected route', user });
  });
});

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));