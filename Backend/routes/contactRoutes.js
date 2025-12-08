const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


router.post('/', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  // Validation
  if (!firstName || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    // Transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your SMTP provider (Outlook, Yahoo, etc.)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email Layout
    const mailOptions = {
      from: `MangoDesk Contact Form <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL, // abhayagrahari52@gmail.com
      replyTo: email,
      subject: `New Message from ${firstName} ${lastName || ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f59e0b;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555;">${message}</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Sent via MangoDesk Website</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
  }
});

module.exports = router;