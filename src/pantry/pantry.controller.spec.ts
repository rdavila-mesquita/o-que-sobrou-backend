import { Test, TestingModule } from '@nestjs/testing';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import type {
  CreatePantryItemDTO,
  UpdatePantryItemDTO,
} from './pantry.dto';
import { jest } from '@jest/globals';
import { AuthGuard } from '../common/guards/auth.guard';

type PantryItem = Awaited<
  ReturnType<PantryService['findAllItems']>
>['items'][number];

describe('PantryController', () => {
  let controller: PantryController;
  let pantryService: PantryService;

  const userId = 'user-123';
  const itemId = 'item-123';

  const mockRequest = {
    user: {
      id: userId,
      name: 'Test User',
      email: 'test@email.com',
    },
  } as unknown as AuthenticatedRequest;

  const expectedItem: PantryItem = {
    id: itemId,
    userId,
    ingredientId: null,
    customName: 'Arroz',
    quantity: null,
    unit: 'KG',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPantryService: jest.Mocked<
    Pick<
      PantryService,
      | 'findAllItems'
      | 'findItemById'
      | 'createPantryItem'
      | 'updatePantryItem'
      | 'deletePantryItem'
    >
  > = {
    findAllItems: jest.fn(),
    findItemById: jest.fn(),
    createPantryItem: jest.fn(),
    updatePantryItem: jest.fn(),
    deletePantryItem: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantryController],
      providers: [
        {
          provide: PantryService,
          useValue: mockPantryService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<PantryController>(PantryController);
    pantryService = module.get<PantryService>(PantryService);
  });

  describe('allItems', () => {
    it('should return all pantry items from the authenticated user', async () => {
      const expectedItems: PantryItem[] = [expectedItem];

      mockPantryService.findAllItems.mockResolvedValue({
        items: expectedItems,
      });

      const result = await controller.allItems(mockRequest);

      expect(pantryService.findAllItems).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ items: expectedItems });
    });
  });

  describe('itemById', () => {
    it('should return a pantry item by its ID', async () => {
      mockPantryService.findItemById.mockResolvedValue({
        item: expectedItem,
      });

      const result = await controller.itemById(itemId, mockRequest);

      expect(pantryService.findItemById).toHaveBeenCalledWith(
        itemId,
        userId,
      );

      expect(result).toEqual({ item: expectedItem });
    });
  });

  describe('createItem', () => {
    it('should create a pantry item for the authenticated user', async () => {
      const body: CreatePantryItemDTO = {
        customName: 'Rice',
        quantity: '2.00',
        unit: 'KG',
      };

      mockPantryService.createPantryItem.mockResolvedValue({
        newItem: expectedItem,
      });

      const result = await controller.createItem(mockRequest, body);

      expect(pantryService.createPantryItem).toHaveBeenCalledWith(
        userId,
        body,
      );

      expect(result).toEqual({ newItem: expectedItem });
    });
  });

  describe('updateItem', () => {
    it('should update a pantry item', async () => {
      const body: UpdatePantryItemDTO = {
        quantity: '3.00',
      };

      mockPantryService.updatePantryItem.mockResolvedValue({
        updatedItem: expectedItem,
      });

      const result = await controller.updateItem(
        body,
        itemId,
        mockRequest,
      );

      expect(pantryService.updatePantryItem).toHaveBeenCalledWith(
        body,
        itemId,
        userId,
      );

      expect(result).toEqual({ updatedItem: expectedItem });
    });
  });

  describe('deleteItem', () => {
    it('should delete a pantry item', async () => {
      const expectedResponse = {
        message: 'Pantry item deleted successfully!',
      };

      mockPantryService.deletePantryItem.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.deleteItem(itemId, mockRequest);

      expect(pantryService.deletePantryItem).toHaveBeenCalledWith(
        itemId,
        userId,
      );

      expect(result).toEqual(expectedResponse);
    });
  });
});
