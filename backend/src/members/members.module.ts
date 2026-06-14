// backend/src/members/members.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberProfile, MemberProfileSchema } from './schemas/member-profile.schema';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MemberProfile.name, schema: MemberProfileSchema },
    ]),
    PaymentsModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}