// npm install --save-dev prisma dotenv
import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig, env } from "prisma/config";

// dotenv/config は .env のみ。秘密は .env.local にあるので明示的に読む
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_URL ??
      process.env.PRISMA_DATABASE_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      env("DATABASE_URL"),
  },
});
