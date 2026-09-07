import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail() @MaxLength(320) email!: string;
  @ApiProperty({ format: 'password' }) @IsString() password!: string;
}
