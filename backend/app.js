const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = 5000;
const SECRET_KEY = 'your_secret_key';

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable body-parser

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected route to get user information
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    // req.user contains the JWT payload. In this case, user's ID.
    const userResult = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    // Respond with some user information
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error retrieving profile');
  }
});

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.post('/login2', (req, res) => {
  // This is a simplistic example. You should validate the credentials and handle errors properly.
  // A real implementation should use password hashing and a more secure means of validation.

  const { email, password } = req.body;

  if (email === 'user@example.com' && password === 'password123') {
    res.json({ token: 'your_generated_token' });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).send('User does not exist');
    }

    const user = userResult.rows[0];

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    // Create a token (for JWT, use jwt.sign)
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    // Send the token to the client
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login');
  }
});

app.get('/', (req, res) => res.send('Toto is a yorkie!!!!'));

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password - the salt is automatically generated and included in the hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    // Respond with the ID of the new user
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    // Handle errors, such as sending a 400 if the user already exists
    res.status(500).send('Server error');
  }
});

app.listen(port, () => console.log(`Backend server listening on port ${port}!`));

const { Pool } = require('pg');
const pool = new Pool({
  user: 'user',
  host: 'database',
  database: 'mydatabase',
  password: 'password',
  port: 5432,
});

app.get('/data', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM my_table');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
});
