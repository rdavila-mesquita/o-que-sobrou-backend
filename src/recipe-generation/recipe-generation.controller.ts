import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RecipeGenerationService } from './recipe-generation.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { GenerationRecipeDTO } from './recipe-genaration.dto.js';

@UseGuards(AuthGuard)
@Controller('recipe-generation')
export class RecipeGenerationController {
  constructor(private readonly recipeGenerationService: RecipeGenerationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async requestGeneration(@Req() request: AuthenticatedRequest, @Body() body: GenerationRecipeDTO){
    const userId = request.user!.id;

    return this.recipeGenerationService.generateRecipe(userId, body);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGeneratedRecipe(@Req() request: AuthenticatedRequest, @Param('id') id: string){
    const userId = request.user!.id;

    return this.recipeGenerationService.getGeneratedRecipe(userId, id);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryGeneration(@Req() request: AuthenticatedRequest, @Param('id') id: string){
    const userId = request.user!.id;

    return this.recipeGenerationService.retryGenerationRequest(userId, id)
  }
}
