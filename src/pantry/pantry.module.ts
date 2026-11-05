import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service.js';
import { PantryController } from './pantry.controller.js';
import { PrismaModule } from '../prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PantryController],
  providers: [PantryService],
})
export class PantryModule {}
