import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER!; // Fixed Gmail Address (e.g., yourapp@gmail.com)
const GMAIL_PASS = process.env.GMAIL_PASS!; // Use an App Password

export const MailSend = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  console.log("📨 MailSend function called"); // ✅ Log function execution
  console.log("📧 Sending email from:", GMAIL_USER, "to:", to); // ✅ Log sender and recipient emails

  try {
    // Create email content
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Notification</title>
          <style>
            body {
              background-color: #f7f7f7;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .footer {
              background: #f1f1f1;
              text-align: center;
              padding: 10px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p style="white-space: pre-wrap; font-family: sans-serif; font-size: 16px; color: black;">${text}</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Acenra. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("✍️ Preparing to send email to:", to, "with subject:", subject); // ✅ Log recipient details

    // Create a Nodemailer transporter using SYSTEM_GMAIL credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER, // Fixed Gmail Address
        pass: GMAIL_PASS, // Use an App Password (not your Gmail password)
      },
    });

    console.log("🚀 Transporter configured, attempting to send email..."); // ✅ Log before sending

    // Send the email
    const info = await transporter.sendMail({
      from: GMAIL_USER, // Always send from the fixed Gmail address
      to,
      subject,
      html: content,
    });

    console.log("✅ Message Sent Successfully!", info); // ✅ Log successful email sending
    return "Email sent successfully!";
  } catch (error) {
    console.error("❌ Error sending mail:", error);
    return "Failed to send email.";
  }
};
