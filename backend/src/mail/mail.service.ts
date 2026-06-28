// backend/src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not configured.');
    }

    this.resend = new Resend(apiKey);
  }

  async sendSignupConfirmation(data: {
    to: string;
    guardianName: string;
    childName: string;
    session: string;
  }) {
    if (!data.to) return;

    const from =
      this.configService.get<string>('MAIL_FROM') ||
      'The Butterfly Movement <info@thebutterflymovement.health>';

    const result = await this.resend.emails.send({
      from,
      to: data.to,
      subject: 'Welcome to Brawlers Boxing | The Butterfly Movement',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a; line-height: 1.7;">
          <div style="text-align:center; padding:20px 0;">
            <h1 style="margin:0; color:#15803d;">Registration Received</h1>
            <p style="margin-top:8px; color:#64748b;">
              Brawlers Boxing • The Butterfly Movement
            </p>
          </div>

          <p>Hi ${data.guardianName || 'there'},</p>

          <p>
            Thank you for submitting your registration for
            <strong>Brawlers Boxing</strong>, part of
            <strong>The Butterfly Movement</strong>.
          </p>

          <p>We have successfully received the registration for:</p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin:20px 0;">
            <strong>Participant:</strong> ${data.childName}<br/>
            <strong>Session:</strong> ${data.session}
          </div>

          <h3 style="margin-top:30px;">Programme Information</h3>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <p style="margin:0 0 12px 0;">
              <strong>Summer Term 2026</strong><br/>
              Saturday 4th July 2026 - Saturday 26th September 2026
            </p>

            <p style="margin:0 0 12px 0;">
              <strong>Training Day</strong><br/>
              Every Saturday
            </p>

            <p style="margin:0 0 12px 0;">
              <strong>Cubs (5-10 years)</strong><br/>
              12:45pm - 1:45pm
            </p>

            <p style="margin:0 0 12px 0;">
              <strong>Tigers (11-17 years)</strong><br/>
              1:45pm - 2:45pm
            </p>

            <p style="margin:0;">
              <strong>Location</strong><br/>
              Osmani Trust<br/>
              58 Underwood Road<br/>
              London E1 5AW
            </p>
          </div>

          <p>
            If you have any questions, please reply to this email or contact us at:
          </p>

          <p>
            <strong>info@thebutterflymovement.health</strong>
          </p>

          <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;" />

          <p style="font-size:14px; color:#64748b;">
            Kind regards,<br/>
            <strong>The Butterfly Movement</strong><br/>
            Brawlers Boxing Team
          </p>
        </div>
      `,
    });

    this.logger.log(`Signup confirmation email sent to ${data.to}`);
    this.logger.log(JSON.stringify(result));
  }
}