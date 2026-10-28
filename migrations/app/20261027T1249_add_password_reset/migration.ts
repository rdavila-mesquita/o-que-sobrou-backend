#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/532971ebc075bcd8136d65c97f74115a58f5c5e72db25112127c18b9c1535db4/contract';
import startContract from '../../snapshots/532971ebc075bcd8136d65c97f74115a58f5c5e72db25112127c18b9c1535db4/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e90012b5f35bb26e91cfab43c88f4c66eddeb402a505fecea5977db81c28b519/contract';
import endContract from '../../snapshots/e90012b5f35bb26e91cfab43c88f4c66eddeb402a505fecea5977db81c28b519/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'password_reset',
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
          col('token_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('used_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'password_reset',
        constraint: 'password_reset_token_hash_key',
        columns: ['token_hash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'password_reset',
        index: 'password_reset_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'password_reset',
        foreignKey: {
          name: 'password_reset_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
