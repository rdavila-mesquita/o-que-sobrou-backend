import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, Matches, Validate } from "class-validator";
import { MEASURE_UNITS } from "../common/constants/database-enums";
import { MinDecimalValidator } from "../validator/min-decimal.validator";

export class CreatePantryItemDTO {
  @IsString()
  @IsOptional()
  ingredientId?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'customName cannot contain only whitespace.' })
  @IsOptional()
  customName?: string;

  @IsNumberString()
  @Validate(MinDecimalValidator)
  @IsOptional()
  quantity?: string;

  @IsIn(MEASURE_UNITS)
  @IsOptional()
  unit?: (typeof MEASURE_UNITS)[number];
}

export class UpdatePantryItemDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'customName cannot contain only whitespace.' })
  @IsOptional()
  customName?: string;
  
  @IsNumberString()
  @Validate(MinDecimalValidator)
  @IsOptional()
  quantity?: string;

  @IsIn(MEASURE_UNITS)
  @IsOptional()
  unit?: (typeof MEASURE_UNITS)[number];
}
