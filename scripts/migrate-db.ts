import fs from "fs";
import path from "path";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const migrationPath = path.join(
  process.cwd(),
  "db",
  "migrations",
  "001_vector_statutes.sql",
);

if (!fs.existsSync(migrationPath)) {
  throw new Error(`Migration not found: ${migrationPath}`);
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query(fs.readFileSync(migrationPath, "utf8"));
    console.log(`Applied ${path.basename(migrationPath)}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
