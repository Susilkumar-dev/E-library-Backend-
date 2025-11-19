const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 10,
      rateDelta: 2000,
      rateLimit: 3,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    this.transporter.on('error', (error) => {
      console.error('❌ SMTP Transporter Error:', error);
    });
  }

  async sendOTP(email, otp, purpose = 'verification', retryCount = 2) {
    const subject = purpose === 'verification' 
      ? 'Verify Your E-Library Account' 
      : 'Reset Your Password - E-Library';
    
    const html = this.generateOTPTemplate(otp, purpose);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: html,
      text: `Your E-Library OTP code is: ${otp}. This OTP will expire in 10 minutes.`,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    let lastError;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`📧 Attempt ${attempt} to send OTP to: ${email}`);
        const result = await this.transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully:', {
          messageId: result.messageId,
          to: email,
          purpose: purpose
        });
        
        return { 
          success: true, 
          messageId: result.messageId,
          response: result.response 
        };
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Email sending attempt ${attempt} failed:`, error.message);
        
        if (attempt < retryCount) {
          const waitTime = attempt * 2000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    console.error('❌ All email sending attempts failed for:', email, lastError.message);
    
    let userMessage = 'Failed to send email. Please try again.';
    if (lastError.code === 'EAUTH') {
      userMessage = 'Email authentication failed. Please check email configuration.';
    } else if (lastError.code === 'EENVELOPE') {
      userMessage = 'Invalid email address.';
    } else if (lastError.code === 'ECONNECTION' || lastError.code === 'ECONNRESET') {
      userMessage = 'Email service temporarily unavailable. Please try again later.';
    }
    
    return { 
      success: false, 
      error: lastError.message,
      userMessage: userMessage
    };
  }

  generateOTPTemplate(otp, purpose) {
    const purposeText = purpose === 'verification' 
      ? 'verify your account and start exploring our digital library' 
      : 'reset your password and secure your account';
    
    const title = purpose === 'verification' 
      ? 'Account Verification' 
      : 'Password Reset';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - E-Library</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          background-color: #f6f9fc; 
          padding: 20px;
          margin: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 8px 24px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 40px 30px; 
          text-align: center; 
          color: white; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 700;
        }
        .header h2 { 
          margin: 10px 0 0 0; 
          font-size: 20px; 
          font-weight: 400;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px; 
          color: #333;
          line-height: 1.6;
        }
        .otp-code { 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 20px; 
          text-align: center; 
          font-size: 36px; 
          font-weight: bold; 
          letter-spacing: 10px; 
          border-radius: 12px; 
          margin: 30px 0; 
          font-family: 'Courier New', monospace;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .footer { 
          background: #f8f9fa; 
          padding: 25px; 
          text-align: center; 
          color: #666; 
          font-size: 13px; 
          border-top: 1px solid #e9ecef;
        }
        .info-box {
          background: #e8f4fd;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning {
          color: #d32f2f;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .container { border-radius: 0; }
          .otp-code { font-size: 28px; letter-spacing: 6px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>E-Library 📚</h1>
          <h2>${title}</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Use the OTP code below to ${purposeText}:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="info-box">
            <p class="warning">⏰ This code will expire in <strong>10 minutes</strong></p>
            <p>For your security, please do not share this code with anyone.</p>
          </div>
          
          <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
          
          <p>Happy reading!<br>The E-Library Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 E-Library. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
          <p>If you need help, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
      return false;
    }
  }

  async close() {
    try {
      this.transporter.close();
      console.log('📧 Email transporter closed');
    } catch (error) {
      console.error('Error closing email transporter:', error);
    }
  }
}

module.exports = new EmailService();