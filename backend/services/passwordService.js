const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('./databaseService');
const { sendPasswordResetEmail } = require('./emailService');

async function requestPasswordReset(email) {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
        // It's common practice to not reveal whether an email is registered in the system
        return { message: "If an account with that email exists, a password reset link has been sent." };
    }

    const user = userResult.rows[0];
    const passwordResetToken = crypto.randomBytes(20).toString('hex');
    const expirationTime = new Date(Date.now() + 3600000); // 1 hour from now

    await pool.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [passwordResetToken, expirationTime, user.id]
    );

    const resetLink = `http://localhost:3000/password-reset-form?token=${passwordResetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    return { message: "Password reset link has been sent to your email." };
}

async function confirmPasswordReset(token, newPassword) {
    const userResult = await pool.query(
        'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
    );

    if (userResult.rows.length === 0) {
        return { message: "Password reset token is invalid or has expired.", status: 400 };
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [hashedPassword, user.id]
    );

    return { message: "Your password has been reset successfully.", status: 200 };
}

module.exports = { requestPasswordReset, confirmPasswordReset };
