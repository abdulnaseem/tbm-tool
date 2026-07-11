// backend/src/users/dto/update-user-password.dto.ts
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}