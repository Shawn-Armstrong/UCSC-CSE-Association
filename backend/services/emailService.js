const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');
const transporter = nodemailer.createTransport(emailConfig);

const sendPasswordResetEmail = async (email, resetLink) => {
    const mailOptions = {
      from: 'timeforfree99@gmail.com', 
      to: email,
      subject: 'Reset Your Password',
      html: `<p>You requested a password reset. Click the link below to reset your password. This link will expire in 1 hour.</p><a href="${resetLink}">Reset Password</a>`
    };
  
    await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendPasswordResetEmail };