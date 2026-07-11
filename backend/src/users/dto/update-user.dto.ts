// backend/src/users/dto/update-user.dto.ts
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    MaxLength,
  } from 'class-validator';
  import { UserRole } from '../enums/user-role.enum';
  
  export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    @MaxLength(254)
    email?: string;
  
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }