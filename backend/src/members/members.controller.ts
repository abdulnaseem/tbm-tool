// backend/src/members/members.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }
}