import { Test, TestingModule } from '@nestjs/testing';
import { PantryService } from './pantry.service.js';

describe('PantryService', () => {
  let service: PantryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PantryService],
    }).compile();

    service = module.get<PantryService>(PantryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
