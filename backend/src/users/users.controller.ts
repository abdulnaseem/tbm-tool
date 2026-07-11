// backend/src/users/users.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { Request } from 'express';
  
  import { UsersService } from './users.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
  import { UserRole } from './enums/user-role.enum';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  
  type AuthenticatedRequest = Request & {
    user: {
      id: string;
      email: string;
      roles: UserRole[];
      isActive: boolean;
    };
  };
  
  @Controller('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get()
    findAll() {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.usersService.findSafeById(id);
    }
  
    @Post()
    create(@Body() dto: CreateUserDto) {
      return this.usersService.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() dto: UpdateUserDto,
      @Req() req: AuthenticatedRequest,
    ) {
      return this.usersService.update(id, dto, req.user.id);
    }
  
    @Patch(':id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePassword(
      @Param('id') id: string,
      @Body() dto: UpdateUserPasswordDto,
    ) {
      await this.usersService.updatePassword(id, dto.password);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
      @Param('id') id: string,
      @Req() req: AuthenticatedRequest,
    ) {
      await this.usersService.delete(id, req.user.id);
    }
  }