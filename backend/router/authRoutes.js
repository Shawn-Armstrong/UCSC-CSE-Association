const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requestPasswordReset, confirmPasswordReset } = require('../services/passwordService');
const authenticateToken = require('../middlewares/authenticateToken');
const { sendVerificationEmail } = require('../services/emailService');
const { updateUserVerificationAttempt, getUserByEmail, createUser, verifyUser, getUserById } = require('../services/userService');
const SECRET_KEY = process.env.SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Extract the user ID from the query parameter
        const userId = req.query.uid;

        // Check if the user ID is provided
        if (!userId) {
            return res.status(400).send('User ID is required');
        }

        // Fetch the user information based on the provided user ID
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Remove sensitive information from the user object
        delete user.password_hash;
        delete user.password_reset_token;
        delete user.password_reset_expires;

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error retrieving profile');
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        if (!user) return res.status(401).send('User does not exist');
        if (!user.is_verified) return res.status(403).send('Account verification required');
        if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).send('Invalid credentials');
        
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV !== 'development', path: '/' });
        res.status(200).send('Login successful');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during login');
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) return res.status(409).send('Email is already registered');

        const newUser = await createUser(username, email, password);
        await sendVerificationEmail(email, newUser.verification_token, FRONTEND_URL);

        res.status(201).json({ message: 'Registration successful. Verification email sent.', userId: newUser.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (await verifyUser(token)) {
            res.send('Email successfully verified!');
        } else {
            res.status(400).send('Invalid or expired token');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during verification');
    }
});

router.post('/reset-password', async (req, res) => {
    const response = await requestPasswordReset(req.body.email);
    res.status(200).json(response);
});

router.post('/reset-password/confirm', async (req, res) => {
    const { token, newPassword } = req.body;
    const response = await confirmPasswordReset(token, newPassword);
    res.status(response.status).json({ message: response.message });
});

router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.is_verified) {
            return res.status(400).send('Account already verified');
        }

        try {
            await updateUserVerificationAttempt(user.id);
            await sendVerificationEmail(email, user.verification_token, FRONTEND_URL);
            return res.status(200).send('Verification email resent');
        } catch (error) {
            if (error.message === 'Verification email resend limit reached') {
                return res.status(429).send(error.message);
            }
            throw error;
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/validate-session', authenticateToken, (req, res) => {
    res.status(200).json({ isAuthenticated: true });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
});

module.exports = router;