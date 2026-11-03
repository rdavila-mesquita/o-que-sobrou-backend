import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IngredientsDTO } from './ingredients.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async allIngredients(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const ingredients = await this.prismaService.db.orm.public.Ingredient
      .select('id', 'name', 'slug', 'category', 'source')
      .orderBy((ingredient) => ingredient.name.asc())
      .offset(offset)
      .limit(limit)
      .all();

    return {
      ingredients,
      pagination: {
        page,
        limit,
        offset,
      },
    };
  }

  async findIngredients(data: IngredientsDTO) {
    const ingredients = await this.prismaService.db.orm.public.Ingredient
      .where({ name: data.name })
      .all();

    return { ingredients };
  }

  async findIngredientById(id: string) {
    const ingredient = await this.prismaService.db.orm.public.Ingredient
      .where({ id })
      .first();

    if (!ingredient) {
      throw new NotFoundException('Ingredient does not exist.');
    }

    return { ingredient };
  }
}
