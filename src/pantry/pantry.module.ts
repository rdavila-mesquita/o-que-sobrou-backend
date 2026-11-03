import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service.js';
import { PantryController } from './pantry.controller.js';

@Module({
  controllers: [PantryController],
  providers: [PantryService],
})
export class PantryModule {}
