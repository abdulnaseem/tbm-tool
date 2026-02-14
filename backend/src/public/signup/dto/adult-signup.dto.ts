// adult-signup.dto.ts
import {
    IsArray,
    IsDateString,
    IsEmail,
    IsEnum,
    IsString,
    MinLength,
    ArrayMinSize,
  } from 'class-validator';
import { Discipline } from '../../../common/enums/discipline.enum';
import { EmergencyContactDto } from './emergency-contact.dto';
  
export class AdultSignupDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsDateString()
    dateOfBirth: string; // validated later for age >= 18

    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(Discipline, { each: true })
    disciplines: Discipline[];

    emergencyContacts: EmergencyContactDto[];

    phone?: string;
    address?: string;

    paymentIntentId: string;
}  