// backend/src/payments/payments.controller.ts
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
  import { PaymentsService } from './payments.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  import { UserRole } from '../users/enums/user-role.enum';

  @Controller('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}
  
    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    create(@Body() body: any) {
      return this.paymentsService.create(body);
    }
  
    @Get('member/:memberId')
    @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findByMember(@Param('memberId') memberId: string) {
      return this.paymentsService.findByMember(memberId);
    }
  
    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
      return this.paymentsService.update(id, body);
    }
  
    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    delete(@Param('id') id: string) {
      return this.paymentsService.delete(id);
    }
  }