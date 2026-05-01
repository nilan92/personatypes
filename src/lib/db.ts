import 'server-only';

import { neon } from '@neondatabase/serverless';

let cachedSql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (cachedSql) {
    return cachedSql;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required config: DATABASE_URL');
  }

  cachedSql = neon(databaseUrl);
  return cachedSql;
}
