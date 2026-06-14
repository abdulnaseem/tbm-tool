// backend/src/members/members.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() body: any) {
    return this.membersService.create(body);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.membersService.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  delete(@Param('id') id: string) {
    return this.membersService.delete(id);
  }

  @Get(':id')
  @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }
}