import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { AuthController } from './auth.controller.js';
import { jwtConstants } from './constants.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { EmailVerificationService } from '../email-verification/email-verification.service.js';
import { EmailModule } from '../email/email.module.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service.js';

@Module({
  imports: [JwtModule.register({
    global:  true,
    secret: jwtConstants.secret,
  }), EmailModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RefreshTokenService, EmailVerificationService, AuthGuard, PasswordRecoveryService]
})
export class AuthModule {}
