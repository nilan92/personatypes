import 'server-only';

import { auth } from './auth-server';

export async function getAdminSession() {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user?.id) {
    return null;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (session.user.email ?? '').toLowerCase();

  if (!adminEmails.length || !adminEmails.includes(userEmail)) {
    return null;
  }

  return session;
}
