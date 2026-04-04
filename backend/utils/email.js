const { Resend } = require('resend');

/**
 * Send an email via Resend HTTP API (works on cloud providers unlike SMTP)
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing in environment variables');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'CampsMart <onboarding@resend.dev>', // Use a verified domain if available
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend delivery error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('📧 Email failed:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };

