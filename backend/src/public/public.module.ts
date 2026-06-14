import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { MailModule } from '../mail/mail.module';
import { PublicController } from './public.controller';
import { RecaptchaService } from './recaptcha.service';

@Module({
  imports: [MembersModule, MailModule],
  controllers: [PublicController],
  providers: [RecaptchaService],
})
export class PublicModule {}