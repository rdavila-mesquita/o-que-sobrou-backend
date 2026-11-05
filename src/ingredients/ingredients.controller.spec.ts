import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';

import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { AuthGuard } from '../common/guards/auth.guard';

describe('IngredientsController', () => {
  let controller: IngredientsController;

  const mockIngredient: Awaited<
  ReturnType<IngredientsService['allIngredients']>
    >['ingredients'][number] = {
      id: 'ingredient-123',
      name: 'Tomate',
      slug: 'tomate',
      category: 'vegetable',
      source: 'USDA',
    };

  const mockIngredientsService = {
    allIngredients: jest.fn<IngredientsService['allIngredients']>(),
    findIngredientById: jest.fn<IngredientsService['findIngredientById']>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

     const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockIngredientsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<IngredientsController>(IngredientsController);
  });

  describe('allIngredients', () => {
    it('should return ingredients with pagination', async () => {
      const response = {
        ingredients: [mockIngredient],
        pagination: {
          page: 2,
          limit: 5,
          offset: 5,
        },
      };

      mockIngredientsService.allIngredients.mockResolvedValue(response);

      const result = await controller.allIngredients({
        page: 2,
        limit: 5,
      });

      expect(mockIngredientsService.allIngredients)
        .toHaveBeenCalledWith(2, 5);

      expect(result).toEqual(response);
    });

    it('should use default pagination values', async () => {
      const response = {
        ingredients: [],
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
        },
      };

      mockIngredientsService.allIngredients.mockResolvedValue(response);

      const result = await controller.allIngredients({
        page: 1,
        limit: 10,
      });

      expect(mockIngredientsService.allIngredients)
        .toHaveBeenCalledWith(1, 10);

      expect(result).toEqual(response);
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Database error');

      mockIngredientsService.allIngredients.mockRejectedValue(error);

      await expect(
        controller.allIngredients({
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('findIngredientById', () => {
    it('should return an ingredient when it exists', async () => {
      const response = {
        ingredient: mockIngredient,
      } as Awaited<ReturnType<IngredientsService['findIngredientById']>>;

      mockIngredientsService.findIngredientById.mockResolvedValue(response);

      const result = await controller.findIngredientById('ingredient-123');

      expect(mockIngredientsService.findIngredientById)
        .toHaveBeenCalledWith('ingredient-123');

      expect(result).toEqual(response);
    });

    it('should propagate NotFoundException when ingredient does not exist', async () => {
      const error = new NotFoundException('Ingredient does not exist.');

      mockIngredientsService.findIngredientById.mockRejectedValue(error);

      await expect(
        controller.findIngredientById('invalid-id'),
      ).rejects.toThrow(error);

      expect(mockIngredientsService.findIngredientById)
        .toHaveBeenCalledWith('invalid-id');
    });
  });
});
