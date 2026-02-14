// guardian-signup.dto.ts
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
  
export class GuardianSignupDto {
    // Guardian user
    @IsEmail()
    email: string;
  
    @MinLength(8)
    password: string;
  
    @IsString()
    guardianFirstName: string;
  
    @IsString()
    guardianLastName: string;
  
    guardianPhone?: string;
    guardianAddress?: string;
  
    relationship: string; // mother, father, carer
  
    // Child
    @IsString()
    childFirstName: string;
  
    @IsString()
    childLastName: string;
  
    @IsDateString()
    childDateOfBirth: string; // validated 5–17
  
    emergencyContacts: EmergencyContactDto[];
  
    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(Discipline, { each: true })
    disciplines: Discipline[];
  
    paymentIntentId: string;
}  