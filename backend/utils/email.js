const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,       // Your Brevo account email
    pass: process.env.BREVO_SMTP_KEY,   // Brevo SMTP key (NOT your password)
  },
});

/**
 * Send an email via Brevo SMTP relay (works on cloud providers unlike Gmail SMTP)
 */
const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"CampsMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };

