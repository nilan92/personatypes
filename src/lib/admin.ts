import 'server-only';

import { getSql } from './db';

export async function getAdminSession() {
  const { auth } = await import('./auth-server');
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user?.id) {
    return null;
  }

  // Check 1: ADMIN_EMAILS env var (comma-separated, set in Vercel env settings)
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length && adminEmails.includes((session.user.email ?? '').toLowerCase())) {
    return session;
  }

  // Check 2: public.admin_users table (managed directly in Neon)
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT 1 FROM public.admin_users WHERE user_id = ${session.user.id} LIMIT 1
    `) as unknown[];
    if (rows.length) return session;
  } catch {
    // table may not exist yet — fall through
  }

  return null;
}
