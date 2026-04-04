const SibApiV3Sdk = require('@getbrevo/brevo');
const { Resend } = require('resend');

/**
 * Send an email via Brevo API (primary) or Resend (fallback)
 */
const sendEmail = async (to, subject, html) => {
  try {
    // 1. Try Brevo API first (Better for sending without a domain)
    if (process.env.BREVO_API_KEY) {
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let apiKey = apiInstance.authentications['apiKey'];
      apiKey.apiKey = process.env.BREVO_API_KEY;

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = { "name": "CampsMart", "email": process.env.EMAIL_USER || "rajrawat200325557@gmail.com" };
      sendSmtpEmail.to = [{ "email": to }];

      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email sent via Brevo API');
      return data;
    }

    // 2. Fallback to Resend API
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'CampsMart <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      });
      if (error) throw new Error(error.message);
      console.log('✅ Email sent via Resend API');
      return data;
    }

    throw new Error('No email provider (Brevo or Resend) configured in environment variables');
  } catch (error) {
    console.error('📧 Email failure:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };

