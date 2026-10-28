import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from "./prisma.module.js";
import { EmailModule } from './email/email.module.js';
import { EmailVerificationModule } from "./email-verification/email-verification.module.js";
import { PasswordRecoveryModule } from './password-recovery/password-recovery.module.js';

@Module({
  imports: [AuthModule, PrismaModule, EmailVerificationModule, EmailModule, PasswordRecoveryModule],
  controllers: [],
  providers: []
})


export class AppModule {}
