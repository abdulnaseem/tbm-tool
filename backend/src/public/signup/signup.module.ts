import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import {
  MemberProfile,
  MemberProfileSchema,
} from '../../members/schemas/member-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MemberProfile.name, schema: MemberProfileSchema },
    ]),
  ],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}