const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

const transporter = nodemailer.createTransport(emailConfig);

async function sendPasswordResetEmail(email, resetLink) {
    const mailOptions = {
        from: 'timeforfree99@gmail.com',
        to: email,
        subject: 'Reset Your Password',
        html: `<p>You requested a password reset. Click the link below to reset your password. This link will expire in 1 hour.</p><a href="${resetLink}">Reset Password</a>`
    };

    await transporter.sendMail(mailOptions);
}

async function sendVerificationEmail(email, verificationToken, frontendUrl) {
    const mailOptions = {
        from: 'timeforfree99@gmail.com',
        to: email,
        subject: 'Please confirm your email account',
        html: `<p>Please confirm your email by clicking on the following link:</p><a href="${frontendUrl}/verify-email?token=${verificationToken}">Verify Email</a></p>`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { transporter, sendPasswordResetEmail, sendVerificationEmail };
