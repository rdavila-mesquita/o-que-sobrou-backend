import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Put, Req, UseGuards } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { HealthProfileDTO } from './health-profile.dto.js';

@UseGuards(AuthGuard)
@Controller('health-profile')
export class HealthProfileController {
  constructor(
    @Inject(HealthProfileService)
    private readonly healthProfileService: HealthProfileService
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async healthProfile(@Req() request: AuthenticatedRequest){
    const userId = request.user!.id;

    return this.healthProfileService.getHealthProfile(userId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async upsert(@Req() request: AuthenticatedRequest, @Body() body: HealthProfileDTO){
    const userId = request.user!.id;

    return this.healthProfileService.upsertHealthProfile(userId, body);
  }
}
