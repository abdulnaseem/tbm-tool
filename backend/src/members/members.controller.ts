import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ProgrammeId, Session } from './schemas/member-profile.schema';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@Query('programmeId') programmeId?: ProgrammeId,
          @Query('session') session?: Session) {
    return this.membersService.findAll(programmeId, session);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() body: any) {
    const programmeId: ProgrammeId = body.programmeId || 'BRAWLERS_BOXING';
    return this.membersService.create(body, programmeId);
  }

  @Get(':id/bjj-progress')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getBjjProgress(@Param('id') id: string) {
    return this.membersService.getBjjProgress(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.membersService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.membersService.delete(id);
  }

  @Get(':id')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }
}
