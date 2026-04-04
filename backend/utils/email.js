const https = require('https');
const { Resend } = require('resend');

/**
 * Send an email via Brevo API (primary, HTTP-based) or Resend (fallback)
 * USES NATIVE HTTP TO AVOID SDK ERRORS
 */
const sendEmail = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    
    // 1. Try Brevo API first (HTTP v3)
    if (process.env.BREVO_API_KEY) {
      const emailData = JSON.stringify({
        sender: { name: "CampsMart", email: process.env.EMAIL_USER || "rajrawat200325557@gmail.com" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      });

      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': emailData.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Email sent via Brevo API (HTTP)');
            resolve(JSON.parse(body));
          } else {
            console.error('📧 Brevo Fail:', body);
            reject(new Error(`Brevo status code: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(emailData);
      req.end();
      return;
    }

    // 2. Fallback to Resend API
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: 'CampsMart <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      })
      .then((data) => {
        if (data.error) throw new Error(data.error.message);
        console.log('✅ Email sent via Resend API');
        resolve(data);
      })
      .catch((err) => {
        console.error('📧 Resend Fail:', err.message);
        reject(err);
      });
      return;
    }

    reject(new Error('Missing BREVO_API_KEY or RESEND_API_KEY in environment variables'));
  });
};

module.exports = { sendEmail };

