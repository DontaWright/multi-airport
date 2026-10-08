import "server-only";
import pg from "pg";

// ---------- PostgreSQL Connection Pool ----------
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ---------- Database Query Helper ----------
export async function query(text, params) {
  return pool.query(text, params);
}
