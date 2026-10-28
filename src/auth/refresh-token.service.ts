import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { randomUUID, createHash } from 'node:crypto';
import { PrismaService } from '../prisma.service';
import type { Tx } from '../prisma/db';
import { jwtConstants } from './constants';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,

    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}


  async createSession(token: string, userId: string, tx: Tx) {
    const hash = this.hashToken(token);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    const newSession = await tx.orm.public.RefreshToken.create({
      tokenHash: hash,
      userId: userId,
      expiresAt: expiryDate
    });

    return newSession;
  }

  async saveSession(token: string, userId: string) {
  return this.prismaService.transaction(async (tx) => {
    return this.createSession(token, userId, tx);
  });
}

  async refresh(token: string) {
    const hash = this.hashToken(token);

    const existingSession = await this.prismaService.db.orm.public.RefreshToken.where({
      tokenHash: hash
    }).first();

    if(!existingSession) throw new UnauthorizedException();

    if(existingSession.revokedAt != null) throw new UnauthorizedException();

    const currentDate = new Date();
    if(existingSession.expiresAt.getTime() <= currentDate.getTime()) throw new UnauthorizedException();

    const user = await this.prismaService.db.orm.public.User.where({
      id: existingSession.userId
    }).first();

    if(!user) throw new UnauthorizedException("User does not exist");

    const accessToken = await this.jwtService.signAsync({
      id: existingSession.userId,
      name: user.name,
      email: user.email,
      type: 'access'
    }, {
      secret: jwtConstants.secret,
      expiresIn: "15m"
    });

    const refreshToken = randomUUID();

    await this.prismaService.transaction(async (tx) => {
      await this.revoke(token, tx);
      await this.createSession(refreshToken, existingSession.userId, tx);
    });

    return { accessToken, refreshToken }
  }

  async revoke(token: string, tx: Tx) {
    const hash = this.hashToken(token);

    const existingSession = await tx.orm.public.RefreshToken.where({
      tokenHash: hash
    }).first();

    if(!existingSession) throw new UnauthorizedException();
    if(existingSession.revokedAt != null) throw new UnauthorizedException();

    const revokedSession = await tx.orm.public.RefreshToken
    .where({ id: existingSession.id })
    .where((session) => session.revokedAt.isNull())
    .update({ revokedAt: new Date() });

    if(revokedSession == null) throw new UnauthorizedException();

    return revokedSession;
  }

  async revokeAllUserSessions(userId: string, tx: Tx) {
    return await tx.orm.public.RefreshToken
      .where({ userId })
      .where((session) => session.revokedAt.isNull())
      .updateAll({
        revokedAt: new Date(),
      });
  }

  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
