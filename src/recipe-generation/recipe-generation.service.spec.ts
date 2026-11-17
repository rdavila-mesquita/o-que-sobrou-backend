import { BadRequestException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { RecipeGenerationService } from './recipe-generation.service.js';
import type { PrismaService } from '../prisma.service';
import type { PantryService } from '../pantry/pantry.service';
import type { HealthProfileService } from '../health-profile/health-profile.service';

describe('RecipeGenerationService', () => {
  let service: RecipeGenerationService;
  let prismaService: any;
  let pantryService: any;
  let healthProfileService: any;

  let generationRequestQuery: any;
  let generationRequestModel: any;

  const userId = 'user-123';
  const generationId = 'generation-123';

  const mockGenerationRequest = {
    id: generationId,
    userId,
    status: 'FAILED',
    attempts: 1,
    errorMessage: 'Generation failed',
    finishedAt: new Date(),
    model: 'test-model',
    promptTokens: 100,
    completionTokens: 200,
    validationReport: { valid: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    generationRequestQuery = {
      where: jest.fn(),
      first: jest.fn(),
      update: jest.fn(),
    };

    generationRequestQuery.where.mockReturnValue(generationRequestQuery);

    generationRequestModel = {
      where: jest.fn().mockReturnValue(generationRequestQuery),
      create: jest.fn()
    };

    prismaService = {
      db: {
        orm: {
          public: {
            GenerationRequest: generationRequestModel,
          },
        },
      },
    };

    pantryService = {
      findItemsByIds: jest.fn(),
    };

    healthProfileService = {
      getHealthProfile: jest.fn(),
    };

    service = new RecipeGenerationService(
      healthProfileService as HealthProfileService,
      pantryService as PantryService,
      prismaService as PrismaService,
    );
  });

  describe('retryGenerationRequest', () => {
    it('should retry a failed generation request', async () => {
      const updatedRequest = {
        ...mockGenerationRequest,
        status: 'PENDING',
        errorMessage: null,
        finishedAt: null,
        model: null,
        promptTokens: null,
        completionTokens: null,
        validationReport: null,
      };

      generationRequestQuery.first.mockResolvedValue(
        mockGenerationRequest,
      );

      generationRequestQuery.update.mockResolvedValue(
        updatedRequest,
      );

      const result = await service.retryGenerationRequest(
        userId,
        generationId,
      );

      expect(generationRequestModel.where).toHaveBeenCalledWith({
        userId,
        id: generationId,
      });

      expect(generationRequestQuery.update).toHaveBeenCalledWith({
        status: 'PENDING',
        errorMessage: null,
        finishedAt: null,
        model: null,
        promptTokens: null,
        completionTokens: null,
        validationReport: null,
      });

      expect(result).toEqual({
        retry: updatedRequest,
      });
    });

    it('should reject when userId is empty', async () => {
      await expect(
        service.retryGenerationRequest('', generationId)
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.where).not.toHaveBeenCalled();
    });

    it('should reject when generationId is empty', async () => {
      await expect(
        service.retryGenerationRequest(userId, '')
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.where).not.toHaveBeenCalled();
    });

    it('should reject when generation request does not exist', async () => {
      generationRequestQuery.first.mockResolvedValue(null);

      await expect(
        service.retryGenerationRequest(userId, generationId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when generation request status is not FAILED', async () => {
      generationRequestQuery.first.mockResolvedValue({
        ...mockGenerationRequest,
        status: 'PENDING',
      });

      await expect(
        service.retryGenerationRequest(userId, generationId)
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestQuery.update).not.toHaveBeenCalled();
    });

    it('should reject when maximum attempts have been reached', async () => {
      generationRequestQuery.first.mockResolvedValue({
        ...mockGenerationRequest,
        attempts: 3,
      });

      await expect(
        service.retryGenerationRequest(userId, generationId)
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestQuery.update).not.toHaveBeenCalled();
    });

    it('should reject when conditional update fails', async () => {
      generationRequestQuery.first.mockResolvedValue(
        mockGenerationRequest,
      );

      generationRequestQuery.update.mockResolvedValue(null);

      await expect(
        service.retryGenerationRequest(userId, generationId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getGeneratedRecipe', () => {
    it('should return generation request id and status', async () => {
      generationRequestQuery.first.mockResolvedValue({
        ...mockGenerationRequest,
        status: 'SUCCEEDED',
      });

      const result = await service.getGeneratedRecipe(
        userId,
        generationId,
      );

      expect(generationRequestModel.where).toHaveBeenCalledWith({
        userId,
        id: generationId,
      });

      expect(generationRequestQuery.first).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        id: generationId,
        status: 'SUCCEEDED',
      });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      generationRequestQuery.first.mockResolvedValue(null);

      await expect(
        service.getGeneratedRecipe(userId, generationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when userId is empty', async () => {
      await expect(
        service.getGeneratedRecipe('', generationId),
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.where).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when generationId is empty', async () => {
      await expect(
        service.getGeneratedRecipe(userId, ''),
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.where).not.toHaveBeenCalled();
    });
  });

  describe('generateRecipe', () => {
    it('should create a generation request with pantry ingredients and health profile', async () => {
      const pantryItem = {
        id: 'pantry-item-123',
        ingredientId: 'ingredient-123',
        customName: null,
        quantity: '2.00',
        unit: 'KG',
        ingredient: {
          id: 'ingredient-123',
          name: 'Arroz',
        },
      };

      const profile = {
        conditions: ['DIABETES_TIPO_2'],
        allergens: ['LACTOSE'],
        dietaryPreferences: ['LOW_CARB'],
        dislikedIngredients: ['Cebola'],
        dailyCalorieTarget: 2000,
        notes: 'Evitar alimentos muito condimentados.',
      };

      const data = {
        pantryItemIds: ['pantry-item-123'],
        mealType: 'ALMOCO',
        servings: 2,
        maxPreparationTime: 30,
        healthy: false,
      } as any;

      const createdRequest = {
        id: generationId,
        status: 'PENDING',
      };

      pantryService.findItemsByIds.mockResolvedValue({
        items: [pantryItem],
      });

      healthProfileService.getHealthProfile.mockResolvedValue({
        profile,
      });

      generationRequestModel.create.mockResolvedValue(createdRequest);

      const result = await service.generateRecipe(userId, data);

      expect(pantryService.findItemsByIds).toHaveBeenCalledWith(
        ['pantry-item-123'],
        userId,
      );

      expect(healthProfileService.getHealthProfile).toHaveBeenCalledWith(
        userId,
      );

      expect(generationRequestModel.create).toHaveBeenCalledWith({
        userId,
        inputIngredients: ['Arroz'],
        healthSnapshot: {
          conditions: ['DIABETES_TIPO_2'],
          allergens: ['LACTOSE'],
          dietaryPreferences: ['LOW_CARB'],
          dislikedIngredients: ['Cebola'],
          dailyCalorieTarget: 2000,
          notes: 'Evitar alimentos muito condimentados.',
        },
        generationOptions: {
          mealType: 'ALMOCO',
          servings: 2,
          maxPreparationTime: 30,
          healthy: false,
        },
      });

      expect(result).toEqual({
        id: generationId,
        status: 'PENDING',
      });
    });

    it('should create a generation request with custom ingredients', async () => {
      const data = {
        customIngredients: ['  Tomate  ', '  Queijo  '],
      } as any;

      const createdRequest = {
        id: generationId,
        status: 'PENDING',
      };

      healthProfileService.getHealthProfile.mockResolvedValue({
        profile: null,
      });

      generationRequestModel.create.mockResolvedValue(createdRequest);

      const result = await service.generateRecipe(userId, data);

      expect(pantryService.findItemsByIds).not.toHaveBeenCalled();

      expect(healthProfileService.getHealthProfile).toHaveBeenCalledWith(
        userId,
      );

      expect(generationRequestModel.create).toHaveBeenCalledWith({
        userId,
        inputIngredients: ['Tomate', 'Queijo'],
        healthSnapshot: null,
        generationOptions: {},
      });

      expect(result).toEqual({
        id: generationId,
        status: 'PENDING',
      });
    });

    it('should reject when userId is empty', async () => {
      await expect(
        service.generateRecipe('', {} as any),
      ).rejects.toThrow(BadRequestException);

      expect(healthProfileService.getHealthProfile).not.toHaveBeenCalled();
      expect(generationRequestModel.create).not.toHaveBeenCalled();
    });

    it('should reject when a pantry item has no ingredient name', async () => {
      pantryService.findItemsByIds.mockResolvedValue({
        items: [
          {
            id: 'pantry-item-123',
            ingredientId: null,
            customName: '   ',
            quantity: '2.00',
            unit: 'KG',
            ingredient: null,
          },
        ],
      });

      await expect(
        service.generateRecipe(
          userId,
          { pantryItemIds: ['pantry-item-123'] } as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.create).not.toHaveBeenCalled();
    });

    it('should reject when pantry items cannot be found', async () => {
      pantryService.findItemsByIds.mockRejectedValue(
        new BadRequestException(
          'One or more pantry items were not found or do not belong to this user.',
        ),
      );

      await expect(
        service.generateRecipe(
          userId,
          { pantryItemIds: ['invalid-item'] } as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(healthProfileService.getHealthProfile).not.toHaveBeenCalled();
      expect(generationRequestModel.create).not.toHaveBeenCalled();
    });

    it('should propagate errors when generation request creation fails', async () => {
      healthProfileService.getHealthProfile.mockResolvedValue({
        profile: null,
      });

      generationRequestModel.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.generateRecipe(
          userId,
          { customIngredients: ['Tomate'] } as any,
        ),
      ).rejects.toThrow('Database error');
    });
  });

  describe('createGenerationRequest', () => {
    it('should create a generation request with health profile and ingredients', async () => {
      const context = {
        ingredients: [
          { name: 'Arroz' },
          { name: 'Feijão' },
        ],
        profile: {
          conditions: ['DIABETES_TIPO_2'],
          allergens: ['LACTOSE'],
          dietaryPreferences: ['LOW_CARB'],
          dislikedIngredients: ['Cebola'],
          dailyCalorieTarget: 2000,
          notes: 'Evitar alimentos condimentados.',
        },
        options: {
          mealType: 'ALMOCO',
          servings: 2,
        },
      };

      const createdRequest = {
        id: generationId,
        status: 'PENDING',
      };

      generationRequestModel.create.mockResolvedValue(createdRequest);

      const result = await service.createGenerationRequest(
        userId,
        context as any,
      );

      expect(generationRequestModel.create).toHaveBeenCalledWith({
        userId,
        inputIngredients: ['Arroz', 'Feijão'],
        healthSnapshot: {
          conditions: ['DIABETES_TIPO_2'],
          allergens: ['LACTOSE'],
          dietaryPreferences: ['LOW_CARB'],
          dislikedIngredients: ['Cebola'],
          dailyCalorieTarget: 2000,
          notes: 'Evitar alimentos condimentados.',
        },
        generationOptions: context.options,
      });

      expect(result).toEqual({
        newGenerationRequest: createdRequest,
      });
    });

    it('should create a generation request without health profile', async () => {
      const context = {
        ingredients: [{ name: 'Tomate' }],
        profile: null,
        options: {},
      };

      generationRequestModel.create.mockResolvedValue({
        id: generationId,
        status: 'PENDING',
      });

      await service.createGenerationRequest(userId, context as any);

      expect(generationRequestModel.create).toHaveBeenCalledWith({
        userId,
        inputIngredients: ['Tomate'],
        healthSnapshot: null,
        generationOptions: {},
      });
    });

    it('should reject when userId is empty', async () => {
      await expect(
        service.createGenerationRequest('', {
          ingredients: [],
          profile: null,
          options: {},
        } as any),
      ).rejects.toThrow(BadRequestException);

      expect(generationRequestModel.create).not.toHaveBeenCalled();
    });
  });
});
