import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';

import { IngredientsService } from './ingredients.service';
import { PrismaService } from '../prisma.service';

describe('IngredientsService', () => {
  let service: IngredientsService;

  const mockIngredient = {
    id: 'ingredient-123',
    name: 'Tomate',
    slug: 'tomate',
    category: 'vegetable',
    source: 'USDA',
  };

  const mockPrismaService = {
    db: {
      orm: {
        public: {
          Ingredient: {
            select: jest.fn(),
            where: jest.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  describe('allIngredients', () => {
    it('should return ingredients with pagination', async () => {
      const ingredients = [mockIngredient];

      const allMock = jest
        .fn<() => Promise<typeof ingredients>>()
        .mockResolvedValue(ingredients);

      const limitMock = jest.fn().mockReturnValue({
        all: allMock,
      });

      const offsetMock = jest.fn().mockReturnValue({
        limit: limitMock,
      });

      const orderByMock = jest.fn().mockReturnValue({
        offset: offsetMock,
      });

      mockPrismaService.db.orm.public.Ingredient.select.mockReturnValue({
        orderBy: orderByMock,
      });

      const result = await service.allIngredients(2, 5);

      expect(mockPrismaService.db.orm.public.Ingredient.select)
        .toHaveBeenCalledWith(
          'id',
          'name',
          'slug',
          'category',
          'source',
        );

      expect(orderByMock).toHaveBeenCalled();
      expect(offsetMock).toHaveBeenCalledWith(5);
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(allMock).toHaveBeenCalled();

      expect(result).toEqual({
        ingredients,
        pagination: {
          page: 2,
          limit: 5,
          offset: 5,
        },
      });
    });

    it('should use default pagination values', async () => {
      const allMock = jest
        .fn<() => Promise<typeof mockIngredient[]>>()
        .mockResolvedValue([]);

      const limitMock = jest.fn().mockReturnValue({
        all: allMock,
      });

      const offsetMock = jest.fn().mockReturnValue({
        limit: limitMock,
      });

      const orderByMock = jest.fn().mockReturnValue({
        offset: offsetMock,
      });

      mockPrismaService.db.orm.public.Ingredient.select.mockReturnValue({
        orderBy: orderByMock,
      });

      const result = await service.allIngredients();

      expect(offsetMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(allMock).toHaveBeenCalled();

      expect(result).toEqual({
        ingredients: [],
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
        },
      });
    });
  });

  describe('findIngredients', () => {
    it('should return ingredients matching the name', async () => {
      const ingredients = [mockIngredient];

      const allMock = jest
        .fn<() => Promise<typeof ingredients>>()
        .mockResolvedValue(ingredients);

      mockPrismaService.db.orm.public.Ingredient.where.mockReturnValue({
        all: allMock,
      });

      const result = await service.findIngredients({
        name: 'Tomate',
      });

      expect(mockPrismaService.db.orm.public.Ingredient.where)
        .toHaveBeenCalledWith({
          name: 'Tomate',
        });

      expect(allMock).toHaveBeenCalled();

      expect(result).toEqual({
        ingredients,
      });
    });
  });

  describe('findIngredientById', () => {
    it('should return an ingredient when it exists', async () => {
      const firstMock = jest
        .fn<() => Promise<typeof mockIngredient | undefined>>()
        .mockResolvedValue(mockIngredient);

      mockPrismaService.db.orm.public.Ingredient.where.mockReturnValue({
        first: firstMock,
      });

      const result = await service.findIngredientById('ingredient-123');

      expect(mockPrismaService.db.orm.public.Ingredient.where)
        .toHaveBeenCalledWith({
          id: 'ingredient-123',
        });

      expect(firstMock).toHaveBeenCalled();

      expect(result).toEqual({
        ingredient: mockIngredient,
      });
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      const firstMock = jest
        .fn<() => Promise<typeof mockIngredient | undefined>>()
        .mockResolvedValue(undefined);

      mockPrismaService.db.orm.public.Ingredient.where.mockReturnValue({
        first: firstMock,
      });

      await expect(
        service.findIngredientById('invalid-id'),
      ).rejects.toThrow(
        new NotFoundException('Ingredient does not exist.'),
      );

      expect(firstMock).toHaveBeenCalled();
    });
  });
});

