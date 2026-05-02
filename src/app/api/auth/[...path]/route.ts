import { auth } from '@/lib/auth-server';

// auth.handler() is called at request time, not module load time.
// The previous `export const { GET, POST } = auth.handler()` pattern
// triggered the Proxy get trap during Next.js build-phase module evaluation,
// causing createNeonAuth() to throw (NEON_AUTH_COOKIE_SECRET absent at build).

export async function GET(request: Request, context: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth.handler().GET as any)(request, context);
}

export async function POST(request: Request, context: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth.handler().POST as any)(request, context);
}
