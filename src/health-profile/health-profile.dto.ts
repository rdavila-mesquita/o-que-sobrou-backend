import { getMetadataStorage, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, ValidateIf } from "class-validator";
import { ALLERGENS, DIETARY_PREFERENCES, HEALTH_CONDITIONS } from "../common/constants/database-enums";

type HealthConditionType = (typeof HEALTH_CONDITIONS)[number];
type AllergenType = (typeof ALLERGENS)[number];
type DietaryPreferenceType = (typeof DIETARY_PREFERENCES)[number];

export class HealthProfileDTO {
  @IsArray()
  @IsEnum(HEALTH_CONDITIONS, { each: true })
  conditions!: HealthConditionType[];

  @IsArray()
  @IsEnum(ALLERGENS, { each: true })
  allergens!: AllergenType[];

  @IsArray()
  @IsEnum(DIETARY_PREFERENCES, { each: true })
  dietaryPreferences!: DietaryPreferenceType[];

  @IsArray()
  @IsString({ each: true })
  dislikedIngredients!: string[];

  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1000)
  dailyCalorieTarget!: number | null;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsBoolean()
  disclaimerAccepted!: boolean;
}
