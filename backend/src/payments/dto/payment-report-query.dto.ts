// backend/src/payments/dto/payment-report-query.dto.ts
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  PaymentMethod,
  PaymentStatus,
} from '../schemas/payment.schema';

export enum PaymentReportPeriod {
  THIS_TERM = 'THIS_TERM',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM',
}

export enum PaymentSession {
  CUBS = 'CUBS',
  TIGERS = 'TIGERS',
  UNKNOWN = 'UNKNOWN',
}

export class PaymentReportQueryDto {
  @IsOptional()
  @IsEnum(PaymentReportPeriod)
  period: PaymentReportPeriod = PaymentReportPeriod.THIS_TERM;

  @ValidateIf((dto) => dto.period === PaymentReportPeriod.CUSTOM)
  @IsDateString()
  from?: string;

  @ValidateIf((dto) => dto.period === PaymentReportPeriod.CUSTOM)
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentSession)
  session?: PaymentSession;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 25;
}