// backend/src/payments/dto/create-payment.dto.ts
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsMongoId,
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
  
  export class CreatePaymentDto {
    @IsMongoId()
    memberId: string;
  
    @IsOptional()
    @IsEmail()
    guardianEmail?: string;
  
    @Type(() => Number)
    @IsNumber({
      maxDecimalPlaces: 2,
    })
    @Min(0)
    amount: number;
  
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;
  
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
  
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
  
    @IsDateString()
    periodStart: string;
  
    @IsDateString()
    periodEnd: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
  }