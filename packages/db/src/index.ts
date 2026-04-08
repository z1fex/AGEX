import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema/index";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") || "./data/agency.db";

const sqlite = new Database(DB_PATH);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

export * from "./schema/index";
