import { jest } from '@jest/globals';
import { RecipesController } from './recipes.controller.js';
import { RecipesService } from './recipes.service.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';

type MockRecipe = {
  id: string;
  userId: string;
  title: string;
};

describe('RecipesController', () => {
  let recipesController: RecipesController;

  const mockRecipesService = {
    findAllRecipes: jest.fn<
      (userId: string) => Promise<{ allRecipes: MockRecipe[] }>
    >(),

    findRecipeById: jest.fn<
      (userId: string, id: string) => Promise<{ recipe: MockRecipe }>
    >(),

    removeRecipe: jest.fn<
      (userId: string, id: string) => Promise<{ message: string }>
    >(),
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      type: 'access',
    },
  } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    recipesController = new RecipesController(
      mockRecipesService as unknown as RecipesService,
    );
  });

  describe('findAll', () => {
    it('should return all recipes belonging to the authenticated user', async () => {
      const expectedRecipes: MockRecipe[] = [
        {
          id: 'recipe-1',
          userId: 'user-1',
          title: 'Omelete',
        },
        {
          id: 'recipe-2',
          userId: 'user-1',
          title: 'Panqueca',
        },
      ];

      mockRecipesService.findAllRecipes.mockResolvedValue({
        allRecipes: expectedRecipes,
      });

      const result = await recipesController.findAll(mockRequest);

      expect(mockRecipesService.findAllRecipes).toHaveBeenCalledWith(
        'user-1',
      );

      expect(result).toEqual({
        allRecipes: expectedRecipes,
      });
    });
  });

  describe('findOne', () => {
    it('should return the recipe identified by id', async () => {
      const expectedRecipe: MockRecipe = {
        id: 'recipe-1',
        userId: 'user-1',
        title: 'Omelete',
      };

      mockRecipesService.findRecipeById.mockResolvedValue({
        recipe: expectedRecipe,
      });

      const result = await recipesController.findOne(
        mockRequest,
        'recipe-1',
      );

      expect(mockRecipesService.findRecipeById).toHaveBeenCalledWith(
        'user-1',
        'recipe-1',
      );

      expect(result).toEqual({
        recipe: expectedRecipe,
      });
    });
  });

  describe('remove', () => {
    it('should remove the recipe identified by id', async () => {
      const expectedResponse = {
        message: 'Recipe deleted successfully!',
      };

      mockRecipesService.removeRecipe.mockResolvedValue(
        expectedResponse,
      );

      const result = await recipesController.remove(
        mockRequest,
        'recipe-1',
      );

      expect(mockRecipesService.removeRecipe).toHaveBeenCalledWith(
        'user-1',
        'recipe-1',
      );

      expect(result).toEqual(expectedResponse);
    });
  });
});
