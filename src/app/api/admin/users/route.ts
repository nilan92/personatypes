import { NextResponse } from 'next/server';

import { getSql } from '@/lib/db';
import { getAdminSession } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getSql();

  const [users, latestResults] = await Promise.all([
    sql`
      SELECT
        u.id,
        u.email,
        u.name,
        u.created_at,
        COUNT(ar.id)::int                       AS total_attempts,
        COUNT(DISTINCT ar.assessment_key)::int  AS assessments_completed
      FROM neon_auth.users_sync u
      LEFT JOIN public.assessment_results ar ON ar.user_id = u.id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.email, u.name, u.created_at
      ORDER BY u.created_at DESC
    `,
    sql`
      SELECT DISTINCT ON (user_id, assessment_key)
        user_id,
        assessment_key,
        result_data,
        created_at
      FROM public.assessment_results
      ORDER BY user_id, assessment_key, created_at DESC, id DESC
    `,
  ]);

  return NextResponse.json({ users, latestResults });
}
