import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { HealthProfileService } from './health-profile.service.js';
import type { PrismaService } from '../prisma.service';
import type { HealthProfileDTO } from './health-profile.dto.js';
import { BadRequestException } from '@nestjs/common';

type MockHealthProfile = {
  id: string;
  userId: string;
  conditions: string[];
  allergens: string[];
  dietaryPreferences: string[];
} | null;

type UpsertInput = {
  conflictOn: { userId: string };
  create: Record<string, unknown>;
  update: Record<string, unknown>;
};

describe('HealthProfileService', () => {
  let service: HealthProfileService;

  const healthProfileModel = {
    where: jest.fn(),
    first: jest.fn<() => Promise<MockHealthProfile>>(),
    upsert: jest.fn<
      (input: UpsertInput) => Promise<MockHealthProfile>
    >(),
  };

  const prismaServiceMock = {
    db: {
      orm: {
        public: {
          HealthProfile: healthProfileModel,
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    healthProfileModel.where.mockReturnValue(healthProfileModel);

    service = new HealthProfileService(
      prismaServiceMock as unknown as PrismaService
    );
  });

  describe('getHealthProfile', () => {
    it('should return the health profile', async () => {
      const userId = 'user-123';

      const expectedProfile = {
        id: 'profile-123',
        userId,
        conditions: ['DIABETES_TIPO_2'],
        allergens: ['LACTOSE'],
        dietaryPreferences: ['LOW_CARB'],
      };

      healthProfileModel.first.mockResolvedValue(expectedProfile);

      const result = await service.getHealthProfile(userId);

      expect(healthProfileModel.where).toHaveBeenCalledWith({ userId });
      expect(healthProfileModel.first).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ profile: expectedProfile });
    });

    it('should return null when health profile does not exist', async () => {
      const userId = 'user-123';

      healthProfileModel.first.mockResolvedValue(null);

      const result = await service.getHealthProfile(userId);

      expect(healthProfileModel.where).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({ profile: null });
    });
  });

  describe('upsertHealthProfile', () => {
    it('should create or update the health profile', async () => {
      const userId = 'user-123';

      const data: HealthProfileDTO = {
        conditions: ['DIABETES_TIPO_2'],
        allergens: ['LACTOSE'],
        dietaryPreferences: ['LOW_CARB'],
        dislikedIngredients: ['Cebola'],
        dailyCalorieTarget: 2000,
        disclaimerAccepted: true,
      };

      const expectedProfile = {
        id: 'profile-123',
        userId,
        conditions: data.conditions,
        allergens: data.allergens,
        dietaryPreferences: data.dietaryPreferences,
      };

      healthProfileModel.upsert.mockResolvedValue(expectedProfile);

      const result = await service.upsertHealthProfile(userId, data);

      expect(healthProfileModel.upsert).toHaveBeenCalledTimes(1);

      expect(healthProfileModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          conflictOn: { userId },
          create: expect.objectContaining({
            userId,
            conditions: data.conditions,
            allergens: data.allergens,
            dietaryPreferences: data.dietaryPreferences,
            dislikedIngredients: data.dislikedIngredients,
            dailyCalorieTarget: data.dailyCalorieTarget,
            notes: null,
            disclaimerAcceptedAt: expect.any(Date),
          }),
          update: expect.objectContaining({
            conditions: data.conditions,
            allergens: data.allergens,
            dietaryPreferences: data.dietaryPreferences,
            dislikedIngredients: data.dislikedIngredients,
            dailyCalorieTarget: data.dailyCalorieTarget,
            notes: null,
            disclaimerAcceptedAt: expect.any(Date),
          }),
        })
      );

      expect(result).toEqual({ upsertProfile: expectedProfile });
    });

    it('should set disclaimerAcceptedAt to null when disclaimer is not accepted', async () => {
      const userId = 'user-123';

      const data: HealthProfileDTO = {
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
        dislikedIngredients: [],
        dailyCalorieTarget: null,
        disclaimerAccepted: false,
      };

      const expectedProfile = {
        id: 'profile-123',
        userId,
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
      };

      healthProfileModel.upsert.mockResolvedValue(expectedProfile);

      await service.upsertHealthProfile(userId, data);

      expect(healthProfileModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            disclaimerAcceptedAt: null,
          }),
          update: expect.objectContaining({
            disclaimerAcceptedAt: null,
          }),
        })
      );
    });

    it('should throw BadRequestException when userId is empty', async () => {
      const data: HealthProfileDTO = {
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
        dislikedIngredients: [],
        dailyCalorieTarget: null,
        disclaimerAccepted: false,
      };

      await expect(
        service.upsertHealthProfile('', data)
      ).rejects.toThrow(BadRequestException);

      expect(healthProfileModel.upsert).not.toHaveBeenCalled();
    });

    it('should preserve notes when provided', async () => {
      const userId = 'user-123';

      const data: HealthProfileDTO = {
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
        dislikedIngredients: [],
        dailyCalorieTarget: null,
        notes: 'Evitar alimentos muito condimentados.',
        disclaimerAccepted: true,
      };

      healthProfileModel.upsert.mockResolvedValue({
        id: 'profile-123',
        userId,
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
      });

      await service.upsertHealthProfile(userId, data);

      expect(healthProfileModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notes: data.notes,
          }),
          update: expect.objectContaining({
            notes: data.notes,
          }),
        })
      );
    });

    it('should allow clearing all profile arrays', async () => {
      const userId = 'user-123';

      const data: HealthProfileDTO = {
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
        dislikedIngredients: [],
        dailyCalorieTarget: null,
        disclaimerAccepted: false,
      };

      healthProfileModel.upsert.mockResolvedValue({
        id: 'profile-123',
        userId,
        conditions: [],
        allergens: [],
        dietaryPreferences: [],
      });

      await service.upsertHealthProfile(userId, data);

      expect(healthProfileModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            conditions: [],
            allergens: [],
            dietaryPreferences: [],
            dislikedIngredients: [],
          }),
          update: expect.objectContaining({
            conditions: [],
            allergens: [],
            dietaryPreferences: [],
            dislikedIngredients: [],
          }),
        })
      );
    });
  });
});
