import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import { RecipesService } from './recipes.service.js';
import { PrismaService } from '../prisma.service';

type MockRecipe = {
  id: string;
  userId: string;
  title: string;
};

describe('RecipesService', () => {
  let recipesService: RecipesService;

  let mockRecipes: MockRecipe[];

  const mockOrm = {
    public: {
      Recipe: {
        where: jest.fn(),
      },
    },
  };

  const mockPrismaService = {
    db: {
      orm: mockOrm,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRecipes = [
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
      {
        id: 'recipe-3',
        userId: 'user-2',
        title: 'Bolo',
      },
    ];

    recipesService = new RecipesService(
      mockPrismaService as unknown as PrismaService,
    );
  });

  describe('findAllRecipes', () => {
    it('should return all recipes belonging to the user', async () => {
      const expectedRecipes = mockRecipes.filter(
        (recipe) => recipe.userId === 'user-1',
      );

      mockOrm.public.Recipe.where.mockReturnValue({
        all: jest
          .fn<() => Promise<MockRecipe[]>>()
          .mockResolvedValue(expectedRecipes),
      });

      const result = await recipesService.findAllRecipes('user-1');

      expect(mockOrm.public.Recipe.where).toHaveBeenCalledWith({
        userId: 'user-1',
      });

      expect(result).toEqual({
        allRecipes: expectedRecipes,
      });
    });

    it('should throw BadRequestException when userId is not informed', async () => {
      await expect(
        recipesService.findAllRecipes(''),
      ).rejects.toThrow(BadRequestException);

      expect(mockOrm.public.Recipe.where).not.toHaveBeenCalled();
    });
  });

  describe('findRecipeById', () => {
    it('should return the recipe when it belongs to the user', async () => {
      const expectedRecipe = mockRecipes[0];

      mockOrm.public.Recipe.where.mockReturnValue({
        first: jest
          .fn<() => Promise<MockRecipe | null>>()
          .mockResolvedValue(expectedRecipe),
      });

      const result = await recipesService.findRecipeById(
        'user-1',
        'recipe-1',
      );

      expect(mockOrm.public.Recipe.where).toHaveBeenCalledWith({
        userId: 'user-1',
        id: 'recipe-1',
      });

      expect(result).toEqual({
        recipe: expectedRecipe,
      });
    });

    it('should throw BadRequestException when id is not informed', async () => {
      await expect(
        recipesService.findRecipeById('user-1', ''),
      ).rejects.toThrow(BadRequestException);

      expect(mockOrm.public.Recipe.where).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when userId is not informed', async () => {
      await expect(
        recipesService.findRecipeById('', 'recipe-1'),
      ).rejects.toThrow(BadRequestException);

      expect(mockOrm.public.Recipe.where).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      mockOrm.public.Recipe.where.mockReturnValue({
        first: jest
          .fn<() => Promise<MockRecipe | null>>()
          .mockResolvedValue(null),
      });

      await expect(
        recipesService.findRecipeById('user-1', 'recipe-999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not return a recipe belonging to another user', async () => {
      mockOrm.public.Recipe.where.mockReturnValue({
        first: jest
          .fn<() => Promise<MockRecipe | null>>()
          .mockResolvedValue(null),
      });

      await expect(
        recipesService.findRecipeById('user-1', 'recipe-3'),
      ).rejects.toThrow(NotFoundException);

      expect(mockOrm.public.Recipe.where).toHaveBeenCalledWith({
        userId: 'user-1',
        id: 'recipe-3',
      });
    });
  });

  describe('removeRecipe', () => {
    it('should delete the recipe when it belongs to the user', async () => {
      const expectedRecipe = mockRecipes[0];

      mockOrm.public.Recipe.where
        .mockReturnValueOnce({
          first: jest
            .fn<() => Promise<MockRecipe | null>>()
            .mockResolvedValue(expectedRecipe),
        })
        .mockReturnValueOnce({
          delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        });

      const result = await recipesService.removeRecipe(
        'user-1',
        'recipe-1',
      );

      expect(mockOrm.public.Recipe.where).toHaveBeenNthCalledWith(1, {
        userId: 'user-1',
        id: 'recipe-1',
      });

      expect(mockOrm.public.Recipe.where).toHaveBeenNthCalledWith(2, {
        userId: 'user-1',
        id: 'recipe-1',
      });

      expect(result).toEqual({
        message: 'Recipe deleted successfully!',
      });
    });

    it('should throw BadRequestException when userId is not informed', async () => {
      await expect(
        recipesService.removeRecipe('', 'recipe-1'),
      ).rejects.toThrow(BadRequestException);

      expect(mockOrm.public.Recipe.where).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      mockOrm.public.Recipe.where.mockReturnValue({
        first: jest
          .fn<() => Promise<MockRecipe | null>>()
          .mockResolvedValue(null),
      });

      await expect(
        recipesService.removeRecipe('user-1', 'recipe-999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when recipe belongs to another user', async () => {
      mockOrm.public.Recipe.where.mockReturnValue({
        first: jest
          .fn<() => Promise<MockRecipe | null>>()
          .mockResolvedValue(null),
      });

      await expect(
        recipesService.removeRecipe('user-1', 'recipe-3'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
