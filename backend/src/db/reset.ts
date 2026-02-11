import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { pool } from "./client.js";

const DROP_ORDER = [
  "alerts",
  "integration_logs",
  "inventory_usage",
  "form_submissions",
  "inventory_items",
  "form_templates",
  "contact_forms",
  "bookings",
  "availability",
  "booking_types",
  "messages",
  "conversations",
  "contacts",
  "integrations",
  "workspace_users",
  "workspaces",
];

async function reset() {
  console.log("Dropping tables...");
  for (const table of DROP_ORDER) {
    await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }
  console.log("Creating tables...");
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("Database reset complete.");
  await pool.end();
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
