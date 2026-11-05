import {
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { PantryService } from './pantry.service';
import { jest } from '@jest/globals';
import type { PrismaService } from '../prisma.service';


describe('PantryService', () => {
  let service: PantryService;
  let prismaService: any;

  let pantryItemQuery: any;
  let ingredientQuery: any;

  let pantryItemModel: any;
  let ingredientModel: any;

  const userId = 'user-123';
  const itemId = 'item-123';
  const ingredientId = 'ingredient-123';

  const mockPantryItem = {
    id: itemId,
    userId,
    ingredientId,
    customName: null,
    quantity: '2.00',
    unit: 'KG'
  };

  beforeEach(() => {
    pantryItemQuery = {
      first: jest.fn(),
      all: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    ingredientQuery = {
      first: jest.fn()
    };

    pantryItemModel = {
      where: jest.fn().mockReturnValue(pantryItemQuery),
      create: jest.fn()
    };

    ingredientModel = {
      where: jest.fn().mockReturnValue(ingredientQuery)
    };

    prismaService = {
      db: {
        orm: {
          public: {
            PantryItem: pantryItemModel,
            Ingredient: ingredientModel
          }
        }
      }
    };

    service = new PantryService(
      prismaService as PrismaService
    );
  });

  describe('createPantryItem', () => {
    it('should create a pantry item with a registered ingredient', async () => {
      const data = {
        ingredientId,
        quantity: '2.00',
        unit: 'KG'
      } as any;

      ingredientQuery.first.mockResolvedValue({
        id: ingredientId
      });

      pantryItemModel.create.mockResolvedValue(mockPantryItem);

      const result = await service.createPantryItem(userId, data);

      expect(ingredientModel.where).toHaveBeenCalledWith({
        id: ingredientId
      });

      expect(pantryItemModel.create).toHaveBeenCalledWith({
        userId,
        ingredientId,
        customName: undefined,
        quantity: '2.00',
        unit: 'KG'
      });

      expect(result).toEqual({
        newItem: mockPantryItem
      });
    });

    it('should reject when userId is missing', async () => {
      const data = {
        customName: 'Rice'
      } as any;

      await expect(
        service.createPantryItem('', data)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when neither ingredientId nor customName is provided', async () => {
      const data = {} as any;

      await expect(
        service.createPantryItem(userId, data)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when both ingredientId and customName are provided', async () => {
      const data = {
        ingredientId,
        customName: 'Rice'
      } as any;

      await expect(
        service.createPantryItem(userId, data)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when the registered ingredient does not exist', async () => {
      const data = {
        ingredientId
      } as any;

      ingredientQuery.first.mockResolvedValue(null);

      await expect(
        service.createPantryItem(userId, data)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllItems', () => {
    it('should return all items belonging to the user', async () => {
      const items = [mockPantryItem];

      pantryItemQuery.all.mockResolvedValue(items);

      const result = await service.findAllItems(userId);

      expect(pantryItemModel.where).toHaveBeenCalledWith({
        userId
      });

      expect(result).toEqual({
        items
      });
    });

    it('should return an empty array when the user has no items', async () => {
      pantryItemQuery.all.mockResolvedValue([]);

      const result = await service.findAllItems(userId);

      expect(result).toEqual({
        items: []
      });
    });

    it('should reject when userId is missing', async () => {
      await expect(
        service.findAllItems('')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findItemById', () => {
    it('should return the item belonging to the user', async () => {
      pantryItemQuery.first.mockResolvedValue(mockPantryItem);

      const result = await service.findItemById(itemId, userId);

      expect(pantryItemModel.where).toHaveBeenCalledWith({
        id: itemId,
        userId
      });

      expect(result).toEqual({
        item: mockPantryItem
      });
    });

    it('should reject when the item does not exist', async () => {
      pantryItemQuery.first.mockResolvedValue(null);

      await expect(
        service.findItemById(itemId, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when itemId is missing', async () => {
      await expect(
        service.findItemById('', userId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when userId is missing', async () => {
      await expect(
        service.findItemById(itemId, '')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePantryItem', () => {
    it('should update quantity and unit', async () => {
      const data = {
        quantity: '3.00',
        unit: 'KG'
      } as any;

      const updatedItem = {
        ...mockPantryItem,
        quantity: '3.00'
      };

      pantryItemQuery.first.mockResolvedValue(mockPantryItem);
      pantryItemQuery.update.mockResolvedValue(updatedItem);

      const result = await service.updatePantryItem(
        data,
        itemId,
        userId
      );

      expect(pantryItemModel.where).toHaveBeenCalledWith({
        id: itemId,
        userId
      });

      expect(pantryItemQuery.update).toHaveBeenCalledWith({
        customName: undefined,
        quantity: '3.00',
        unit: 'KG'
      });

      expect(result).toEqual({
        updatedItem
      });
    });

    it('should reject when the item does not exist', async () => {
      pantryItemQuery.first.mockResolvedValue(null);

      await expect(
        service.updatePantryItem(
          { quantity: '3.00' } as any,
          itemId,
          userId
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when no fields are provided', async () => {
      pantryItemQuery.first.mockResolvedValue(mockPantryItem);

      await expect(
        service.updatePantryItem(
          {} as any,
          itemId,
          userId
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject changing the name of a registered ingredient', async () => {
      pantryItemQuery.first.mockResolvedValue({
        ...mockPantryItem,
        ingredientId
      });

      await expect(
        service.updatePantryItem(
          { customName: 'New name' } as any,
          itemId,
          userId
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePantryItem', () => {
    it('should delete an item belonging to the user', async () => {
      pantryItemQuery.first.mockResolvedValue(mockPantryItem);
      pantryItemQuery.delete.mockResolvedValue(undefined);

      const result = await service.deletePantryItem(
        itemId,
        userId
      );

      expect(pantryItemModel.where).toHaveBeenCalledWith({
        id: itemId,
        userId
      });

      expect(pantryItemQuery.delete).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Pantry item deleted successfully!'
      });
    });

    it('should reject when the item does not exist', async () => {
      pantryItemQuery.first.mockResolvedValue(null);

      await expect(
        service.deletePantryItem(itemId, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when userId is missing', async () => {
      await expect(
        service.deletePantryItem(itemId, '')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
