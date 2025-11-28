import nodemailer from 'nodemailer';

// Vercel serverless function to send email via SMTP (Zoho)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { to, subject, html, text } = req.body || {};
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const host = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
  const port = Number(process.env.ZOHO_SMTP_PORT || 587);
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  const emailAddress = process.env.ZOHO_FROM_EMAIL || user;
  const from = `Intern Connect <${emailAddress}>`;

  if (!user || !pass) {
    console.error('SMTP credentials not configured');
    return res.status(500).json({ success: false, error: 'SMTP credentials not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    // Optionally verify connection
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.warn('SMTP verify failed:', verifyErr);
      // continue to attempt send; verification isn't required
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html: html || '',
    });

    return res.status(200).json({ success: true, messageId: info.messageId || null });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ success: false, error: err.message || 'Send failed' });
  }
}
