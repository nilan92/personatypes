import type { AdminUserRow, AdminLatestResult } from '@/components/AdminDashboard';
import { getAdminSession } from '@/lib/admin';
import { getSql } from '@/lib/db';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

async function fetchAdminData() {
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
  return {
    users: users as AdminUserRow[],
    latestResults: latestResults as AdminLatestResult[],
  };
}

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '6rem auto',
          textAlign: 'center',
          padding: '3rem',
        }}
        className="glass"
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          You don&apos;t have permission to view this page. Admin access is managed via the{' '}
          <code style={{ fontSize: '0.85rem', opacity: 0.8 }}>admin_users</code> table in Neon.
        </p>
      </div>
    );
  }

  const { users, latestResults } = await fetchAdminData();

  return <AdminDashboard users={users} latestResults={latestResults} />;
}
