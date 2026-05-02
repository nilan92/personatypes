import { auth } from '@/lib/auth-server';

// auth.handler() is called at request time, not module load time.
// The previous `export const { GET, POST } = auth.handler()` pattern
// triggered the Proxy get trap during Next.js build-phase module evaluation,
// causing createNeonAuth() to throw (NEON_AUTH_COOKIE_SECRET absent at build).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(...args: any[]) {
  const { GET: handler } = auth.handler();
  return handler(...args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(...args: any[]) {
  const { POST: handler } = auth.handler();
  return handler(...args);
}
