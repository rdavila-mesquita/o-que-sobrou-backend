import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf } from "class-validator";

enum MeasureUnit {
  G,
  KG,
  ML,
  L,
  XICARA,
  COLHER_SOPA,
  COLHER_CHA,
  UNIDADE,
  FATIA,
  DENTE,
  PITADA,
  A_GOSTO
}

export class CreatePantryIntem {
  @IsString()
  @IsOptional()
  ingredientId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(value => value.ingredientId != value.customName)
  customName?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  quantity?: number;

  @IsEnum(MeasureUnit)
  @IsOptional()
  unit?: MeasureUnit;
}
