// // backend/src/attendance/attendance.controller.ts
// import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
// import { AttendanceService } from './attendance.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

// @Controller('attendance')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class AttendanceController {
//   constructor(private readonly attendanceService: AttendanceService) {}

//   // Staff marking attendance manually for member
//   @Post('sessions/:sessionId/check-in/:memberId')
//   @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
//   checkInMember(
//     @Param('sessionId') sessionId: string,
//     @Param('memberId') memberId: string,
//     @Request() req,
//   ) {
//     return this.attendanceService.checkIn({
//       classSessionId: sessionId,
//       memberId,
//       userId: req.user.sub,
//       method: 'MANUAL',
//       source: 'PORTAL',
//     });
//   }

//   // Member history (later for app)
//   @Get('me')
//   @Roles('MEMBER', 'GUARDIAN')
//   getMyAttendance(@Request() req, @Query('from') from?: string, @Query('to') to?: string) {
//     return this.attendanceService.findForMember(req.user.sub, { from, to });
//   }
// }