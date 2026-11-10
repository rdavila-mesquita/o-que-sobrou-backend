import { Module } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service.js';
import { HealthProfileController } from './health-profile.controller.js';

@Module({
  controllers: [HealthProfileController],
  providers: [HealthProfileService],
})
export class HealthProfileModule {}
