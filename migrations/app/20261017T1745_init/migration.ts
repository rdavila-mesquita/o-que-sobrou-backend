#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/53dabd141b4a4543c65872c0e971bfc8d0d6ef89d917a345aeb85db10a7bbfc3/contract';
import endContract from '../../snapshots/53dabd141b4a4543c65872c0e971bfc8d0d6ef89d917a345aeb85db10a7bbfc3/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'favorites',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('recipe_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['user_id', 'recipe_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'generation_requests',
        columns: [
          col('attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('completion_tokens', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('error_message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('finished_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('health_snapshot', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('input_ingredients', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('model', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('prompt_tokens', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('validation_report', 'json', { codecRef: { codecId: 'pg/json@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'generation_requests_input_ingredients_elem_not_null_686267ba',
            'array_position("input_ingredients", NULL) IS NULL',
          ),
          checkExpression(
            'generation_requests_status_check_4bc8cb75',
            `"status" IN ('PENDING', 'SUCCEEDED', 'REJECTED_BY_SAFETY', 'FAILED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'health_profiles',
        columns: [
          col('allergens', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('conditions', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('daily_calorie_target', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('dietary_preferences', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('disclaimer_accepted_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('disliked_ingredients', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'health_profiles_allergens_check_541456a1',
            `array_remove("allergens"::text[], NULL) <@ ARRAY['GLUTEN', 'LACTOSE', 'LEITE', 'OVO', 'AMENDOIM', 'CASTANHAS', 'SOJA', 'PEIXE', 'CRUSTACEOS', 'GERGELIM']::text[]`,
          ),
          checkExpression(
            'health_profiles_allergens_elem_not_null_a997b371',
            'array_position("allergens", NULL) IS NULL',
          ),
          checkExpression(
            'health_profiles_conditions_check_c1aeaad3',
            `array_remove("conditions"::text[], NULL) <@ ARRAY['DIABETES_TIPO_1', 'DIABETES_TIPO_2', 'PRE_DIABETES', 'HIPERTENSAO', 'COLESTEROL_ALTO', 'DOENCA_RENAL', 'DOENCA_CELIACA', 'INTOLERANCIA_LACTOSE', 'GOTA', 'GASTRITE_REFLUXO']::text[]`,
          ),
          checkExpression(
            'health_profiles_conditions_elem_not_null_7c338730',
            'array_position("conditions", NULL) IS NULL',
          ),
          checkExpression(
            'health_profiles_dietary_preferences_check_44038eb5',
            `array_remove("dietary_preferences"::text[], NULL) <@ ARRAY['VEGETARIANO', 'VEGANO', 'SEM_CARNE_VERMELHA', 'SEM_PORCO', 'LOW_CARB', 'ALTA_PROTEINA']::text[]`,
          ),
          checkExpression(
            'health_profiles_dietary_preferences_elem_not_null_71949628',
            'array_position("dietary_preferences", NULL) IS NULL',
          ),
          checkExpression(
            'health_profiles_disliked_ingredients_elem_not_null_3fc5c9e2',
            'array_position("disliked_ingredients", NULL) IS NULL',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'ingredients',
        columns: [
          col('aliases', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('allergens', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('carbs_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('energy_kcal', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('external_code', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fat_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('fiber_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('glycemic_index', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('grams_per_ml', 'numeric(6,3)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 6, scale: 3 } },
          }),
          col('grams_per_unit', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('protein_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('saturated_fat_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sodium_mg', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('source', 'text', {
            notNull: true,
            default: lit('TACO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('sugars_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'ingredients_aliases_elem_not_null_3676266c',
            'array_position("aliases", NULL) IS NULL',
          ),
          checkExpression(
            'ingredients_allergens_check_541456a1',
            `array_remove("allergens"::text[], NULL) <@ ARRAY['GLUTEN', 'LACTOSE', 'LEITE', 'OVO', 'AMENDOIM', 'CASTANHAS', 'SOJA', 'PEIXE', 'CRUSTACEOS', 'GERGELIM']::text[]`,
          ),
          checkExpression(
            'ingredients_allergens_elem_not_null_a997b371',
            'array_position("allergens", NULL) IS NULL',
          ),
          checkExpression(
            'ingredients_source_check_66b87911',
            `"source" IN ('TACO', 'USDA', 'CUSTOM')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'recipe_ingredients',
        columns: [
          col('from_pantry', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('grams', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ingredient_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('position', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('recipe_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('unit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'recipe_ingredients_unit_check_daaa4240',
            `"unit" IN ('G', 'KG', 'ML', 'L', 'XICARA', 'COLHER_SOPA', 'COLHER_CHA', 'UNIDADE', 'FATIA', 'DENTE', 'PITADA', 'A_GOSTO')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'recipe_nutrition',
        columns: [
          col('calculated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('carbs_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('coverage_percent', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('energy_kcal', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('fat_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('fiber_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('protein_g', 'numeric(8,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('recipe_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('saturated_fat_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('sodium_mg', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
          col('sugars_g', 'numeric(8,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 8, scale: 2 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'recipe_steps',
        columns: [
          col('duration_minutes', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('instruction', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('position', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('recipe_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'recipes',
        columns: [
          col('cook_time_minutes', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('difficulty', 'text', {
            notNull: true,
            default: lit('FACIL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('generation_request_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('prep_time_minutes', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('servings', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tips', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'recipes_difficulty_check_735302a2',
            `"difficulty" IN ('FACIL', 'MEDIO', 'DIFICIL')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'refresh_tokens',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('expires_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('revoked_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('token_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_agent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_user_id_key',
        columns: ['user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ingredients',
        constraint: 'ingredients_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'recipe_nutrition',
        constraint: 'recipe_nutrition_recipe_id_key',
        columns: ['recipe_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'recipe_steps',
        constraint: 'recipe_steps_recipe_id_position_key',
        columns: ['recipe_id', 'position'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'recipes',
        constraint: 'recipes_generation_request_id_key',
        columns: ['generation_request_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'refresh_tokens',
        constraint: 'refresh_tokens_token_hash_key',
        columns: ['token_hash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorites',
        index: 'favorites_recipe_id_idx_bc78e692',
        columns: ['recipe_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorites',
        index: 'favorites_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'generation_requests',
        index: 'generation_requests_user_id_created_at_idx_b562028f',
        columns: ['user_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'generation_requests',
        index: 'generation_requests_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ingredients',
        index: 'ingredient_name_search_f619d6de',
        expression: `to_tsvector('portuguese', "name")`,
        extras: { type: 'gin' },
      }),
      this.createIndex({
        schema: 'public',
        table: 'ingredients',
        index: 'ingredients_name_idx_ce87e6ba',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'recipe_ingredients',
        index: 'recipe_ingredients_ingredient_id_idx_30032a11',
        columns: ['ingredient_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'recipe_ingredients',
        index: 'recipe_ingredients_recipe_id_idx_bc78e692',
        columns: ['recipe_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'recipe_steps',
        index: 'recipe_steps_recipe_id_idx_bc78e692',
        columns: ['recipe_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'recipes',
        index: 'recipes_user_id_created_at_idx_b562028f',
        columns: ['user_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'recipes',
        index: 'recipes_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refresh_tokens',
        index: 'refresh_tokens_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_recipe_id_fkey',
          columns: ['recipe_id'],
          references: { schema: 'public', table: 'recipes', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'generation_requests',
        foreignKey: {
          name: 'generation_requests_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'health_profiles',
        foreignKey: {
          name: 'health_profiles_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipe_ingredients',
        foreignKey: {
          name: 'recipe_ingredients_recipe_id_fkey',
          columns: ['recipe_id'],
          references: { schema: 'public', table: 'recipes', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipe_ingredients',
        foreignKey: {
          name: 'recipe_ingredients_ingredient_id_fkey',
          columns: ['ingredient_id'],
          references: { schema: 'public', table: 'ingredients', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipe_nutrition',
        foreignKey: {
          name: 'recipe_nutrition_recipe_id_fkey',
          columns: ['recipe_id'],
          references: { schema: 'public', table: 'recipes', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipe_steps',
        foreignKey: {
          name: 'recipe_steps_recipe_id_fkey',
          columns: ['recipe_id'],
          references: { schema: 'public', table: 'recipes', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipes',
        foreignKey: {
          name: 'recipes_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'recipes',
        foreignKey: {
          name: 'recipes_generation_request_id_fkey',
          columns: ['generation_request_id'],
          references: { schema: 'public', table: 'generation_requests', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refresh_tokens',
        foreignKey: {
          name: 'refresh_tokens_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
