// backend/src/public/signup/dto/emergency-contact.dto.ts
import { IsString } from 'class-validator';

export class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  relationship: string;
}