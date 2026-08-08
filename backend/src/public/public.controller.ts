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
    private readonly membersService: MembersService,
    private readonly recaptchaService: RecaptchaService,
    private readonly mailService: MailService,
  ) {}

  @Post('signup/brawlers-boxing')
  signupBrawlers(@Body() body: any) {
    return this.createSignup(
      body,
      ProgrammeId.BRAWLERS_BOXING,
    );
  }

  @Post('signup/the-grapple-hub')
  signupGrappleHub(@Body() body: any) {
    return this.createSignup(
      body,
      ProgrammeId.THE_GRAPPLE_HUB,
    );
  }

  private async createSignup(
    body: any,
    programmeId: ProgrammeId,
  ) {
    await this.recaptchaService.verify(
      body.recaptchaToken,
    );

    const {
      recaptchaToken,
      gymId: ignoredGymId,
      ...signupData
    } = body;

    const member = await this.membersService.create({
      ...signupData,
      gymId: programmeId,

      disciplines:
        programmeId === ProgrammeId.BRAWLERS_BOXING
          ? ['BOXING']
          : ['BJJ'],

      importSource:
        programmeId === ProgrammeId.BRAWLERS_BOXING
          ? 'BRAWLERS_PUBLIC_SIGNUP'
          : 'GRAPPLE_HUB_PUBLIC_SIGNUP',

      paymentIntentId:
        'PUBLIC_SIGNUP_PENDING_PAYMENT',
    });

    try {
      await this.mailService.sendSignupConfirmation({
        to: signupData.email,

        guardianName: [
          signupData.guardianFirstName,
          signupData.guardianLastName,
        ]
          .filter(Boolean)
          .join(' '),

        childName: [
          signupData.childFirstName,
          signupData.childLastName,
        ]
          .filter(Boolean)
          .join(' '),

        session: signupData.session || 'UNKNOWN',

      });
    } catch (error) {
      console.error(
        `${programmeId} signup email failed:`,
        error,
      );
    }

    return member;
  }
}