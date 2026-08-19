import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { MembersService } from '../members/members.service';
import { RecaptchaService } from './recaptcha.service';
import { MailService } from '../mail/mail.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly membersService:
      MembersService,

    private readonly recaptchaService:
      RecaptchaService,

    private readonly mailService:
      MailService,
  ) {}

  @Post('signup/brawlers-boxing')
  async brawlersSignup(
    @Body()
    body: any,
  ) {
    await this.recaptchaService.verify(
      body.recaptchaToken,
    );

    const {
      recaptchaToken,
      ...signupData
    } = body;

    const member =
      await this.membersService.create(
        {
          ...signupData,

          importSource:
            'BRAWLERS_PUBLIC_SIGNUP',

          paymentIntentId:
            'PUBLIC_SIGNUP_PENDING_PAYMENT',
        },

        'BRAWLERS_BOXING',
      );

    try {
      await this.mailService
        .sendSignupConfirmation({
          to:
            signupData.email,

          guardianName:
            `${
              signupData.guardianFirstName ||
              ''
            } ${
              signupData.guardianLastName ||
              ''
            }`.trim(),

          childName:
            `${
              signupData.childFirstName ||
              ''
            } ${
              signupData.childLastName ||
              ''
            }`.trim(),

          session:
            signupData.session ||
            'UNKNOWN',
        });
    } catch (error) {
      console.error(
        'Brawlers signup email failed:',
        error,
      );
    }

    return member;
  }

  @Post('signup/the-grapple-hub')
  async grappleHubSignup(
    @Body()
    body: any,
  ) {
    await this.recaptchaService.verify(
      body.recaptchaToken,
    );

    const {
      recaptchaToken,
      ...signupData
    } = body;

    const member =
      await this.membersService.create(
        {
          ...signupData,

          importSource:
            'GRAPPLE_HUB_PUBLIC_SIGNUP',

          paymentIntentId:
            'GRAPPLE_HUB_COHORT_REGISTRATION',

          totalPrice:
            0,
        },

        'THE_GRAPPLE_HUB',
      );

    try {
      await this.mailService
        .sendSignupConfirmation({
          to:
            signupData.email,

          guardianName:
            `${
              signupData.guardianFirstName ||
              ''
            } ${
              signupData.guardianLastName ||
              ''
            }`.trim(),

          childName:
            `${
              signupData.childFirstName ||
              ''
            } ${
              signupData.childLastName ||
              ''
            }`.trim(),

          session:
            'JUNIORS',
        });
    } catch (error) {
      console.error(
        'Grapple Hub signup email failed:',
        error,
      );
    }

    return member;
  }
}