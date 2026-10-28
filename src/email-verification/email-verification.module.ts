import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [EmailModule],
  providers: [EmailVerificationService],
})
export class EmailVerificationModule {}
