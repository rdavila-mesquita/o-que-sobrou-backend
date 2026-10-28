import { Module } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service.js';
import { EmailService } from '../email/email.service.js';
import { RefreshTokenService } from '../auth/refresh-token.service.js';

@Module({
  providers: [PasswordRecoveryService, EmailService, RefreshTokenService],
})
export class PasswordRecoveryModule {}
