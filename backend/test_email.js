/*import nodemailer from 'nodemailer';

async function sendTestEmail() {
  // 1. Setup the Transporter (The Mailman)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'YOUR_EMAIL@gmail.com', // <--- PUT YOUR GMAIL HERE
      pass: 'YOUR_APP_PASSWORD'      // <--- PUT YOUR APP PASSWORD HERE (NOT your normal password)
    }
  });

  // 2. Setup the Email (The Letter)
  const mailOptions = {
    from: 'System Routines <noreply@storium.com>',
    to: 'YOUR_EMAIL@gmail.com',      // <--- SEND TO YOURSELF
    subject: '⚠️ Storium Alert: Low Stock Detected',
    text: 'This is a test email triggered by the Routine Engine. Hydraulic Oil is low.'
  };

  // 3. Send it
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.log('❌ Error sending email:', error);
  }
}

sendTestEmail();



*/


/// I will fix it later 
