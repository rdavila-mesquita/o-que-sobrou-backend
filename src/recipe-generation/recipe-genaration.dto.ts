import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  Validate,
} from "class-validator";

import { AtLeastOneIngredientGroupConstraint } from "../common/validator/ingredient-group.validator";


export enum MealType {
  ALMOCO = 'ALMOCO',
  LANCHE = 'LANCHE',
  CAFE_DA_MANHA = 'CAFE_DA_MANHA',
  JANTA = 'JANTA',
}

export class GenerationRecipeDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  pantryItemIds?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/\S/, {
    each: true,
    message:
      "Each ingredient must contain at least one non-whitespace character.",
  })
  @IsOptional()
  customIngredients?: string[];

  @IsEnum(MealType)
  @IsOptional()
  mealType?: MealType;

  @Min(1)
  @IsInt()
  @IsOptional()
  servings?: number;

  @Min(1)
  @IsInt()
  @IsOptional()
  maxPreparationTime?: number;

  @IsBoolean()
  @IsOptional()
  healthy?: boolean;

  @Validate(AtLeastOneIngredientGroupConstraint)
  private readonly ingredientGroupsValidation = true;
}
