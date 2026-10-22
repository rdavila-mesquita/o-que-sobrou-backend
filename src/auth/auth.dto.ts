import type { Timestamp } from '@prisma/orm-postgres/target/codec-types';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class SignInDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDTO{
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
