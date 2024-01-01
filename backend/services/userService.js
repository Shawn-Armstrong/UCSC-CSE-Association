// services/userService.js
const pool = require('./databaseService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
}

async function createUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, verification_token',
        [username, email, hashedPassword, verificationToken]
    );
    console.log(result.rows[0]);

    return result.rows[0];
}

async function verifyUser(token) {
    const result = await pool.query(
        'UPDATE users SET is_verified = true WHERE verification_token = $1 RETURNING *',
        [token]
    );
    return result.rowCount > 0;
}

async function getUserById(id) {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

async function checkUsernameEmailAvailability(username, email) {
    const result = await pool.query(
        'SELECT email, username FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );
    return result.rows;
}

async function resendVerificationEmail(email) {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return { status: 404, message: 'User not found' };

    const user = userResult.rows[0];
    if (user.is_verified) return { status: 400, message: 'Account already verified' };

    const oneHourAgo = new Date(Date.now() - 3600000);
    if (user.last_verification_attempt && user.last_verification_attempt < oneHourAgo) {
        await pool.query('UPDATE users SET verification_attempts = 0 WHERE id = $1', [user.id]);
        user.verification_attempts = 0;
    }

    if (user.verification_attempts >= 3) return { status: 429, message: 'Verification email resend limit reached. Please try again later.' };

    await pool.query('UPDATE users SET verification_attempts = verification_attempts + 1, last_verification_attempt = NOW() WHERE id = $1', [user.id]);

    await sendVerificationEmail(email, user.verification_token);
    return { status: 200, message: 'Verification email resent' };
}

async function updateUserVerificationAttempt(userId) {
    // Reset the count if the last attempt was over an hour ago
    await pool.query(
        `WITH updated AS (
            UPDATE users 
            SET verification_attempts = CASE 
                WHEN last_verification_attempt < NOW() - INTERVAL '1 HOUR' THEN 0
                ELSE verification_attempts
            END
            WHERE id = $1
            RETURNING verification_attempts, last_verification_attempt
        )
        UPDATE users
        SET verification_attempts = verification_attempts + 1, last_verification_attempt = NOW()
        WHERE id = $1
        AND (SELECT verification_attempts FROM updated) < 3
        RETURNING verification_attempts`,
        [userId]
    );

    // Check if the attempt limit has been reached
    const result = await pool.query(
        'SELECT verification_attempts FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length > 0) {
        const attempts = result.rows[0].verification_attempts;
        if (attempts >= 3) {
            throw new Error('Verification email resend limit reached');
        }
    }
}

module.exports = { updateUserVerificationAttempt, getUserByEmail, createUser, verifyUser, getUserById, checkUsernameEmailAvailability, resendVerificationEmail };
