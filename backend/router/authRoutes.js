const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const pool = require('../services/databaseService');
const transporter = require('../services/emailService');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

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

router.get('/profile', authenticateToken, async (req, res) => {
    try {
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).send('User does not exist');
        }

        const user = userResult.rows[0];

        if (!user.is_verified) {
            return res.status(403).send('Account verification required');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during login');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const checkResult = await pool.query(
            'SELECT email, username FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        let message = '';
        if (checkResult.rows.some(row => row.email === email)) {
            message = 'Email is already registered';
        } else if (checkResult.rows.some(row => row.username === username)) {
            message = 'Username is already taken';
        }

        if (message) {
            return res.status(409).json({ message });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const insertResult = await pool.query(
            'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email, hashedPassword, verificationToken]
        );

        const mailOptions = {
            from: 'timeforfree99@gmail.com',
            to: email,
            subject: 'Please confirm your email account',
            html: `<p>Please confirm your email by clicking on the following link:</p><a href="http://localhost:3000/verify-email?token=${verificationToken}">Verify Email</a></p>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
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

router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

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

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        const genericResponse = { message: "If an account with that email exists, a password reset link has been sent." };

        if (userResult.rows.length === 0) {
            return res.status(200).json(genericResponse);
        }

        const user = userResult.rows[0];
        const passwordResetToken = crypto.randomBytes(20).toString('hex');
        const expirationTime = new Date(Date.now() + 3600000);

        await pool.query(
            'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
            [passwordResetToken, expirationTime, user.id]
        );

        const resetLink = `http://localhost:3000/password-reset-form?token=${passwordResetToken}`;

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

router.post('/reset-password/confirm', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()', [token]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }

        const user = userResult.rows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2', [hashedPassword, user.id]);

        res.status(200).json({ message: "Your password has been reset successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during password reset confirmation." });
    }
});

router.post('/resend-verification', async (req, res) => {
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

        transporter.sendMail(mailOptions, function (error, info) {
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

module.exports = router;