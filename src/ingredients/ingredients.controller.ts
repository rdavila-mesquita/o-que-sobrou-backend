import { Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { PaginationDTO } from './ingredients.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('ingredients')
@UseGuards(AuthGuard)
export class IngredientsController {
  constructor(
    @Inject(IngredientsService)
    private readonly ingredientsService: IngredientsService,
  ) {}

  @Get()
  async allIngredients(@Query() pagination: PaginationDTO) {
    return this.ingredientsService.allIngredients(
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  async findIngredientById(@Param('id') id:string) {
    return this.ingredientsService.findIngredientById(id);
  }

}
