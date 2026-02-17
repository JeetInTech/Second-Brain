// Prisma configuration for Second Brain
// Reads DATABASE_URL from .env and points to the schema file.
import { defineConfig } from "prisma/config";
import path from "node:path";
import { config } from "dotenv";

// Manually load .env since Prisma config skips automatic env loading
config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
    directUrl: process.env["DIRECT_URL"],
  },
});
