import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { RecipesController } from './recipes.controller.js';

@Module({
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
