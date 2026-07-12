// backend/src/payments/dto/update-payment.dto.ts
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import {
    PaymentMethod,
    PaymentStatus,
  } from '../schemas/payment.schema';
  
  export class UpdatePaymentDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber({
      maxDecimalPlaces: 2,
    })
    @Min(0)
    amount?: number;
  
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;
  
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;
  
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
  
    @IsOptional()
    @IsDateString()
    periodStart?: string;
  
    @IsOptional()
    @IsDateString()
    periodEnd?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
  }