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
  
  @Controller('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}
  
    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    create(@Body() body: any) {
      return this.paymentsService.create(body);
    }
  
    @Get('member/:memberId')
    @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
    findByMember(@Param('memberId') memberId: string) {
      return this.paymentsService.findByMember(memberId);
    }
  
    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    update(@Param('id') id: string, @Body() body: any) {
      return this.paymentsService.update(id, body);
    }
  
    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    delete(@Param('id') id: string) {
      return this.paymentsService.delete(id);
    }
  }