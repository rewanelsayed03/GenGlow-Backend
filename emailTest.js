const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send it to yourself for testing
            subject: "GenGlow Email Test",
            text: "If you see this email, Nodemailer is working!"
        });

        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

sendTestEmail();
