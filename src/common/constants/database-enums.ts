import { db } from "../../prisma/db";

export const MEASURE_UNITS = db.enums.public.MeasureUnit.values;

export const INGREDIENT_SOURCES = db.enums.public.IngredientSource.values;

export const DIFFICULTIES = db.enums.public.Difficulty.values;

export const GENERATION_STATUSES = db.enums.public.GenerationStatus.values;

export const DIETARY_PREFERENCES = db.enums.public.DietaryPreference.values;

export const ALLERGENS = db.enums.public.Allergen.values;

export const HEALTH_CONDITIONS = db.enums.public.HealthCondition.values;
