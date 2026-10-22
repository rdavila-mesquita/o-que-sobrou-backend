import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "argon2";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma.service";
import { SignInDTO, SignUpDTO } from "./auth.dto";
import { jwtConstants } from "./constants";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService
  ) {}

  async signup(data: SignUpDTO) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.prismaService.db.orm.public.User.where({
      email,
    }).first();

    if (existingUser) {
      throw new ConflictException("E-mail already exists");
    }

    const passwordHash = await hash(data.password);

    const user = await this.prismaService.db.orm.public.User.create({
      name: data.name,
      email,
      passwordHash,
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async signin(data: SignInDTO){
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.prismaService.db.orm.public.User.where({
      email,
    }).first();

    if (!existingUser){
      throw new UnauthorizedException("Invalid credentials")
    }

    const passwordMatch = await verify(existingUser.passwordHash, data.password);

    if (!passwordMatch){
      throw new UnauthorizedException("Invalid credentials")
    }

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

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token: string){

  }
}
