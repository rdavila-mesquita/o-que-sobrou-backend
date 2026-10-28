import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import { AuthGuard } from '../common/guards/auth.guard';
import { Public } from '../common/decorators/public.decorator';

import type { AuthenticatedRequest } from './types/authenticated-request';

import {
  ForgotPasswordDTO,
  RefreshTokenDTO,
  ResendVerificationDTO,
  ResetPasswordDTO,
  SignInDTO,
  SignUpDTO,
} from './auth.dto';

import { AuthService } from './auth.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { PrismaService } from '../prisma.service';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,

    @Inject(EmailVerificationService)
    private readonly emailVerificationService: EmailVerificationService,

    @Inject(PrismaService)
    private readonly prismaService: PrismaService,

    @Inject(PasswordRecoveryService)
    private readonly passwordRecovery: PasswordRecoveryService,
  ) {}

  @Public()
  @Post('signup')
  @UsePipes(new ValidationPipe({
    expectedType: SignUpDTO,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  async signup(@Body() body: SignUpDTO) {
    return this.authService.signup(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() body: SignInDTO) {
    return this.authService.signin(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Verification token is required.');
    }

    await this.prismaService.transaction(async (tx) => {
      await this.emailVerificationService.verifyEmail(token, tx);
    });

    return {
      success: true,
      message: 'Email address verified successfully.',
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Body() body: ResendVerificationDTO) {
    await this.emailVerificationService.resendVerification(body.email);

    return {
      success: true,
      message: 'If the account requires verification, an email will be sent.',
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDTO) {
    return this.authService.refreshToken(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    await this.passwordRecovery.requestPasswordReset(body.email);

    return {
      success: true,
      message: 'If the account exists and is eligible, password reset instructions will be sent.',
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @UsePipes(new ValidationPipe({
    expectedType: ResetPasswordDTO,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  async resetPassword(@Body() body: ResetPasswordDTO) {
    await this.passwordRecovery.resetPassword(body.token, body.password);

    return {
      success: true,
      message: 'Password reset successfully.',
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
