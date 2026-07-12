// backend/src/payments/payments.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentReportQueryDto } from './dto/payment-report-query.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    roles: UserRole[];
    isActive: boolean;
  };
};

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  statistics(@Query() query: PaymentReportQueryDto) {
    return this.paymentsService.getStatistics(query);
  }

  @Get('export')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async export(
    @Query() query: PaymentReportQueryDto,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.paymentsService.exportPayments(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    res.send(buffer);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@Query() query: PaymentReportQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(
    @Body() body: CreatePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.create(
      body,
      req.user.email,
    );
  }

  @Get('member/:memberId')
  @Roles(
    UserRole.COACH,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  findByMember(@Param('memberId') memberId: string) {
    return this.paymentsService.findByMember(memberId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: UpdatePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.update(
      id,
      body,
      req.user.email,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }
}