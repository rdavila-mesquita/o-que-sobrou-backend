import { Controller } from '@nestjs/common';
import { PantryService } from './pantry.service.js';

@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}
}
