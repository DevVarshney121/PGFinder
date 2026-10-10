import { sql } from '@vercel/postgres';
import { readFile } from 'node:fs/promises';
const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
await sql.query(schema);
await sql`INSERT INTO schema_migrations (name) VALUES ('001_initial_schema') ON CONFLICT DO NOTHING`;
console.log('Database schema applied.');
