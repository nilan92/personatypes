import 'server-only';

import { createNeonAuth } from '@neondatabase/auth/next/server';

// createNeonAuth() reads NEON_AUTH_COOKIE_SECRET at call time and throws if
// it's missing.  That env var is only available at runtime, not during
// Next.js's build-time static-analysis pass.  We defer instantiation to the
// first actual request by forwarding all property accesses through a Proxy.

type Auth = ReturnType<typeof createNeonAuth>;

let _instance: Auth | undefined;

function getInstance(): Auth {
  return (_instance ??= createNeonAuth({
    baseUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  }));
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop: string | symbol) {
    const inst = getInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (inst as any)[prop];
    return typeof val === 'function' ? (val as (...a: unknown[]) => unknown).bind(inst) : val;
  },
});
