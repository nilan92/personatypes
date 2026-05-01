import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export async function startGoogleSignIn() {
  try {
    const origin = window.location.origin;
    const result = await signIn.social({
      provider: 'google',
      callbackURL: origin,
      errorCallbackURL: `${origin}?error=auth_failed`,
    });

    return result?.error?.message ?? null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Unknown login error';
  }
}
