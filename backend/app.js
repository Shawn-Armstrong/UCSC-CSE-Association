const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const port = 5000;
const SECRET_KEY = 'your_secret_key';

const { Pool } = require('pg');
const pool = new Pool({
  user: 'user',
  host: 'database',
  database: 'mydatabase',
  password: 'password',
  port: 5432,
});

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable body-parser

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'timeforfree99@gmail.com',
    pass: "ktvh dkez sflm cnib", // development only, burner account -- use environment variables in production
  },
});

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

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error retrieving profile');
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

    if (!user.is_verified) {
      return res.status(403).send('Account verification required');
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    // Create a token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    // Send the token to the client
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login');
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    const emailCheckResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Check if the username is already taken
    const usernameCheckResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameCheckResult.rows.length > 0) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Insert the new user into the database
    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, verificationToken]
    );

    // Send verification email
    const mailOptions = {
      from: 'timeforfree99@gmail.com',
      to: email,
      subject: 'Please confirm your email account',
      html: `<p>Please confirm your email by clicking on the following link:</p><a href="http://localhost:3000/verify-email?token=${verificationToken}">Verify Email</a></p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Verification email sent: ' + info.response);
        return res.status(201).json({ message: 'Registration successful. Verification email sent.', userId: insertResult.rows[0].id });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    // Update the user's isVerified to true if the token matches
    const result = await pool.query(
      'UPDATE users SET is_verified = true WHERE verification_token = $1 RETURNING *',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid or expired token');
    }

    res.send('Email successfully verified!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during verification');
  }
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

app.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).send('Account already verified');
    }

    // Check if the last attempt was more than an hour ago
    const oneHourAgo = new Date(Date.now() - 3600000); // 3600000 milliseconds = 1 hour
    if (user.last_verification_attempt && user.last_verification_attempt < oneHourAgo) {
      // Reset the count if the last attempt was over an hour ago
      await pool.query('UPDATE users SET verification_attempts = 0 WHERE id = $1', [user.id]);
      user.verification_attempts = 0;
    }

    // Check if the attempt limit has been reached
    if (user.verification_attempts >= 3) {
      // If the user already tried 3 times within the last hour, don't allow another attempt
      return res.status(429).send('Verification email resend limit reached. Please try again later.');
    }

    // Increment the verification attempt count and update the last attempt timestamp
    await pool.query('UPDATE users SET verification_attempts = verification_attempts + 1, last_verification_attempt = NOW() WHERE id = $1', [user.id]);

    // Proceed to send the email
    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Please confirm your email account',
      html: `<p>Please confirm your email by clicking on the following link:</p><a href="http://localhost:3000/verify-email?token=${user.verification_token}">Verify Email</a></p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email');
      } else {
        console.log('Verification email resent: ' + info.response);
        return res.status(200).send('Verification email resent');
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Always respond the same way to avoid revealing user information
    const genericResponse = { message: "If an account with that email exists, a password reset link has been sent." };

    if (userResult.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const user = userResult.rows[0];
    const passwordResetToken = crypto.randomBytes(20).toString('hex');
    const expirationTime = new Date(Date.now() + 3600000); // Token expires in one hour

    // Store the token and expiration time in the user's record
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [passwordResetToken, expirationTime, user.id]
    );

    // Prepare the password reset link for the email
    const resetLink = `http://localhost:3000/password-reset-form?token=${passwordResetToken}`; // This should point to your front-end route

    // Send reset password email
    const mailOptions = {
      from: 'timeforfree99@gmail.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset. Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetLink}">Reset Password</a>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending reset password email' });
      } else {
        console.log('Password reset email sent:', info.response);
        return res.status(200).json(genericResponse);
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
});

app.post('/reset-password/confirm', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with the token and check if the token has expired
    const userResult = await pool.query('SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()', [token]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token and expiration
    await pool.query('UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2', [hashedPassword, user.id]);

    res.status(200).json({ message: "Your password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during password reset confirmation." });
  }
});

app.listen(port, () => console.log(`Backend server listening on port ${port}!`));
