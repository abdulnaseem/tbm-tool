// backend/src/members/members.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { parseProgrammeId } from '../common/programmes/programme.helper';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@Query('programmeId') programmeId: string) {
    return this.membersService.findAll(parseProgrammeId(programmeId));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(
    @Query('programmeId') programmeId: string,
    @Body() body: any,
  ) {
    return this.membersService.create({
      ...body,
      gymId: parseProgrammeId(programmeId),
    });
  }

  @Get(':id')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(
    @Param('id') id: string,
    @Query('programmeId') programmeId: string,
  ) {
    return this.membersService.findOne(
      id,
      parseProgrammeId(programmeId),
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Query('programmeId') programmeId: string,
    @Body() body: any,
  ) {
    return this.membersService.update(
      id,
      parseProgrammeId(programmeId),
      body,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(
    @Param('id') id: string,
    @Query('programmeId') programmeId: string,
  ) {
    return this.membersService.delete(
      id,
      parseProgrammeId(programmeId),
    );
  }
}