// backend/src/users/dto/create-user.dto.ts
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  import { UserRole } from '../enums/user-role.enum';
  
  export class CreateUserDto {
    @IsEmail()
    @MaxLength(254)
    email: string;
  
    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password: string;
  
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }