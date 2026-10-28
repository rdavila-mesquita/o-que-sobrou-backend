import { ConflictException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "argon2";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma.service";
import { RefreshTokenDTO, ResendVerificationDTO, SignInDTO, SignUpDTO } from "./auth.dto";
import { jwtConstants } from "./constants";
import { RefreshTokenService } from "./refresh-token.service";
import { EmailVerificationService } from "../email-verification/email-verification.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(RefreshTokenService) private readonly refreshTokenService: RefreshTokenService,
    @Inject(EmailVerificationService) private readonly emailVerification: EmailVerificationService,
    private readonly logger = new Logger(AuthService.name)
  ) {}

  async signup(data: SignUpDTO) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.prismaService.db.orm.public.User.where({
      email,
    }).first();

    if (existingUser) {
      throw new ConflictException('Email address already exists.');
    }

    const passwordHash = await hash(data.password);

    const user = await this.prismaService.db.orm.public.User.create({
      name: data.name,
      email,
      passwordHash,
    });

    try {
      await this.emailVerification.createVerification(user.id, user.email);
    } catch (error) {
      this.logger.error(
        'Account created, but email verification could not be initiated.',
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { id: user.id, name: user.name, email: user.email, message: 'Account created successfully. Please verify your email address.' };
  }

  async signin(data: SignInDTO){
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.prismaService.db.orm.public.User.where({
      email,
    }).first();

    if (!existingUser){
      throw new UnauthorizedException("Invalid credentials.")
    }

    const passwordMatch = await verify(existingUser.passwordHash, data.password);

    if (!passwordMatch){
      throw new UnauthorizedException("Invalid credentials.")
    }

    if(!existingUser.emailVerifiedAt) throw new UnauthorizedException('Email address not verified.');

    const accessToken = await this.jwtService.signAsync({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      type: 'access'
    }, {
      secret: jwtConstants.secret,
      expiresIn: "15m"
    })

    const refreshToken = randomUUID();

    await this.refreshTokenService.saveSession(refreshToken, existingUser.id);

    return { accessToken, refreshToken };
  }

  async resendVerification(data: ResendVerificationDTO){
    await this.emailVerification.resendVerification(data.email);

    return {
      success: true,
      message: 'If the address requires verification, you will receive an email with instructions.',
    }
  }

  async refreshToken(data: RefreshTokenDTO){
    const refresh = await this.refreshTokenService.refresh(data.refreshToken);

    return refresh;
  }
}
