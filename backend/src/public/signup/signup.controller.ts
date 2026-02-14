// signup.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SignupService } from './signup.service';
import { AdultSignupDto } from './dto/adult-signup.dto';
import { GuardianSignupDto } from './dto/guardian-signup.dto';

@Controller('public/signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('adult')
  adultSignup(@Body() dto: AdultSignupDto) {
    return this.signupService.handleAdultSignup(dto);
  }

  @Post('guardian')
  guardianSignup(@Body() dto: GuardianSignupDto) {
    return this.signupService.handleGuardianSignup(dto);
  }
}