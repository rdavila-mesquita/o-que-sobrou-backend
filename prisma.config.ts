import { prismaCloud, prismaState } from "@prisma/composer-prisma-cloud/control";
import { defineConfig as composer } from "@prisma/composer/config";
import { nodeBuild } from "@prisma/composer/node/control";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import { definePrismaConfig } from "prisma/config";

process.loadEnvFile();

export default definePrismaConfig({
  skills: {
    agents: [],
  },
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
  composer: composer({
    extensions: [prismaCloud({ region: "us-east-1" }), nodeBuild()],
    state: prismaState(),
  }),
});
