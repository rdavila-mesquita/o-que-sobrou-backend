import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { IngredientsController } from './ingredients.controller.js';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
