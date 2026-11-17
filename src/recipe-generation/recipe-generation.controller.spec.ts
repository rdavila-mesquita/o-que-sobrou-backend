import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RecipeGenerationController } from './recipe-generation.controller.js';
import { RecipeGenerationService } from './recipe-generation.service.js';

describe('RecipeGenerationController', () => {
  let controller: RecipeGenerationController;
  let recipeGenerationService: any;

  const userId = 'user-123';
  const generationId = 'generation-123';

  const mockRequest = {
    user: {
      id: userId,
    },
  } as any;

  beforeEach(() => {
    recipeGenerationService = {
      generateRecipe: jest.fn(),
      getGeneratedRecipe: jest.fn(),
      retryGenerationRequest: jest.fn(),
    };

    controller = new RecipeGenerationController(
      recipeGenerationService as RecipeGenerationService,
    );
  });

  describe('requestGeneration', () => {
    it('should request recipe generation for the authenticated user', async () => {
      const body = {
        customIngredients: ['Arroz', 'Feijão'],
        mealType: 'ALMOCO',
        servings: 2,
      } as any;

      const expectedResult = {
        id: generationId,
        status: 'PENDING',
      };

      recipeGenerationService.generateRecipe.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.requestGeneration(
        mockRequest,
        body,
      );

      expect(recipeGenerationService.generateRecipe).toHaveBeenCalledWith(
        userId,
        body,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getGeneratedRecipe', () => {
    it('should return the generation request for the authenticated user', async () => {
      const expectedResult = {
        id: generationId,
        status: 'SUCCEEDED',
      };

      recipeGenerationService.getGeneratedRecipe.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getGeneratedRecipe(
        mockRequest,
        generationId,
      );

      expect(recipeGenerationService.getGeneratedRecipe).toHaveBeenCalledWith(
        userId,
        generationId,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('retryGeneration', () => {
    it('should retry generation for the authenticated user', async () => {
      const expectedResult = {
        retry: {
          id: generationId,
          status: 'PENDING',
          attempts: 1,
        },
      };

      recipeGenerationService.retryGenerationRequest.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.retryGeneration(
        mockRequest,
        generationId,
      );

      expect(
        recipeGenerationService.retryGenerationRequest,
      ).toHaveBeenCalledWith(userId, generationId);

      expect(result).toEqual(expectedResult);
    });
  });
});
