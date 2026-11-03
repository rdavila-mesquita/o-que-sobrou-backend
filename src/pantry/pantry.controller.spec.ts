import { Test, TestingModule } from '@nestjs/testing';
import { PantryController } from './pantry.controller.js';
import { PantryService } from './pantry.service.js';

describe('PantryController', () => {
  let controller: PantryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantryController],
      providers: [PantryService],
    }).compile();

    controller = module.get<PantryController>(PantryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
