import 'server-only';

import { getSql } from './db';

export async function getAdminSession() {
  // Dynamic import keeps auth-server.ts out of the module-evaluation graph
  // at build time — createNeonAuth() needs NEON_AUTH_COOKIE_SECRET which is
  // only available at runtime, not during Next.js's static-analysis phase.
  const { auth } = await import('./auth-server');
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user?.id) {
    return null;
  }

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT 1 FROM public.admin_users WHERE user_id = ${session.user.id} LIMIT 1
    `) as unknown[];
    if (!rows.length) return null;
  } catch {
    return null;
  }

  return session;
}
