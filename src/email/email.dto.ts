import { IsEmail, IsNotEmpty, IsUrl } from "class-validator";

export class EmailDTO{
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  verificationUrl!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class PasswordResetDTO{
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  resetUrl!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
