import 'server-only';

import { getSql } from './db';
import { auth } from './auth-server';

export async function getAdminSession() {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user?.id) {
    return null;
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 1 FROM public.admin_users WHERE user_id = ${session.user.id} LIMIT 1
    `;
    if (!rows.length) return null;
  } catch {
    return null;
  }

  return session;
}
