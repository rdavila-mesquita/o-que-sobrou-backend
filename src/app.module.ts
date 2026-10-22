import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from "./prisma.module.js";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [],
  providers: []
})


export class AppModule {}
