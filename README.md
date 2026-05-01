## Persona Atlas

This is a Next.js app for running personality assessments with Google sign-in
through Neon Auth and Neon Postgres. Completed assessment results are saved to
the signed-in user profile and also mirrored locally for resilience.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

5. Open `https://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_NEON_AUTH_URL`: Neon Auth URL for your project.
- `NEON_AUTH_COOKIE_SECRET`: long random secret used to sign auth cookies.
- `DATABASE_URL`: Neon Postgres connection string used to save assessment results.
- `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`: optional. Your AdSense publisher ID in `ca-pub-...` form.
- `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT`: optional. A real AdSense ad unit slot ID.

## Recommended Hosting

- App hosting: Vercel
- Auth: Neon Auth
- Database persistence: Neon Postgres

## Vercel Deployment

1. Push the `pim-app` folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example` in Vercel project settings.
4. Deploy the project.
5. In Neon Auth, make sure your production domain is allowed for auth callbacks.
6. In Google AdSense, add your deployed site to the `Sites` list and wait until it is ready to show ads.

## Current Limitations

- Local storage is still used as a fallback cache, so a failed network sync can leave a result saved only on that device until the next successful login sync.
- Google AdSense only appears after you set a real publisher ID and a real ad slot ID.
