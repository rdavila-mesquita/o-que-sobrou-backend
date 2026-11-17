#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9653ffa5341f408649279495833c772f0ac7e491a8a0dceb7db6e8d2fa21f81d/contract';
import startContract from '../../snapshots/9653ffa5341f408649279495833c772f0ac7e491a8a0dceb7db6e8d2fa21f81d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bac8a3faee75ff3acb6d8a8c18ff4198119135875d0a8dc020d168d224fceecf/contract';
import endContract from '../../snapshots/bac8a3faee75ff3acb6d8a8c18ff4198119135875d0a8dc020d168d224fceecf/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'pantry_item',
        constraint: 'pantry_item_ingredient_id_fkey',
        kind: 'foreignKey',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_allergens_check_541456a1',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_conditions_check_c1aeaad3',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_dietary_preferences_check_44038eb5',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'ingredients',
        constraint: 'ingredients_allergens_check_541456a1',
      }),
      this.addColumn({
        schema: 'public',
        table: 'generation_requests',
        column: col('generation_options', 'json', { codecRef: { codecId: 'pg/json@1' } }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'health_profiles',
        column: col('updated_at', 'timestamptz', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'pantry_item',
        column: col('updated_at', 'timestamptz', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'recipes',
        column: col('updated_at', 'timestamptz', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'users',
        column: col('updated_at', 'timestamptz', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_allergens_check_b46428e6',
        expression: sql`array_remove("allergens", NULL) <@ '{"GLUTEN","LACTOSE","LEITE","OVO","AMENDOIM","CASTANHAS","SOJA","PEIXE","CRUSTACEOS","GERGELIM"}'`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_conditions_check_00d961c2',
        expression: sql`array_remove("conditions", NULL) <@ '{"DIABETES_TIPO_1","DIABETES_TIPO_2","PRE_DIABETES","HIPERTENSAO","COLESTEROL_ALTO","DOENCA_RENAL","DOENCA_CELIACA","INTOLERANCIA_LACTOSE","GOTA","GASTRITE_REFLUXO"}'`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'health_profiles',
        constraint: 'health_profiles_dietary_preferences_check_2577d58d',
        expression: sql`array_remove("dietary_preferences", NULL) <@ '{"VEGETARIANO","VEGANO","SEM_CARNE_VERMELHA","SEM_PORCO","LOW_CARB","ALTA_PROTEINA"}'`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'ingredients',
        constraint: 'ingredients_allergens_check_b46428e6',
        expression: sql`array_remove("allergens", NULL) <@ '{"GLUTEN","LACTOSE","LEITE","OVO","AMENDOIM","CASTANHAS","SOJA","PEIXE","CRUSTACEOS","GERGELIM"}'`,
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pantry_item',
        foreignKey: {
          name: 'pantry_item_ingredient_id_fkey',
          columns: ['ingredient_id'],
          references: { schema: 'public', table: 'ingredients', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.renameIndex({
        schema: 'public',
        table: 'ingredients',
        from: 'ingredient_name_search_f619d6de',
        to: 'ingredient_name_search_ce67deb5',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
