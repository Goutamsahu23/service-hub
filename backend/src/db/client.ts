import pg from "pg";
import { config } from "../config/index.js";

const { Pool } = pg;

const databaseUrl = config.databaseUrl ?? "";
let poolConfig: pg.PoolConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
};

if (databaseUrl && databaseUrl.startsWith("postgres")) {
  try {
    const url = new URL(databaseUrl);
    poolConfig = {
      ...poolConfig,
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 5432,
      database: url.pathname.slice(1).replace(/\/$/, "") || "ops_platform",
      user: url.username || undefined,
      password: typeof url.password === "string" ? decodeURIComponent(url.password) : "",
      ssl: url.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : false,
    };
  } catch {
    poolConfig.connectionString = databaseUrl;
  }
} else {
  poolConfig.connectionString = databaseUrl;
}

export const pool = new Pool(poolConfig);

export const db = {
  async init() {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
  },
  query(text: string, params?: unknown[]) {
    return pool.query(text, params);
  },
};
