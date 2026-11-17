import { Module } from '@nestjs/common';
import { RecipeGenerationService } from './recipe-generation.service.js';
import { RecipeGenerationController } from './recipe-generation.controller.js';
import { HealthProfileModule } from '../health-profile/health-profile.module.js';
import { PantryModule } from '../pantry/pantry.module.js';
import { PrismaModule } from '../prisma.module.js';

@Module({
  imports: [HealthProfileModule, PantryModule, PrismaModule,],
  controllers: [RecipeGenerationController],
  providers: [RecipeGenerationService],
})
export class RecipeGenerationModule {}
