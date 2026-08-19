// backend/src/public/public.controller.ts

import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { MembersService } from '../members/members.service';
import { RecaptchaService } from './recaptcha.service';
import { MailService } from '../mail/mail.service';
import { ProgrammeId } from '../common/enums/programme-id.enum';

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

        ProgrammeId.BRAWLERS_BOXING,
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

          programmeId:
            ProgrammeId.BRAWLERS_BOXING,
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

        ProgrammeId.THE_GRAPPLE_HUB,
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

          programmeId:
            ProgrammeId.THE_GRAPPLE_HUB,
        });
    } catch (error) {
      console.error(
        'Grapple Hub signup email failed:',
        error,
      );
    }

    return member;
  }

  /**
   * Temporary backwards-compatible endpoint.
   *
   * Keep this only if your existing live Brawlers
   * signup frontend may still submit to /public/signup.
   *
   * Once the live frontend definitely uses:
   * /public/signup/brawlers-boxing
   *
   * you can safely remove this endpoint.
   */
  @Post('signup')
  async legacyBrawlersSignup(
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

        ProgrammeId.BRAWLERS_BOXING,
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

          programmeId:
            ProgrammeId.BRAWLERS_BOXING,
        });
    } catch (error) {
      console.error(
        'Legacy Brawlers signup email failed:',
        error,
      );
    }

    return member;
  }
}