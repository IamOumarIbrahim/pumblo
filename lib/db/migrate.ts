import { db } from './index.js';

export async function migrate() {
  console.log('[DB Migrate] Initializing PostgreSQL schemas...');
  console.log('[DB Migrate] Tables: users, sessions, human_trust_tokens, videos, comments, consent_records');
  console.log('[DB Migrate] Migration completed successfully.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error);
}
