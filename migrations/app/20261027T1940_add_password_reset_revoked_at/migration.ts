#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/e90012b5f35bb26e91cfab43c88f4c66eddeb402a505fecea5977db81c28b519/contract';
import startContract from '../../snapshots/e90012b5f35bb26e91cfab43c88f4c66eddeb402a505fecea5977db81c28b519/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f6a45db6d3f3f5e1198da9c09f7313aa4e0ed6efb4dba5f9f43bd947d111ed24/contract';
import endContract from '../../snapshots/f6a45db6d3f3f5e1198da9c09f7313aa4e0ed6efb4dba5f9f43bd947d111ed24/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'password_reset',
        column: col('revoked_at', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-date@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
