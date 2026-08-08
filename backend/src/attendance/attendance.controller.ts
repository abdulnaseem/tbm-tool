// backend/src/attendance/attendance.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import {
  AttendanceSession,
  AttendanceStatus,
} from './schemas/attendance.schema';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { parseProgrammeId } from '../common/programmes/programme.helper';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  @Get('register/:session')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getRegister(
    @Param('session') session: AttendanceSession,
    @Query('programmeId') programmeId: string,
  ) {
    return this.attendanceService.getRegister(
      session,
      parseProgrammeId(programmeId),
    );
  }

  @Post('mark')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  markAttendance(
    @Query('programmeId') programmeId: string,
    @Body()
    body: {
      memberId: string;
      session: AttendanceSession;
      status: AttendanceStatus;
      markedBy?: string;
    },
  ) {
    return this.attendanceService.markAttendance({
      ...body,
      programmeId: parseProgrammeId(programmeId),
    });
  }

  @Get('member/:memberId')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findByMember(
    @Param('memberId') memberId: string,
    @Query('programmeId') programmeId: string,
  ) {
    return this.attendanceService.findByMember(
      memberId,
      parseProgrammeId(programmeId),
    );
  }

  @Get('report')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getReport(@Query('programmeId') programmeId: string) {
    return this.attendanceService.getReport(
      parseProgrammeId(programmeId),
    );
  }

  @Post('admin/backfill')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  backfillSessionAttendance(
    @Query('programmeId') programmeId: string,
    @Body()
    body: {
      session: AttendanceSession;
      date: string;
      presentNames: string[];
      markedAt: string;
      markedBy?: string;
    },
  ) {
    return this.attendanceService.backfillSessionAttendance({
      ...body,
      programmeId: parseProgrammeId(programmeId),
    });
  }
}