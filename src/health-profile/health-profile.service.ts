import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { HealthProfileDTO } from './health-profile.dto';

@Injectable()
export class HealthProfileService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ){}

  async getHealthProfile(userId: string){
    if(!userId) throw new BadRequestException('User ID is required.');

    const profile = await this.prismaService.db.orm.public.HealthProfile.where({ userId }).first();

    return { profile };
  }

  async upsertHealthProfile(userId: string, data: HealthProfileDTO){
    if(!userId) throw new BadRequestException('User ID is required.');

    const disclaimerAcceptedAt = data.disclaimerAccepted
    ? new Date()
    : null;

    const upsertProfile = await this.prismaService.db.orm.public.HealthProfile
    .upsert({
      conflictOn: { userId },
      create: {
        userId,
        conditions: data.conditions,
        allergens: data.allergens,
        dietaryPreferences: data.dietaryPreferences,
        dislikedIngredients: data.dislikedIngredients,
        dailyCalorieTarget: data.dailyCalorieTarget,
        notes: data.notes ?? null,
        disclaimerAcceptedAt: disclaimerAcceptedAt,
      },
      update: {
        conditions: data.conditions,
        allergens: data.allergens,
        dietaryPreferences: data.dietaryPreferences,
        dislikedIngredients: data.dislikedIngredients,
        dailyCalorieTarget: data.dailyCalorieTarget,
        notes: data.notes ?? null,
        disclaimerAcceptedAt: disclaimerAcceptedAt,
      }
    });

    return { upsertProfile };
  }
}
