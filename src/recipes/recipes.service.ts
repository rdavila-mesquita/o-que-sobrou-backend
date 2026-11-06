import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecipesService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async findAllRecipes(userId: string) {
    if(!userId) throw new BadRequestException('User not informed.');

    const allRecipes = await this.prismaService.db.orm.public.Recipe.where({ userId }).all();

    return { allRecipes };
  }

  async findRecipeById(userId:string, id: string) {
    if(!id) throw new BadRequestException('Recipe ID is required.');

    if(!userId) throw new BadRequestException('User ID is required.');

    const recipe = await this.prismaService.db.orm.public.Recipe.where({ userId, id }).first();

    if(!recipe) throw new NotFoundException('Recipe not found.');

    return { recipe };
  }

  async removeRecipe(userId:string, id: string) {
    if(!userId) throw new BadRequestException('User ID is required.');

    await this.findRecipeById(userId, id);

    await this.prismaService.db.orm.public.Recipe
    .where({ userId, id })
    .delete()

    return { message: 'Recipe deleted successfully!' }
  }
}
