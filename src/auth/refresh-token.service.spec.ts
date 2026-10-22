import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma.service';
import { RefreshTokenService } from './refresh-token.service';

// Mock genérico compatível com Jest 30.
type AnyMock = jest.Mock<(...args: any[]) => any>;

type QueryMock = AnyMock;

type TransactionMock = {
  orm: {
    public: {
      RefreshToken: {
        create: AnyMock;
        where: QueryMock;
      };
    };
  };
};

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let module: TestingModule;

  let prismaMock: {
    db: {
      orm: {
        public: {
          User: {
            where: QueryMock;
          };
          RefreshToken: {
            where: QueryMock;
          };
        };
      };
    };
    transaction: AnyMock;
  };

  let jwtMock: {
    signAsync: AnyMock;
  };

  let tx: TransactionMock;

  beforeEach(async () => {
    tx = {
      orm: {
        public: {
          RefreshToken: {
            create: jest.fn(),
            where: jest.fn(),
          },
        },
      },
    };

    prismaMock = {
      db: {
        orm: {
          public: {
            User: {
              where: jest.fn(),
            },
            RefreshToken: {
              where: jest.fn(),
            },
          },
        },
      },

      transaction: jest.fn(
        async (callback: (transaction: TransactionMock) => Promise<any>) =>
          callback(tx),
      ),
    };

    jwtMock = {
      signAsync: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('createSession', () => {
    it('deve criar uma sessão utilizando o contexto da transação', async () => {
      tx.orm.public.RefreshToken.create.mockResolvedValue({});

      await service.createSession('refresh-token', 'user-1', tx as any);

      expect(tx.orm.public.RefreshToken.create).toHaveBeenCalledTimes(1);

      const payload = tx.orm.public.RefreshToken.create.mock.calls[0][0] as {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
      };

      expect(payload.userId).toBe('user-1');
      expect(payload.tokenHash).not.toBe('refresh-token');
      expect(payload.tokenHash).toHaveLength(64);
      expect(payload.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('revoke', () => {
    it('deve revogar uma sessão ativa', async () => {
      const session = {
        id: 'session-1',
        revokedAt: null,
      };

      const updatedSession = {
        ...session,
        revokedAt: new Date(),
      };

      const update = jest.fn<() => Promise<typeof updatedSession>>()
        .mockResolvedValue(updatedSession);

      tx.orm.public.RefreshToken.where
        .mockReturnValueOnce({
          first: jest.fn<() => Promise<typeof session>>()
            .mockResolvedValue(session),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnValue({
            update,
          }),
        });

      const result = await service.revoke('refresh-token', tx as any);

      expect(update).toHaveBeenCalledTimes(1);
      expect(result.revokedAt).toBeInstanceOf(Date);
    });

    it('deve lançar exceção quando a sessão não existir', async () => {
      tx.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      });

      await expect(
        service.revoke('token-inexistente', tx as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar exceção quando a sessão já estiver revogada', async () => {
      const session = {
        id: 'session-1',
        revokedAt: new Date(),
      };

      tx.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      await expect(
        service.revoke('token', tx as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('deve gerar novos tokens quando o refresh token for válido', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      };

      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      prismaMock.db.orm.public.User.where.mockReturnValue({
        first: jest.fn<() => Promise<{
          id: string;
          name: string;
          email: string;
        }>>().mockResolvedValue({
          id: 'user-1',
          name: 'Davila',
          email: 'davila@email.com',
        }),
      });

      jwtMock.signAsync.mockResolvedValue('access-token');

      const revokeSpy = jest
        .spyOn(service, 'revoke')
        .mockResolvedValue({} as any);

      const createSessionSpy = jest
        .spyOn(service, 'createSession')
        .mockResolvedValue({
          id: 'session-2',
          userId: 'user-1',
          tokenHash: 'a'.repeat(64),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          revokedAt: null,
          userAgent: null,
        });

      const result = await service.refresh('refresh-token');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe('refresh-token');

      expect(revokeSpy).toHaveBeenCalledTimes(1);
      expect(createSessionSpy).toHaveBeenCalledTimes(1);
      expect(prismaMock.transaction).toHaveBeenCalledTimes(1);
    });

    it('deve lançar exceção quando o refresh token não existir', async () => {
      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar exceção quando o token estiver revogado', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
      };

      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar exceção quando o token estiver expirado', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 10_000),
      };

      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar exceção quando o usuário não existir', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
      };

      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      prismaMock.db.orm.public.User.where.mockReturnValue({
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve executar revoke e createSession dentro da mesma transação', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
      };

      prismaMock.db.orm.public.RefreshToken.where.mockReturnValue({
        first: jest.fn<() => Promise<typeof session>>()
          .mockResolvedValue(session),
      });

      prismaMock.db.orm.public.User.where.mockReturnValue({
        first: jest.fn<() => Promise<{
          id: string;
          name: string;
          email: string;
        }>>().mockResolvedValue({
          id: 'user-1',
          name: 'Davila',
          email: 'davila@email.com',
        }),
      });

      jwtMock.signAsync.mockResolvedValue('access-token');

      const revokeSpy = jest
        .spyOn(service, 'revoke')
        .mockResolvedValue({} as any);

      const createSessionSpy = jest
        .spyOn(service, 'createSession')
        .mockResolvedValue({
          id: 'session-2',
          userId: 'user-1',
          tokenHash: 'a'.repeat(64),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          revokedAt: null,
          userAgent: null,
        });

      await service.refresh('refresh-token');

      expect(prismaMock.transaction).toHaveBeenCalledTimes(1);
      expect(revokeSpy).toHaveBeenCalledTimes(1);
      expect(createSessionSpy).toHaveBeenCalledTimes(1);

      // revoke(token, tx): o contexto transacional é o segundo argumento.
      expect(revokeSpy.mock.calls[0][1]).toBe(tx);

      // createSession(token, userId, tx): tx é o terceiro argumento.
      expect(createSessionSpy.mock.calls[0][2]).toBe(tx);
    });
  });
});
