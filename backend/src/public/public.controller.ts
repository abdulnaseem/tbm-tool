import { Body, Controller, Post } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { RecaptchaService } from './recaptcha.service';
import { MailService } from '../mail/mail.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly membersService: MembersService,
    private readonly recaptchaService: RecaptchaService,
    private readonly mailService: MailService,
  ) {}

  @Post('signup')
  async signup(@Body() body: any) {
    await this.recaptchaService.verify(body.recaptchaToken);

    const { recaptchaToken, ...signupData } = body;

    await this.mailService.verifyConnection();

    const member = await this.membersService.create({
      ...signupData,
      importSource: 'PUBLIC_SIGNUP',
      paymentIntentId: 'PUBLIC_SIGNUP_PENDING_PAYMENT',
    });

    await this.mailService.sendSignupConfirmation({
      to: signupData.email,
      guardianName: `${signupData.guardianFirstName || ''} ${signupData.guardianLastName || ''}`.trim(),
      childName: `${signupData.childFirstName || ''} ${signupData.childLastName || ''}`.trim(),
      session: signupData.session || 'UNKNOWN',
    });

    return member;
  }
}