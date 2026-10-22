import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { AuthController } from './auth.controller.js';
import { jwtConstants } from './constants.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [JwtModule.register({
    global:  true,
    secret: jwtConstants.secret,
  })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService]
})
export class AuthModule {}
