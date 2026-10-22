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

  /**
   * Cria uma sessão para o usuário.
   */
  async createSession(token: string, userId: string, tx: Tx) {
    // 1. Calcular o hash do token.
    const hash = this.hashToken(token);

    // 2. Definir a data de expiração.
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    // 3. Persistir a sessão no banco.
    const newSession = await tx.orm.public.RefreshToken.create({
      tokenHash: hash,
      userId: userId,
      expiresAt: expiryDate
    });

    return newSession;
  }

  /**
   * Valida o refresh token e renova os tokens.
   */
  async refresh(token: string) {
    // 1. Calcular o hash do token recebido.
    const hash = this.hashToken(token);

    // 2. Procurar a sessão correspondente no banco.
    const existingSession = await this.prismaService.db.orm.public.RefreshToken.where({
      tokenHash: hash
    }).first();

    // 3. Verificar se a sessão existe.
    if(!existingSession) throw new UnauthorizedException();

    // 4. Verificar se a sessão foi revogada.
    if(existingSession.revokedAt != null) throw new UnauthorizedException();

    // 5. Verificar se a sessão expirou.
    const currentDate = new Date();
    if(existingSession.expiresAt.getTime() <= currentDate.getTime()) throw new UnauthorizedException();

    // 6. Gerar um novo access token.
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
    })

    const refreshToken = randomUUID();

    // 7. Rotacionar o refresh token.
    await this.prismaService.transaction(async (tx) => {
      await this.revoke(token, tx);
      await this.createSession(refreshToken, existingSession.userId, tx);
    })

    // 8. Retornar os novos tokens.
    return { accessToken, refreshToken }
  }

  /**
   * Revoga uma sessão.
   */
  async revoke(token: string, tx: Tx) {
    // 1. Calcular o hash do token recebido.
    const hash = this.hashToken(token);

    // 2. Localizar a sessão.
    const existingSession = await tx.orm.public.RefreshToken.where({
      tokenHash: hash
    }).first();

    // 3. Verificar se ela pode ser revogada.
    if(!existingSession) throw new UnauthorizedException();
    if(existingSession.revokedAt != null) throw new UnauthorizedException();

    // 4. Registrar a revogação.
    const revokedSession = await tx.orm.public.RefreshToken
    .where({ id: existingSession.id })
    .where((session) => session.revokedAt.isNull())
    .update({ revokedAt: new Date() });

    if(revokedSession == null) throw new UnauthorizedException();

    return revokedSession;
  }

  /**
   * Calcula o hash SHA-256 de um token.
   */
  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
