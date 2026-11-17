import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PantryService } from '../pantry/pantry.service';
import { GenerationRecipeDTO } from './recipe-genaration.dto';
import type { RecipeIngredientInput } from './recipe-generation.types';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { PrismaService } from '../prisma.service';
import { count } from 'rxjs';

@Injectable()
export class RecipeGenerationService {
  constructor(
    @Inject(HealthProfileService)
    private readonly healthService: HealthProfileService,
    @Inject(PantryService)
    private readonly pantryService: PantryService,
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ){}

  async createGenerationRequest(userId: string, context: Awaited<ReturnType<typeof this.getGenerationContext>>){
    if (!userId) throw new BadRequestException('User ID is required.');

    const inputIngredients = context.ingredients.map(
      ingredient => ingredient.name
    );

    const healthSnapshot = context.profile? {
      conditions: [...context.profile.conditions],
      allergens: [...context.profile.allergens],
      dietaryPreferences: [...context.profile.dietaryPreferences],
      dislikedIngredients: [...context.profile.dislikedIngredients],
      dailyCalorieTarget: context.profile.dailyCalorieTarget,
      notes: context.profile.notes,
    }
    : null;

    const newGenerationRequest = await this.prismaService.db.orm.public.GenerationRequest
    .create({
      userId,
      inputIngredients,
      healthSnapshot: healthSnapshot,
      generationOptions: context.options,
    });

    return { newGenerationRequest };
  }

  async generateRecipe(userId: string, data: GenerationRecipeDTO) {
    if (!userId) throw new BadRequestException('User ID is required.');

    const context = await this.getGenerationContext(userId, data);

    const generationRequest = await this.createGenerationRequest(userId, context);

    return {
      id: generationRequest.newGenerationRequest.id,
      status: generationRequest.newGenerationRequest.status,
    };
  }

  async getGeneratedRecipe(userId: string, generationId: string){
    if (!userId) throw new BadRequestException('User ID is required.');
    if (!generationId) throw new BadRequestException('Generation ID is required.');

    const generatedRecipe = await this.prismaService.db.orm.public
    .GenerationRequest.where({ userId, id: generationId }).first();

    if(!generatedRecipe) throw new NotFoundException('Generation request not found.');

    return {
      id: generatedRecipe?.id,
      status: generatedRecipe?.status
    };
  }

  async retryGenerationRequest(userId: string, generationId: string){
    if (!userId) throw new BadRequestException('User ID is required.');
    if (!generationId) throw new BadRequestException('Generation ID is required.');

    const generatedRecipe = await this.prismaService.db.orm.public
    .GenerationRequest.where({ userId, id: generationId }).first();

    if(!generatedRecipe) throw new NotFoundException('Generation request not found.');

    if(generatedRecipe.status !== 'FAILED') throw new BadRequestException('Only failed generation requests can be retried.');

    if(generatedRecipe.attempts >= 3) throw new BadRequestException('Maximum generation attempts reached.');

    const retry = await this.prismaService.db.orm.public.GenerationRequest
    .where({ userId, id: generationId })
    .where({ status: 'FAILED' })
    .where((session) => session.attempts.lt(3))
    .update({
      status: 'PENDING',
      errorMessage: null,
      finishedAt: null,
      model: null,
      promptTokens: null,
      completionTokens: null,
      validationReport: null
    });

    if(!retry) throw new BadRequestException('Generation request cannot be retried.');

    return { retry };
  }

  private mapPantryItems(items: Awaited<ReturnType<typeof this.pantryService.findItemsByIds>>['items']): RecipeIngredientInput[] {
    return items.map(item => {
      const name = item.ingredient?.name ?? item.customName;

      if(!name?.trim()){
        throw new BadRequestException(`Pantry item ${item.id} has no ingredient name.`,);
      }

      return {
        pantryItemId: item.id,
        ingredientId: item.ingredient?.id ?? null,
        name,
        quantity: item.quantity != null ? Number(item.quantity) : null,
        unit: item.unit,
        fromPantry: true
    }});
  }

  private mapCustomIngredients(ingredients: string[]): RecipeIngredientInput[] {
    return ingredients.map(ingredient => ({
      pantryItemId: null,
      ingredientId: null,
      name: ingredient,
      quantity: null,
      unit: null,
      fromPantry: true
    }));
  }

  private async getPantryItems(pantryItemIds: string[], userId: string){
    const existingIngredients = await this.pantryService.findItemsByIds(pantryItemIds, userId);

    return existingIngredients.items;
  }

  private async getGenerationContext(userId: string, data: GenerationRecipeDTO){
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    const pantryItems = data.pantryItemIds?.length
      ? await this.getPantryItems(data.pantryItemIds, userId)
      : [];

    const customIngredients = data.customIngredients?.map(
      ingredient => ingredient.trim(),
    ) ?? [];

    const ingredients = [
      ...this.mapPantryItems(pantryItems),
      ...this.mapCustomIngredients(customIngredients),
    ];

    const { profile } = await this.healthService.getHealthProfile(userId);

    const options = {
      ...(data.mealType !== undefined && { mealType: data.mealType }),
      ...(data.servings !== undefined && { servings: data.servings }),
      ...(data.maxPreparationTime !== undefined && {
        maxPreparationTime: data.maxPreparationTime,
      }),
      ...(data.healthy !== undefined && { healthy: data.healthy }),
    };

    return { ingredients, profile, options };
  }
}
