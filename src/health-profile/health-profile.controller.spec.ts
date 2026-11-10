import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { HealthProfileController } from './health-profile.controller.js';
import { HealthProfileService } from './health-profile.service.js';
import type { HealthProfileDTO } from './health-profile.dto.js';

describe('HealthProfileController', () => {
  let controller: HealthProfileController;

  const healthProfileServiceMock = {
    getHealthProfile: jest.fn<(userId: string) => Promise<unknown>>(),
    upsertHealthProfile: jest.fn<
      (userId: string, data: HealthProfileDTO) => Promise<unknown>
    >(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new HealthProfileController(
      healthProfileServiceMock as unknown as HealthProfileService
    );
  });

  describe('healthProfile', () => {
    it('should return the user health profile', async () => {
      const userId = 'user-123';

      const expectedResponse = {
        profile: {
          id: 'profile-123',
          userId,
          conditions: ['DIABETES_TIPO_2'],
          allergens: ['LACTOSE'],
          dietaryPreferences: ['LOW_CARB'],
        },
      };

      healthProfileServiceMock.getHealthProfile.mockResolvedValue(
        expectedResponse
      );

      const request = {
        user: { id: userId },
      } as Parameters<HealthProfileController['healthProfile']>[0];

      const result = await controller.healthProfile(request);

      expect(healthProfileServiceMock.getHealthProfile).toHaveBeenCalledWith(userId);
      expect(healthProfileServiceMock.getHealthProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('upsert', () => {
    it('should create or update the user health profile', async () => {
      const userId = 'user-123';

      const data: HealthProfileDTO = {
        conditions: ['DIABETES_TIPO_2'],
        allergens: ['LACTOSE'],
        dietaryPreferences: ['LOW_CARB'],
        dislikedIngredients: ['Cebola'],
        dailyCalorieTarget: 2000,
        notes: 'Evitar alimentos muito condimentados.',
        disclaimerAccepted: true,
      };

      const expectedResponse = {
        upsertProfile: {
          id: 'profile-123',
          userId,
          conditions: data.conditions,
          allergens: data.allergens,
          dietaryPreferences: data.dietaryPreferences,
        },
      };

      healthProfileServiceMock.upsertHealthProfile.mockResolvedValue(
        expectedResponse
      );

      const request = {
        user: { id: userId },
      } as Parameters<HealthProfileController['upsert']>[0];

      const result = await controller.upsert(request, data);

      expect(
        healthProfileServiceMock.upsertHealthProfile
      ).toHaveBeenCalledWith(userId, data);

      expect(
        healthProfileServiceMock.upsertHealthProfile
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual(expectedResponse);
    });
  });
});
