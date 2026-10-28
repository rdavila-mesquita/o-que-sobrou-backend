import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import { EmailService } from '../email/email.service.js';
import type { Tx } from '../prisma/db.js';

@Injectable()
export class EmailVerificationService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {}

  async createVerification(userId: string, email: string) {
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
      throw new Error('APP_URL environment variable is not configured.');
    }

    const token = randomBytes(32).toString('hex');
    const hash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prismaService.db.orm.public.EmailVerificationToken.create({
      tokenHash: hash,
      userId,
      expiresAt,
    });

    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

    await this.emailService.sendAccountVerificationEmail({
      email,
      verificationUrl,
    });

    return { success: true };
  }

  async verifyEmail(token: string, tx: Tx) {
    const hash = this.hashToken(token);
    const currentDate = new Date();

    const existingToken = await tx.orm.public.EmailVerificationToken
      .where({
        tokenHash: hash,
      })
      .first();

    if (
      !existingToken ||
      existingToken.usedAt != null ||
      existingToken.expiresAt.getTime() <= currentDate.getTime()
    ) {
      throw new BadRequestException(
        'Invalid or expired email verification token.',
      );
    }

    const usedToken = await tx.orm.public.EmailVerificationToken
      .where({ id: existingToken.id })
      .where((verification) => verification.usedAt.isNull())
      .update({ usedAt: currentDate });

    if (!usedToken) {
      throw new BadRequestException(
        'Invalid or expired email verification token.',
      );
    }

    const verifiedEmail = await tx.orm.public.User
      .where({
        id: existingToken.userId,
      })
      .update({
        emailVerifiedAt: currentDate,
      });

    if (!verifiedEmail) {
      throw new BadRequestException(
        'Unable to verify email address.',
      );
    }

    return { success: true };
  }

  async resendVerification(email: string){
    const userEmail = email.trim().toLowerCase();

    if(!userEmail) throw new BadRequestException('Unable to verify email address.');

    const user = await this.prismaService.db.orm.public.User.where({
      email: userEmail
    }).first();

    if (!user || user.emailVerifiedAt != null) {
      return { success: true };
    }

    await this.prismaService.db.orm.public.EmailVerificationToken
      .where({ userId: user.id })
      .where((verification) => verification.usedAt.isNull())
      .update({ usedAt: new Date() });

    await this.createVerification(user.id, user.email);

    return { success: true }
  }

  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
