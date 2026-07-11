// backend/src/attendance/attendance.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceSession,
  AttendanceStatus,
} from './schemas/attendance.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('register/:session')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getRegister(@Param('session') session: AttendanceSession) {
    return this.attendanceService.getRegister(session);
  }

  @Post('mark')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  markAttendance(
    @Body()
    body: {
      memberId: string;
      session: AttendanceSession;
      status: AttendanceStatus;
      markedBy?: string;
    },
  ) {
    return this.attendanceService.markAttendance(body);
  }

  @Get('member/:memberId')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findByMember(@Param('memberId') memberId: string) {
    return this.attendanceService.findByMember(memberId);
  }

  @Get('report')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getReport() {
    return this.attendanceService.getReport();
  }

  @Post('admin/backfill')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  backfillSessionAttendance(
    @Body()
    body: {
      session: AttendanceSession;
      date: string;
      presentNames: string[];
      markedAt: string;
      markedBy?: string;
    },
  ) {
    return this.attendanceService.backfillSessionAttendance(body);
  }
}