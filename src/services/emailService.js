import nodemailer from 'nodemailer';

/**
 * Email Service for sending emails using Nodemailer
 */

// Create reusable transporter
const createTransporter = () => {
    // Check if SMTP settings are present
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP settings not missing. Email sending functionality might fail.');
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            // Do not fail on invalid certs (useful for dev with self-signed certs)
            // In production, you might want to remove this
            rejectUnauthorized: false
        }
    });
};

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User's name
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (to, otp, userName = 'User') => {
    try {
        const transporter = createTransporter();

        // Email HTML template
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4FC3F7; }
          .content { background-color: white; padding: 25px; border-radius: 8px; }
          .otp-box { background-color: #f5f5f5; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px dashed #4FC3F7; color: #333; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔧 FixPoint</div>
            <h2>Password Reset Code</h2>
          </div>
          
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password. Use the code below to complete the process:</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <div class="warning">
              <strong>⏰ Expires in 15 minutes.</strong><br>
              If you didn't request this code, you can safely ignore this email.
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated email from FixPoint Maintenance Management System.</p>
            <p>&copy; 2025 FixPoint. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const textContent = `
Password Reset Code

Hello ${userName},

Your password reset code is: ${otp}

This code expires in 15 minutes.
If you didn't request this, please ignore this email.

FixPoint Maintenance Management System
    `;

        // Send email
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'FixPoint Support'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to: to,
            subject: 'Your Password Reset Code - FixPoint',
            text: textContent,
            html: htmlContent,
        });

        console.log('✅ Password reset email sent successfully:', info.messageId);
        return info;

    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

export default {
    sendPasswordResetEmail
};
