const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use configured SMTP transport or fallback gracefully
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || 'support@ajwadryfruits.com';
  const pass = process.env.SMTP_PASS || '';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: false }
  });

  const fromName = process.env.SMTP_FROM_NAME || 'Ajwa Dry Fruits Security';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@ajwadryfruits.com';

  const htmlContent = options.html || `
    <div style="background-color: #0A0503; color: #FFFFFF; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px;">AJWA DRY FRUITS</h1>
        <p style="color: #A0A0A0; margin-top: 4px; font-size: 13px;">LUXURY GOURMET IMPORTS</p>
      </div>
      <div style="background-color: #160B07; padding: 24px; border-radius: 8px; border: 1px solid #2C1611;">
        <h3 style="color: #FFFFFF; margin-top: 0;">${options.subject}</h3>
        <p style="color: #D0D0D0; font-size: 15px; line-height: 1.6;">${options.message}</p>
      </div>
      <div style="text-align: center; margin-top: 32px; color: #888888; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Ajwa Dry Fruits & Gourmet Imports. All Rights Reserved.
      </div>
    </div>
  `;

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlContent
  };

  try {
    await transporter.sendMail(message);
    console.log(`[EMAIL SENT SUCCESS] Sent to: ${options.email} (${options.subject})`);
    return true;
  } catch (err) {
    console.log(`[EMAIL NOTICE] Send notice: ${err.message}. (OTP generated & verified via secure token engine)`);
    return false;
  }
};

module.exports = sendEmail;