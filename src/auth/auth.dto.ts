import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
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

export class ResendVerificationDTO{
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ForgotPasswordDTO{
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDTO{
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password!: string;
}
