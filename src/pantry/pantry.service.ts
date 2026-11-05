import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { CreatePantryItemDTO, UpdatePantryItemDTO } from './pantry.dto';

@Injectable()
export class PantryService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async createPantryItem(userId: string, data: CreatePantryItemDTO){
    if(!userId) throw new BadRequestException('User not informed.');

    if(data.customName != null && data.ingredientId != null || data.customName == null && data.ingredientId == null){
      throw new BadRequestException('Provide either ingredientId or customName, but not both.');
    }

    if(data.customName == null && data.ingredientId != null){
      const existingIngredient = await this.prismaService.db.orm.public.Ingredient
      .where({ id: data.ingredientId }).first();

      if(!existingIngredient) throw new NotFoundException('Ingredient not found.');
    }

    const newItem = await this.prismaService.db.orm.public.PantryItem
    .create({
      userId,
      ingredientId: data.ingredientId,
      customName: data.customName,
      quantity: data.quantity,
      unit: data.unit
    });

    return { newItem };
  }

  async findAllItems(userId: string){
    if(!userId) throw new BadRequestException('User not informed.');

    const items = await this.prismaService.db.orm.public.PantryItem.where({ userId }).all()

    return { items };
  }

  async findItemById(itemId: string, userId: string){
    if(!itemId) throw new BadRequestException('Item ID is required.');

    if(!userId) throw new BadRequestException('User ID is required.');

    const item = await this.prismaService.db.orm.public.PantryItem.where({ id: itemId, userId }).first();

    if(!item) throw new NotFoundException('Pantry item not found.');

    return { item };
  }

  async updatePantryItem(data: UpdatePantryItemDTO, itemId: string, userId: string){
    if(!userId) throw new BadRequestException('User ID is required.');

    const existingItem = await this.prismaService.db.orm.public.PantryItem
    .where({ id: itemId, userId }).first();

    if(!existingItem) throw new NotFoundException('Pantry item not found.');

    if(data.customName !== undefined && existingItem.ingredientId !== null){
      throw new BadRequestException('You cannot update the name of a registered ingredient.');
    }

    if(data.customName === undefined && data.quantity === undefined && data.unit === undefined){
      throw new BadRequestException('No fields provided for update.');
    }

    const updatedItem = await this.prismaService.db.orm.public.PantryItem
    .where({ id: itemId, userId })
    .update({ customName: data.customName, quantity: data.quantity, unit: data.unit });

    return { updatedItem };
  }

  async deletePantryItem(itemId: string, userId: string){
    if(!userId) throw new BadRequestException('User ID is required.');

    await this.findItemById(itemId, userId);

    await this.prismaService.db.orm.public.PantryItem
    .where({ id: itemId, userId })
    .delete()

    return { message: 'Pantry item deleted successfully!' }
  }
}
