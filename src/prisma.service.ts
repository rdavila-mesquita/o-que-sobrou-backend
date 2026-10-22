import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { connectDatabase, db } from "./prisma/db";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db = db;

  get orm() {
    return this.db.orm;
  }

  get sql() {
    return this.db.sql;
  }

  get transaction() {
    return this.db.transaction.bind(this.db);
  }

  async onModuleInit(): Promise<void> {
    await connectDatabase();
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.close();
  }
}
