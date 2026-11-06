import { Controller, Get, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@UseGuards(AuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}
  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    const userId = request.user!.id;

    return this.recipesService.findAllRecipes(userId);
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    const userId = request.user!.id;

    return this.recipesService.findRecipeById(userId, id);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    const userId = request.user!.id;

    return this.recipesService.removeRecipe(userId, id);
  }
}
