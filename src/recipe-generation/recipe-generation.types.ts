import { MEASURE_UNITS } from "../common/constants/database-enums";
import type { MealType } from "./recipe-genaration.dto";

export interface RecipeIngredientInput {
  pantryItemId?: string | null;
  ingredientId?: string | null;
  name: string;
  quantity?: number | null;
  unit?: (typeof MEASURE_UNITS)[number] | null;
  fromPantry: boolean;
}

export interface GenerationOptions {
  mealType?: MealType;
  servings?: number;
  maxPreparationTime?: number;
  healthy?: boolean;
}
