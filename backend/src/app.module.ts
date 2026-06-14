// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module'
// import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
// import { ClassesModule } from './classes/classes.module';
// import { AttendanceModule } from './attendance/attendance.module';
// import { NewsModule } from './news/news.module';
import { PaymentsModule } from './payments/payments.module';
import { PublicModule } from './public/public.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    // UsersModule,
    MembersModule,
    // ClassesModule,
    // AttendanceModule,
    // NewsModule,
    PublicModule,
    PaymentsModule,
    AttendanceModule
  ],
})
export class AppModule {}