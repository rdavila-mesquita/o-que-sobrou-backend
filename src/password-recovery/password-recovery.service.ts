import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { hash } from 'argon2';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { RefreshTokenService } from '../auth/refresh-token.service';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async requestPasswordReset(email: string) {
    const userEmail = email.trim().toLowerCase();

    if (!userEmail) {
      throw new BadRequestException('Unable to verify email address.');
    }

    const appUrl = process.env.APP_URL;

    if (!appUrl) {
      throw new Error('APP_URL environment variable is not configured.');
    }

    const user = await this.prismaService.db.orm.public.User
      .where({ email: userEmail })
      .first();

    if (!user || user.emailVerifiedAt == null) {
      return { success: true };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prismaService.db.orm.public.PasswordResetToken
      .where({ userId: user.id })
      .where((resetToken) => resetToken.usedAt.isNull())
      .where((resetToken) => resetToken.revokedAt.isNull())
      .updateAll({
        revokedAt: new Date(),
      });

    await this.prismaService.db.orm.public.PasswordResetToken.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    const resetUrl =
      `${appUrl}/auth/reset-password?token=${token}`;

    try {
      await this.emailService.sendPasswordResetEmail({
        email: userEmail,
        resetUrl,
      });

      return { success: true };
    } catch (emailError) {
      try {
        await this.prismaService.db.orm.public.PasswordResetToken
          .where({ tokenHash })
          .where((resetToken) => resetToken.revokedAt.isNull())
          .update({ revokedAt: new Date() });
      } catch (revokeError) {
        throw new AggregateError(
          [emailError, revokeError],
          'Failed to send password reset email and revoke the reset token.',
        );
      }

      throw emailError;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const invalidTokenMessage = 'Invalid or expired password reset token.';

    if (!token || !newPassword) {
      throw new BadRequestException(invalidTokenMessage);
    }

    const tokenHash = this.hashToken(token);

    const existingToken =
      await this.prismaService.db.orm.public.PasswordResetToken
        .where({ tokenHash })
        .first();

    if (
      !existingToken ||
      existingToken.usedAt != null ||
      existingToken.revokedAt != null ||
      existingToken.expiresAt <= new Date()
    ) {
      throw new BadRequestException(invalidTokenMessage);
    }

    const passwordHash = await hash(newPassword);

    try {
      await this.prismaService.transaction(async (tx) => {
        const currentDate = new Date();

        // Consumir o token somente se ele continuar válido.
        await tx.orm.public.PasswordResetToken
          .where({ id: existingToken.id })
          .where((resetToken) => resetToken.usedAt.isNull())
          .where((resetToken) => resetToken.revokedAt.isNull())
          .where((resetToken) => resetToken.expiresAt.gt(currentDate))
          .update({ usedAt: currentDate });

        // Atualizar a senha dentro da mesma transação.
        await tx.orm.public.User
          .where({ id: existingToken.userId })
          .update({ passwordHash });

        // Revogar todas as sessões ativas dentro da mesma transação.
        await this.refreshTokenService.revokeAllUserSessions(
          existingToken.userId,
          tx,
        );
      });
    } catch {
      throw new BadRequestException(invalidTokenMessage);
    }

    return { success: true };
  }

  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
