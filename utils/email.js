const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Create email transporter
 * Configure with your email service provider
 */
const createTransporter = () => {
    // Using Gmail as an example - you can change to other providers
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        }
    });
};

/**
 * Send contact form email
 * @param {object} contactData - Contact form data
 * @returns {Promise} Send mail promise
 */
const sendContactEmail = async (contactData) => {
    const { firstName, lastName, email, phone, message } = contactData;

    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'recruitment@eduspherecourses.com',
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .header {
                        background: linear-gradient(135deg, #5C6EF8 0%, #8A5CF6 100%);
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        background: white;
                        padding: 30px;
                        border-radius: 0 0 8px 8px;
                    }
                    .field {
                        margin-bottom: 20px;
                    }
                    .label {
                        font-weight: bold;
                        color: #5C6EF8;
                        margin-bottom: 5px;
                    }
                    .value {
                        color: #333;
                        padding: 10px;
                        background-color: #f5f5f5;
                        border-radius: 4px;
                    }
                    .message-box {
                        background-color: #f5f5f5;
                        padding: 15px;
                        border-left: 4px solid #5C6EF8;
                        border-radius: 4px;
                        margin-top: 10px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 New Contact Form Submission</h2>
                        <p>EduSphere Contact Form</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">👤 Name:</div>
                            <div class="value">${firstName} ${lastName}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">📧 Email:</div>
                            <div class="value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                        
                        <div class="field">
                            <div class="label">📞 Phone:</div>
                            <div class="value"><a href="tel:${phone}">${phone}</a></div>
                        </div>
                        
                        <div class="field">
                            <div class="label">💬 Message:</div>
                            <div class="message-box">${message}</div>
                        </div>
                        
                        <div class="footer">
                            <p>This email was sent from the EduSphere contact form</p>
                            <p>Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        // Plain text version for email clients that don't support HTML
        text: `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendContactEmail
};
