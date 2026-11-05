import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PantryService } from './pantry.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import type { CreatePantryItemDTO, UpdatePantryItemDTO } from './pantry.dto.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';

@UseGuards(AuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(
    @Inject(PantryService)
    private readonly pantryService: PantryService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async allItems(@Req() request: AuthenticatedRequest){
    const userId = request.user!.id;

    return this.pantryService.findAllItems(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async itemById(@Param('id') id:string, @Req() request: AuthenticatedRequest){
    const userId = request.user!.id;

    return this.pantryService.findItemById(id, userId);
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Req() request: AuthenticatedRequest,@Body() body: CreatePantryItemDTO){
    const userId = request.user!.id;

    return this.pantryService.createPantryItem(userId, body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateItem(@Body() body: UpdatePantryItemDTO,@Param('id') itemId: string, @Req() request: AuthenticatedRequest){
    const userId = request.user!.id;

    return this.pantryService.updatePantryItem(body, itemId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteItem(@Param('id') itemId: string, @Req() request: AuthenticatedRequest){
    const userId = request.user!.id;

    return this.pantryService.deletePantryItem(itemId, userId);
  }
}
