import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'viewer@example.com' }) @IsEmail() @MaxLength(320) email!: string;
  @ApiProperty({ example: 'Ada Viewer' }) @IsString() @Length(2, 100) displayName!: string;
  @ApiProperty({ minLength: 10, format: 'password' })
  @IsString()
  @Length(10, 128)
  @Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/[0-9]/, { message: 'password must contain a number' })
  password!: string;
}
