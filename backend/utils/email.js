const SibApiV3Sdk = require('@getbrevo/brevo');

const getBrevoClient = () => {
  const client = new SibApiV3Sdk.TransactionalEmailsApi();
  client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
  return client;
};

/**
 * Send an email using Brevo HTTP API (works on all cloud providers, no domain verification needed)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const client = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = { name: 'CampsMart', email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  await client.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendEmail };
