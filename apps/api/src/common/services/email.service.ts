import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private smtpFrom = 'noreply@incellderm.mn';

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASSWORD');
    this.smtpFrom = this.configService.get<string>('SMTP_FROM', smtpUser || 'noreply@incellderm.mn') ?? 'noreply@incellderm.mn';

    // If SMTP is not configured, use console logging (development mode)
    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP not configured. Email service will log to console.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: this.smtpFrom,
      to: email,
      subject: 'INCELLDERM MONGOLIA - Нууц үг сэргээх',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #800000 0%, #b02727 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #800000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INCELLDERM MONGOLIA</h1>
              <p>Нууц үг сэргээх</p>
            </div>
            <div class="content">
              <p>Сайн байна уу,</p>
              <p>Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх холбоос дээр дарж шинэ нууц үг үүсгэнэ үү:</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Нууц үг сэргээх</a>
              </p>
              <p>Эсвэл доорх холбоосыг хуулах:</p>
              <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
              <p><strong>Анхаар:</strong> Энэ холбоос 1 цагийн дараа хүчингүй болно.</p>
              <p>Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} INCELLDERM MONGOLIA. Бүх эрх хуулиар хамгаалагдсан.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        INCELLDERM MONGOLIA - Нууц үг сэргээх
        
        Сайн байна уу,
        
        Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх холбоос дээр дарж шинэ нууц үг үүсгэнэ үү:
        
        ${resetLink}
        
        Анхаар: Энэ холбоос 1 цагийн дараа хүчингүй болно.
        
        Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.
        
        © ${new Date().getFullYear()} INCELLDERM MONGOLIA
      `,
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Password reset email sent to ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${email}:`, error);
        // Fallback to console logging
        this.logToConsole(email, resetToken, resetLink);
      }
    } else {
      // Development mode - log to console
      this.logToConsole(email, resetToken, resetLink);
    }
  }

  private logToConsole(email: string, resetToken: string, resetLink: string) {
    this.logger.log('='.repeat(60));
    this.logger.log('📧 Password Reset Email (Development Mode)');
    this.logger.log('='.repeat(60));
    this.logger.log(`To: ${email}`);
    this.logger.log(`Reset Token: ${resetToken}`);
    this.logger.log(`Reset Link: ${resetLink}`);
    this.logger.log('='.repeat(60));
    this.logger.log('💡 To enable email sending, configure SMTP settings in .env:');
    this.logger.log('   SMTP_HOST=smtp.gmail.com');
    this.logger.log('   SMTP_PORT=587');
    this.logger.log('   SMTP_USER=your-email@gmail.com');
    this.logger.log('   SMTP_PASSWORD=your-app-password');
    this.logger.log('   SMTP_FROM=noreply@incellderm.mn');
    this.logger.log('='.repeat(60));
  }
}
