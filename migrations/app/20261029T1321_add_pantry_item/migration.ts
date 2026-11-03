#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/9653ffa5341f408649279495833c772f0ac7e491a8a0dceb7db6e8d2fa21f81d/contract';
import endContract from '../../snapshots/9653ffa5341f408649279495833c772f0ac7e491a8a0dceb7db6e8d2fa21f81d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f6a45db6d3f3f5e1198da9c09f7313aa4e0ed6efb4dba5f9f43bd947d111ed24/contract';
import startContract from '../../snapshots/f6a45db6d3f3f5e1198da9c09f7313aa4e0ed6efb4dba5f9f43bd947d111ed24/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'pantry_item',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('custom_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ingredient_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('unit', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'pantry_item_unit_check_daaa4240',
            `"unit" IN ('G', 'KG', 'ML', 'L', 'XICARA', 'COLHER_SOPA', 'COLHER_CHA', 'UNIDADE', 'FATIA', 'DENTE', 'PITADA', 'A_GOSTO')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pantry_item',
        index: 'pantry_item_ingredient_id_idx_30032a11',
        columns: ['ingredient_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pantry_item',
        index: 'pantry_item_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pantry_item',
        index: 'pantry_item_user_id_ingredient_id_idx_e46585f1',
        columns: ['user_id', 'ingredient_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pantry_item',
        foreignKey: {
          name: 'pantry_item_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pantry_item',
        foreignKey: {
          name: 'pantry_item_ingredient_id_fkey',
          columns: ['ingredient_id'],
          references: { schema: 'public', table: 'ingredients', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
